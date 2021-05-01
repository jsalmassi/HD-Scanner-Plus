/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var url = require('url');
var q;
router.get('/', function (req, res,next) {
  q = url.parse(req.url, true);
 
  createDynamicWallet2(q.query);

}); 

function createDynamicWallet2(query){

  fs.unlink('dynamicWallet2.js', resultHandler);
  const dynamicWallet = {
    'my-wallet': {"select1":"15000","select2":"15","blockHeightFrom":"501","scanToBlockHeight":"",
    "addrIdxFrom":"","addrIdxTo":"","addrEnc":"'p2pkh'|'p2wpkh-in-p2sh'|'p2wpkh'","electrum_words_segwit":"",
  "electrum_words":"","words":"","xpub":""}
    }
    console.log("&&&&&#####&&&&&"+dynamicWallet["my-wallet"].blockHeightFrom);
    dynamicWallet["my-wallet"].select1 = Number(query.select1);
    dynamicWallet["my-wallet"].select2 = Number(query.select2);
    dynamicWallet["my-wallet"].blockHeightFrom = Number(query.blockHeightFrom);
    dynamicWallet["my-wallet"].scanToBlockHeight = Number(query.scanToBlockHeight);
    dynamicWallet["my-wallet"].addrIdxFrom = Number(query.addrIdxFrom);
    dynamicWallet["my-wallet"].addrIdxTo = Number(query.addrIdxTo);
    dynamicWallet["my-wallet"].electrum_words_segwit = query.electrum_words_segwit;
    dynamicWallet["my-wallet"].words = query.words;
    dynamicWallet["my-wallet"].electrum_words = query.electrum_words;
    dynamicWallet["my-wallet"].xpub = query.xpub;
    dynamicWallet["my-wallet"].addrEnc = 'p2pkh'|'p2wpkh-in-p2sh'|'p2wpkh'; // this has problems.. it writes '0' , but it works..we set it manually down the road

  fs.appendFile('dynamicWallet2.js',"const dynamicWallet = " + JSON.stringify(dynamicWallet) + "; module.exports = dynamicWallet;\n ", function (err) {
    if (err) throw err;
    console.log('Saved dynamicWallet!'); 
    });
}
var resultHandler = function(err) { 
  if(err) {
     console.log("unlink of 'dynamicWallet2.js' failed", err);
  } else {
     console.log("file 'dynamicWallet2.js' deleted");
  }
}

module.exports = router;

