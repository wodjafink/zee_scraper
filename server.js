var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/hw18populater");

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://news.ycombinator.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    var points = [];
    var ages = [];
    var comments = [];

    // // Get all the points by a specific parameter for cheerio
    // $("table.itemlist tr td.subtext span.score").each(function(i, element){
    //   var score = $(this).text().split(" ");
    //   points.push(parseInt(score));
    // })

    // // Get all the ages by a specific parameter for cheerio
    // $("table.itemlist tr td.subtext span.age").each(function(i, element){
    //   var age = $(this).children().text();
    //   ages.push(age);
    // })

    // // Get all the comments by a specific parameter for cheerio, have to find
    // // the one that contains comments in it's text!
    // $("table.itemlist tr td.subtext").each(function(i, element){
    //   $(this).children().each(function(i, element){
    //     if($(this).text().includes("comments")){
    //       comments.push(parseInt($(this).text()))
    //     }
    //   })
    // })

    $("table.itemlist tr td.subtext").each(function(i, element){
      // console.log("i is "+ i + " children is " + $(this).children().length)

      if ($(this).find("span.score").length <= 0){
        points.push(0);
      } else {
        var score = $(this).children("span.score").text().split(" ");
        points.push(parseInt(score));
      }

      ages.push($(this).find("span.age").text());


      // Okay, you may be wondering, why did this need to be so complicated?
      // There are some articles that have less in the subtext section; these
      // are promoted articles that don't have any comments.  So these we will
      // filter out for easily by looking at the number of children
      if ($(this).children().length < 6){
        comments.push("No comments yet");
      } else {
        // However, in the case that there are enough children, we still may not 
        // have any comments.  So check to see if the children have the word 'comment'
        $(this).children().each(function(i, element){
          if($(this).text().includes("comment")){
            var aComment = $(this).text();
            // console.log(aComment)
            comments.push(aComment)
            // If they have the word 'discuss' it's the same as the earlier case above
          } else if ($(this).text().includes("discuss")){
            comments.push("No comments yet");
          }
        })
      }
    })

    // Now, we grab every h2 within an article tag, and do the following:
    $(".athing").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children(".title")
        .children(".storylink")
        .text();
      result.points = points[i]
      result.comments = comments[i]
      result.age = ages[i]
      result.link = $(this)
        .children(".title")
        .children(".storylink")
        .attr("href");

      // console.log("Title " + result.title);
      // console.log("Score " + result.points);
      // console.log("Age " + result.age);
      // console.log("Link " + result.link);
      // console.log("Comments " + result.comments);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(dbArticles){
      res.json(dbArticles);
    })
    .catch(function(err){
      res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findById(req.params.id)
    .populate("note")
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    }) 
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
    .then(function(dbNote) {
      // return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    }) 
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
