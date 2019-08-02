//jshint esversion:6
var filmList = [];
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
const ejs = require("ejs");
const jquery = require("jquery");
var watchTime = 0;
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
const imdb = require('imdb-api');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/filmsDB", {
  useNewUrlParser: true
});
const cli = new imdb.Client({
  apiKey: '72a88016',
  timeout: 30000
});
const filmSchema = new mongoose.Schema({
  name: String,
  year: Number,
  genre: String,
  director: String,
  age: String,
  actors: String,
  language: String,
  awards: String,
  ratings: Array,
  rating: Number,
  poster: String,
  plot: String,
  id: String,
  url: String,
  time: String,
  type: String
});
function capital_letter(str) {
  str = str.split(" ");

  for (var i = 0, x = str.length; i < x; i++) {
    str[i] = str[i][0].toUpperCase() + str[i].substr(1);
  }

  return str.join(" ");
}
const Film = mongoose.model("Film", filmSchema);
var film = new Film();
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});
app.get("/", function (req, res) {
  res.render("index");
});
app.get("/film/:filmId",function(req,res){
  const filmId =req.params.filmId;
  
      cli.get({
          id: filmId,
        }).then((movie) => {
          res.render("film",{
            movie: movie
          });
          });
    
});
app.get("/list", function (req, res) {
  Film.find(function (err, films) {
    if (err) {
      console.log(err);
    } else {
      // mongoose.connection.close();
      res.render("list", {
        films: films,
        watchTime: watchTime
      });
    }
  });
});


app.post("/", function (req, res) {
  const title = req.body.sub;
  cli.get({
    name: title
  }).then((movie) => {
    console.log(movie);
    
    film = new Film({
      name: movie.title,
      year: movie.year,
      genre: movie.genres,
      director: movie.director,
      age: movie.rated,
      actors: movie.actors,
      language: movie.languages,
      awards: movie.awards,
      ratings: movie.ratings,
      rating: movie.rating,
      poster: movie.poster,
      plot: movie.plot,
      id: movie.imdbid,
      url: movie.imdburl,
      time: movie.runtime,
      type: movie.type
    });
    Film.find({},function (err, Films) {
      var t=0;
      Films.forEach(function(result){
        if(film.name == result.name){
          console.log("already added");
          t=1;
        }
      });
      if (t==0) {
        console.log("added!");
        film.save();
      }
      res.redirect("/list");
    });
    

  });



});

app.post("/delete", function (req, res) {
  const checkedItemName = req.body.checkbox;

  Film.findOneAndDelete({"name":checkedItemName}, function (err) {
    if (!err) {
      
      console.log("Succesfully deleted checked item.");
      res.redirect("/list");
    }
  });
});
app.post("/search", function (req, res) {
  const name = req.body.search;
 cli.search({
   'name': name
 }).then((search) => {
   
   
   res.render("result",{search: search});
  //  for (const result of search.results) {
  //    console.log(result);
  //  }
 });

  // res.redirect("/film/"+name);
});
app.listen(3000, function () {

  console.log("Server running on port 3000");
  
});

//88d48db
//72a88016
