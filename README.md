# zee_scraper

[I made my scraper for Hacker News (ycombinator)] (https://news.ycombinator.com/)

The format for the html of this site is interesting, but basically it makes it difficult to just fish around for a particular class to get all the information I displayed, so I had to dive into Cheerio a bit more than I had planned

Some interesting things I've learned on this assignment using the Cheerio package:

1. Since I had to look for a 'score' which I call the number of points, and it isn't on every article (new articles or promoted articles do not receive a score), I had to use the `find()` method:

```javascript
      if ($(this).find("span.score").length <= 0){
        points.push(0);
      } else {
        var score = $(this).children("span.score").text().split(" ");
        points.push(parseInt(score));
      }
```

2.  Since I wanted to also add the number of comments for the landing page for this site, I also took the time to come up wityh a way to determine if there were comments and add if found.  Similar to the score, there are instances where an element (article) wouldn't have comments.  But this was a bit more complicated because this HTML element didn't have a unique class.  So I finally got a bit of complicated logic to work consistently:

```javascript
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
```

[The App is deployed on Heroku here] (https://thawing-waters-55033.herokuapp.com/)
