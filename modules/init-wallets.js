const bitcoin = require('bitcoinjs-lib')
const parseXPub = require('./parse-xpub')
const xpubAndPrivkeyGetter = require('./xpubAndPrivkeyGetter')
const addressGenerators = require('./address-generators')
const wallets = require('../dynamicWallet2')
//------------------replaceConsole()------------------------- 
var consoleMessage='';
replaceConsole();
function replaceConsole() {
    var realConsoleLog = console.log;
    console.log = function () {
//  var message = [].join.call(arguments, " ");
        consoleMessage = [].join.call(arguments, " ");
        //$(".output").text(message);
        realConsoleLog.apply(console, arguments);
        };
}
//--------------------------------------------------------

function initWallets () {
  const sortedWallets = []
  for (let id in wallets) {
    if (wallets.hasOwnProperty(id)) {
      const wallet = wallets[id]
      wallet.id = id

      wallet.blockHeightFrom = wallet.blockHeightFrom || 0

      // parse the provided xpub: get version bytes converted to xpub and address encoiding
      let parsedXPub
      let parsedWords
      let hdKey
      // js ,will try to get the xpub from the bip39 'words' instead
      if (wallet.words){
        try {
          xpubFromWords = xpubAndPrivkeyGetter.getXpubFromWords(wallet.words)
          if (xpubFromWords){
            parsedXPub = parseXPub(xpubFromWords)
            hdKey = bitcoin.bip32.fromBase58(parsedXPub.xpub)
            } 
        } catch (e) {
          console.log('Error. Invalid words value or not provided in ' + id + "stop,re-run with valid data")
          process.send(consoleMessage);
          throw new Error('Invalid words value or not provided in ' + id)
        }
      }  
      else if (wallet.electrum_words || wallet.electrum_words_segwit){
        try {
          if (wallet.electrum_words){ 
              hdkey_electrum = xpubAndPrivkeyGetter.electrumGetXpubFromWords(wallet.electrum_words,type="p2pkh")
          } else if (wallet.electrum_words_segwit) {  
              hdkey_electrum = xpubAndPrivkeyGetter.electrumGetXpubFromWords(wallet.electrum_words_segwit,type="p2wpkh")
          }
          if (hdkey_electrum){
            hdKey = hdkey_electrum
            parsedXPub = parseXPub(hdkey_electrum.publicExtendedKey)
            } 
        }catch (e) {
          console.log('Error. Invalid electrum_words or electrum_words_segwit value or not provided in ' + id + ", stop, re-run with valid data.")
          process.send(consoleMessage);
          throw new Error('Invalid electrum_words or electrum_words_segwit value or not provided in ' + id + ", stop, re-run with valid data.")
        }
      } else if (wallet.xpub){
        try {
          parsedXPub = parseXPub(wallet.xpub)
          hdKey = bitcoin.bip32.fromBase58(parsedXPub.xpub)
        } catch (e) {
          console.log('Error. Invalid xpub value in ' + id)
          process.send(consoleMessage);
          throw new Error('Invalid xpub value in ' + id)
        }
      } else {
        console.log('Error. You provided nothing(!) in ' + id + ", stop, re-run with valid data.")
        process.send(consoleMessage);
        throw new Error('You provided nothing(!) in ' + id) 
      }

      // setup an address generator
      const addrEnc = wallet.addrEnc || parsedXPub.addrEnc
      const addressGenerator = addressGenerators[addrEnc]
      name_for_change = addressGenerator.name + '_change'
      console.log('addressGen_change name: '+name_for_change)
      const addressGenerator_change = addressGenerators[name_for_change]
      //console.log('addressGen_change: '+addressGenerator_change)
      if (!addressGenerator) {
        console.log(`Error. ${addrEnc} is not supported yet`)
        process.send(consoleMessage);
        throw new Error(`${addrEnc} is not supported yet`)
      }
      wallet.generateAddress = ((hdKey, addressGenerator) => {
        return (idx) => {
          return addressGenerator(hdKey, idx)
        }
      })(hdKey, addressGenerator)
      // same thing for the change addresses
       wallet.generateAddress_change = ((hdKey, addressGenerator_change) => {
        return (idx) => {
          return addressGenerator_change(hdKey, idx)
        }
      })(hdKey, addressGenerator_change) 

      sortedWallets.push(wallet)
    }
  }

  sortedWallets.sort((a, b) => b.blockHeightFrom - a.blockHeightFrom)

  return sortedWallets
}

module.exports = initWallets
