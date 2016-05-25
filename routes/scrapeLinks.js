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
    password: ''
});
db1.connect();
var phantom = require('phantom');
var Horseman = require('node-horseman');
var fs = require('fs');

var hm = new Horseman();
var linksToParse = [{'topfree':'https://play.google.com/store/apps/collection/topselling_free?hl=en'},{'topPaid':'https://play.google.com/store/apps/collection/topselling_paid'},{'topGrossing':'https://play.google.com/store/apps/collection/topgrossing?hl=en'},{'topFreeGames':'https://play.google.com/store/apps/category/GAME/collection/topselling_free?hl=en'},{'topPaidGames':'https://play.google.com/store/apps/category/GAME/collection/topselling_paid?hl=en'},{'topGrossingGames':'https://play.google.com/store/apps/category/GAME/collection/topgrossing?hl=en'}];
var allLinks = [];

  (function getLinks(url){
    for(key in url){
        console.log(key);
        hm.viewport(1000, 1000).open(url[key])
            .scrollTo(20000, 0)
            .wait(5000)
            .scrollTo(20000, 0)
            .wait(5000)
            .scrollTo(20000, 0)
            .wait(5000)
            .scrollTo(20000, 0)
            .wait(5000)
            .count('.title')
            .log()
            .evaluate(function () {
              var links = [];
              $(".title").each(function (item) {

                var link = {
                  url: $(this).attr("href")
                };
                //if(link.hasOwnProperty(url))
                links.push(link);
              });
              return links;
            })
            .then(function (x) {
              var obj = {};
              obj[key] = x;
              allLinks.push(obj);
              if(linksToParse.length !== 0)
              getLinks(linksToParse.pop());
              else
              saveLinks();

            })

    }
  }(linksToParse.pop()))

function saveLinks(){
  hm.close();
  fs.writeFile('allLinks.json',JSON.stringify(allLinks),function(err){
    if(err)
      console.error(err);
    console.log('Written!');
  });

}