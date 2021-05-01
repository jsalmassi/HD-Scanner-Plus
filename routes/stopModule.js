/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var router = express.Router();
var q;
const fs = require('fs');

router.get('/', function (req, res,next) {
//  q = url.parse(req.url, true);
// now, lets kill it
try {
  // process.kill(process.pid, 'SIGTERM');//'SIGINT'); // seem to do exact same thing!
  ////process.exit(22);//'SIGTERM'); // seem to do exact same thing!
    setTimeout((function() { // waite 5 seconds for the closingPage.html to render before bailing...
      return process.exit(22);
    }), 1000);
}catch (e)  {
console.log("something went wrong in process.kill()")
};

console.log(" stopping the server ....")

//res.write("helllooooooooooooooooo from stopModule oOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
//res.end();
//**********************************none of the next 3 approaches worked ****************************** */
/* res.statusCode=302;
res.setHeader('Location','http://localhost:3000/closingPage.html');
//res.setHeader('Location','/requestTargetHtml.html?file=reqestTarget');
//return res.end();
res.end(); */

          var array = fs.readFileSync('closingPage.html').toString().split("\n");
          res.writeHead(200, {'Content-Type': 'text/html'});
          for(i in array) {
            res.write(array[i]);
          }
  /* res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html> <head> <title>TODO supply a title</title> <meta charset="UTF-8">  </head> <body> <div>TODO write content....</div> </body> </html>'); */
  return res.end();




}); // end of router.get()


module.exports = router;

