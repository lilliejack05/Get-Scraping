var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var request = require("request");


// models
var db = require("./models");

//port
var PORT = process.env.PORT || 3000;

//Initialize Express
var app = express();

// logger for logging requests
app.use(logger("dev"));

//Set up a static folder (public) for our web app.
app.use(express.static("public"));

//setting up the database
mongoose.Promise = Promise;

 // Mongoose (orm) connects to our mongo db and allows us to have access to the MongoDB commands for easy CRUD 
// deployed, use the deployed database. 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

//Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Parse application/json
app.use(bodyParser.json());

// handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars")

// Import routes and give the server access to them.
require("./controllers/fetch.js")(app);
require("./controllers/headline.js")(app);
require("./controllers/comment.js")(app);

//listen on port 3000
app.listen(PORT, function() {
    console.log("App running on port 3000");
})