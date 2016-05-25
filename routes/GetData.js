/**
 * Created by yash on 5/22/16.
 */
var Firebase = require('firebase');
var fs = require('fs');
var https = require('https');
var json2csv = require('json2csv');


var request = require('request');
request('https://play-store-app-data.firebaseio.com/.json', function (error, response, data) {
    if (!error && response.statusCode == 200) {
        data = JSON.parse(data);
        console.log(data['topFreeGames']);
        var fields = ['name','avgRating','category','downloads','oneStarRatings','twoStarRatings','threStarRatings','fourStarRatings','fiveStarRatings','reviews'];
        //for( keys in data){
            json2csv({ data: data['topFreeGames'], fields: fields }, function(err, csv) {
                if (err) console.log(err);
                fs.writeFile('topFree'+'.csv', csv, function(err) {
                    if (err) throw err;
                    console.log('file saved');
                });
            });
        }
    //}
})