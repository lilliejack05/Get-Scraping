var express = require('express');
var axios = require("axios");
var cheerio = require('cheerio');
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

// mongoose to in JavaScript ES6 Promises
mongoose.Promise = Promise;

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.render("index");
});

// get the articles scraped and saved in db and show them in list.
router.get("/savedarticles", function(req, res) {

  // grabs doc in the Articles array
  Article.find({}, function(error, doc) {
    //  errors
    if (error) {
      console.log(error);
    }
    // send the doc to the browser as a json object
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});

//  GET request to scrape the echojs website
router.post("/scrape", function(req, res) {

  //  grab the body of the html with request
  request("http://www.nbcnews.com/tech", function(error, response, html) {
    //  load into cheerio and save it to $ for a selector
    var $ = cheerio.load(html);

    // emptry array for temporarily saving and showing scraped Articles.
    var scrapedArticles = {};
    //  grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // empty result object
      var result = {};

      // text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();

      console.log("What's the result title? " + result.title);
      
      result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    console.log("Scraped Articles object built nicely: " + scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

router.post("/save", function(req, res) {

  console.log("This is the title: " + req.body.title);

  var newArticleObject = {};

  newArticleObject.title = req.body.title;

  newArticleObject.url = req.body.url;

  var entry = new Article(newArticleObject);

  console.log("We can save the article: " + entry);

  // save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);

  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.redirect("/savedarticles");
  });
});

router.get("/notes/:id", function(req, res) {

  console.log("ID is getting read for delete" + req.params.id);

  console.log("Able to activate delete function.");

  Comment.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.send(doc);
  });
});

// This will grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {

  console.log("ID is getting read" + req.params.id);

  
  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get notes.");
    }
    else {
      console.log("We are getting article and maybe notes? " + doc);
      res.json(doc);
    }
  });
});

//  new comment or replace an existing note
router.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  var newComment = new Note(req.body);
  // And save the new note the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } 
    else {
      // Use the article id to find it and then push note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          console.log("On note save we are getting notes? " + doc.notes);
          res.send(doc);
        }
      });
    }
  });
});
// Export routes for server.js to use.
module.exports = router;