// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $("#articles").append("<div data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].points + "<br />" + data[i].comments + "<br />" + data[i].link + "</div>");
    $("#articles").append("<tr data-id='" + data[i]._id + "'> <td> " + data[i].title + "</td> <td> " + data[i].points + "</td> <td> " + data[i].comments + "</td><td> " + data[i].link + "</td> <td> " + data[i].age + "</td></tr>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", "tr", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Open the modal
  $('#exampleModal').modal('show');

  $('#myInput').trigger('focus')
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
  // With that done, add the note information to the page
  .then(function(data) {
    console.log(data);
    // The title of the article
    $("#exampleModalLabel").text(data.title);
    // // An input to enter a new title
    // $(".modal-body").append("<input id='titleinput' name='title' >");
    // // A textarea to add a new note body
    // $(".modal-body").append("<textarea id='bodyinput' name='body'></textarea>");
    // A button to submit a new note, with the id of the article saved to it
    $("#savenote").attr("data-id", data._id);

    // If there's a note in the article
    if (data.note) {
      // Place the title of the note in the title input
      $("#titleinput").val(data.note.title);
      // Place the body of the note in the body textarea
      $("#bodyinput").val(data.note.body);
    }
  });

});

// $('#exampleModal').on('show.bs.modal', function () {

// });
// When you click the savenote button
$(document).on("click", "#savenote", function() {

  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");

  $('#exampleModal').modal('hide')


});

