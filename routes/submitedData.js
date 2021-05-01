var express = require('express');
var router = express.Router();
var app = module.exports = express();
const fs = require('fs');
var message;
var stdout;



router.get('/', function (req, res, next) {
    
    function replaceConsole() {
    var realConsoleLog = console.log;
    console.log = function () {
//                var message = [].join.call(arguments, " ");
        message = [].join.call(arguments, " ");
        //$(".output").text(message);
        realConsoleLog.apply(console, arguments);
    };
}
    
    /* replace console.log functionaliyt */

//                                       var array = fs.readFileSync('replaceConsole.html').toString().split("\n");
//app.get('/', function(req, res){
//                                            res.writeHead(200, {'Content-Type': 'text/html'});
//                                            for(i in array) {
//                                            res.write(array[i]);
//                                        }
//    return res.end();
//});
//-----

//-----------------------
// asynch
//                const execFile = require('child_process').execFile;
//                const child = execFile('/home/jsalmassi/.nvm/versions/node/v6.17.1/bin/node', ['clock2.js'], (err, stdout, stderr) => {
//                    if (err) {
//                        throw err;
//                    }
//                    console.log(stdout);
//                });
//----- synch
                //const execFileSync = require('child_process').execFileSync;
                //////const stdout = execFileSync('/home/jsalmassi/.nvm/versions/node/v6.17.1/bin/node', ['--version']);
                //const stdout = execFileSync('/home/jsalmassi/.nvm/versions/node/v6.17.1/bin/node', ['clock2.js']);
                //console.log(stdout);
//-------------------
    var url = require('url');
    var q = url.parse(req.url, true);
    console.log("hello..from submittedData.. before replaceCosole()");
    //res.send("message..from submittedData");
    //res.send(stdout);
    //------
 //var data;
//var array = fs.readFileSync('htmlToInsert.html').toString().split("\n");
var array = fs.readFileSync('requestTargetHtml.html').toString().split("\n");
res.writeHead(200, {'Content-Type': 'text/html'});
    for(i in array) {
    res.write(array[i]);
    }
   //------        

//    res.statusCode=302;
//    res.setHeader('Location','/requestTargetHtml.html?file=submitedData');
    //res.writeHead(302, {'Location': 'https://example.com' + req.url});
//---------------
//    res.writeHead(200, {'Content-Type': 'text/html'});
//    res.write('<html>');
//    res.write('<head>');
//    res.write('<title>TODO supply a title</title>');
//    res.write('<meta charset="UTF-8">');
//    res.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
//    res.write(' </head>');
//    res.write('<body>');
//    res.write('<div>we are in submitedData</div>');
//    res.write('<input type="text" id="myText1" name="myText1" value="" size="30" /><br>');
//    res.write('<input type="text" id="myText2" name="myText2" value="" size="30" />');
//    res.write('<script>');
//    res.write('console.log("****************************");');
//    res.write('</script>');
//    res.write('</body>');
//    res.write('</html>');
//    res.write('var query = window.location.search.substring(1);');
//    res.write('var vars = query.split("&");');
//    res.write('for (var i = 0; i < vars.length; i++) {');
//    res.write('var pair = vars[i].split("=");');
//    res.write('console.log(decodeURIComponent("****************************"));');
//    res.write('console.log(decodeURIComponent(pair[1]));');
//    res.write('document.getElementById("myText1").value = "hello........."');
//    res.write('document.getElementById("myText2").value = pair[1];');
//    res.write('}');

//--------------
//return res.end("stdout");
//async getReplacedConsole(){
//  console.log = await replaceConsole  
//};


/* replaceConsole();
console.log("hello from submitData after replace consloe()");
res.write(message); */




//setTimeout(setTimeout(function(){console.log("Second hello from submitData after replace console()");}, 2000));

return res.end();
//    res.send("message..from submittedData");

                                    //                document.getElementById("firstCell").innerHTML = "hello..";
                                //                document.getElementById("secondCell").innerHTML = pair[0];
                                //                    document.getElementById("myText1").innerHTML = "hello..";
    // res.send('number of addresses to check: <strong>'+q.query.select1+ '</strong><br>' + 'number of change addr to check: <strong>'+q.query.select2+'</strong>');
//------------------------


});
module.exports = router;
