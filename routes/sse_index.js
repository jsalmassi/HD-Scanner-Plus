var express = require('express');
var router = express.Router();
////var Bluebird = require('bluebird');
const { fork } = require('child_process');
const { spawn } = require('child_process');
const execFile = require('child_process').execFile;
const { exec } = require('child_process');
var path = require('path');

const SSE = require('./sse_module');
//------------------replaceConsole()------------------------- 
var consoleMessage = '';
function replaceConsole() {
    var realConsoleLog = console.log;
    console.log = function () {
        consoleMessage = [].join.call(arguments, " ");
        //$(".output").text(message);
        realConsoleLog.apply(console, arguments);
    };
}
//------------------replaceConsole()------------------------- 
router.get('/', (req, res, next) => {
    const sse = SSE(res);
    var i =0;
    // const child= fork('modules/scanner',[],{execArgv:['--inspect-brk=40894']});
    const child= fork('modules/scanner',[],{execArgv:[]});
    var scannerMessage;
    i=i+1
    child.on('message', (message) => {
    scannerMessage = message;
    sse.write(i,scannerMessage);
    });

    child.send('START');
 }); //end of router.get('/', (req, res, next)=>.......   

module.exports = router;