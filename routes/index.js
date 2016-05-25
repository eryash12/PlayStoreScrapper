var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var Firebase = require('firebase');
var appData = new Firebase('https://play-store-app-data.firebaseio.com/');
//var topFree = new Firebase('https://play-store-app-data.firebaseio.com/top-free');
var mysql = require('mysql');
var db1 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database : 'google_play_store_app_data'
});
db1.connect();
/* GET home page. */
//router.get('/', function(req, res, next) {
//  //res.send("Hello World");
//  res.render('index', { title: 'Express' });
//  console.log(req);
//  //console.log(res);
//});
var phantom = require('phantom');
var Horseman = require('node-horseman');
var fs = require('fs');

  var hm = new Horseman();
  var linksToParse = [{'topfree':'https://play.google.com/store/apps/collection/topselling_free?hl=en'},{'topPaid':'https://play.google.com/store/apps/collection/topselling_paid'},{'topGrossing':'https://play.google.com/store/apps/collection/topgrossing?hl=en'},{'topFreeGames':'https://play.google.com/store/apps/category/GAME/collection/topselling_free?hl=en'},{'topPaidGames':'https://play.google.com/store/apps/category/GAME/collection/topselling_paid?hl=en'},{'topGrossingGames':'https://play.google.com/store/apps/category/GAME/collection/topgrossing?hl=en'}];
  var allLinks = [];

fs.readFile('allLinks.json', function(err,data) {
  if (err)
  throw err;
  data = JSON.parse(data);
  //console.log(data);

  getApplicationData(data);
});

function getApplicationData(allLinks) {

  if(allLinks.length !== 0) {
    scrapeCategory(allLinks.pop());
  }
  else{
    console.log('Done');
  }
  function scrapeCategory(thisCategory){

      for(cat in thisCategory){
       var appData = new Firebase('https://play-store-app-data.firebaseio.com/'+cat);
       var arr = thisCategory[cat];
        scrapeThisLink(arr.pop());
      }
      function scrapeThisLink(url) {
        //console.log('main');
        if(url.hasOwnProperty('url')) {
          var appDetails = {};
          request('https://play.google.com'+url.url, function (error, response, html) {
            if (!error) {
              var $ = cheerio.load(html);
              appDetails.name = $('.id-app-title').text();
              console.log(appDetails.name);
              appDetails.avgRating = $('.score-container .score').text();
              appDetails.fiveStarRatings = $('.five .bar-number').text();
              appDetails.fourStarRatings = $('.four .bar-number').text();
              appDetails.threeStarRatings = $('.three .bar-number').text();
              appDetails.twoStarRatings = $('.two .bar-number').text();
              appDetails.oneStarRatings = $('.one .bar-number').text();
              appDetails.reviews = [];
              $('.featured-review').each(function (i, e) {
                var review = {};
                review.author = $(this).find('.author-name').text();
                review.text = $(this).find('.quoted-review').text();
                appDetails.reviews.push(review);
              });
              appDetails.publisher = $('.primary').text();
              appDetails.category = $('.category').text();
              appDetails.downloads = $('.content').attr('data-itemprop', 'numDownloads').text();

              $('.meta-info').each(function (i, e) {
                if ($(this).find('.title').text() === "Installs") {
                  appDetails.downloads = $(this).find('.content').text();
                }
              });

              //appData.push(appDetails);
              appDetails.reviews = JSON.stringify(appDetails.reviews);
              var query = db1.query('INSERT INTO '+cat+' SET ?', appDetails, function(err, result) {
                // Neat!
                if(err)
                console.log(err);
                else
                console.log('push');
              });

              //res.json(appDetails);
              if (arr.length !== 0){
                scrapeThisLink(arr.pop());
              }
              else{
                getApplicationData(allLinks);
              }
            }
          })

        }
        else {
          if (arr.length !== 0) {

            scrapeThisLink(arr.pop());
          }
          else {
            getApplicationData(allLinks);
          }
        }
      }
  }

}

//
//
//
//module.exports = router;
