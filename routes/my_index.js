/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var app = module.exports = express();
const fs = require('fs');

var array = fs.readFileSync('index6.html').toString().split("\n");
for(i in array) {
    console.log(array[i]);
}
app.get('/', function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    for(i in array) {
    res.write(array[i]);
}
    return res.end();
});




