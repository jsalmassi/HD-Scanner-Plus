const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const HDKey = require ('hdkey') // from cryptocoinjs/hdkey  https://github.com/cryptocoinjs/hdkey
var base58check = require('bs58check')
const parseXPub = require('./parse-xpub')
const wallets = require('../wallets')
const mn = require('electrum-mnemonic') // for electrum stuff

let hdkey 
const compressed = true

function getXpubFromWords (words) {
  const mnemonic = words
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  //let hdKey_fromWords = bitcoin.bip32.fromSeed(seed) // from bitcoinjs-lib's bip32 lib
  //console.log(hdKey_fromWords.toBase58())
  hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex')) // from 'cryptocoinjs' 's 'hdkey' lib
  //console.log(hdkey.toJSON())
  console.log(hdkey.privateExtendedKey)
  console.log(hdkey.publicExtendedKey)
  //var childkey = hdkey.derive("m/0/2147483647'/0")
  var childkey = hdkey.derive("m/0'")
  return xpubFromWords = childkey.publicExtendedKey
}

function getPrivkey(addrIdx,keyType){//},wallet){
  //-------------------
  //parsedXPub = parseXPub(wallet.xpub)
  //var hdkey = HDKey.fromExtendedKey(parsedXPub.xpub)
  //------------------
  console.log("if (hdKey instanceof HDKey) is: "+ (hdkey instanceof HDKey))
  //version = hdkey.versions.private
  if (keyType == "p2pkh_none_electrum"){
    var childkey = hdkey.derive("m/0'/0/" + addrIdx)
  } else if (keyType == "p2pkh_electrum") { // p2pkh electrum type
    var childkey = hdkey.deriveChild(0).deriveChild(addrIdx)
  //}
  } else if (keyType == "p2wpkh") { // p2pkh electrum type
    var childkey = hdkey.derive("m/84'/0'/0'/0/0" + addrIdx)
  }
  if (!childkey.privateKey)
     throw new TypeError('Missing private key');
 var result = new Buffer(compressed ? 34 : 33)
 //var version = '0x80' for mainnet
 result[0]='0x80'
 childkey.privateKey.copy(result, 1)
 if (compressed) {
   result[33] = 0x01
 }
 return base58check.encode(result)
}

function getPrivkey_change(addrIdx,keyType){
  if (keyType == "p2pkh_none_electrum"){
    var childkey = hdkey.derive("m/0'/1/" + addrIdx)
  } else if (keyType == "p2pkh_electrum"){ // p2pkh electrum type
    var childkey = hdkey.deriveChild(1).deriveChild(addrIdx)
  } else if (keyType == "p2wpkh") { // p2pkh electrum type
    var childkey = hdkey.derive("m/84'/0'/0'/1/0" + addrIdx)
  }
  if (!childkey.privateKey)
     throw new TypeError('Missing private key');
 var result = new Buffer(compressed ? 34 : 33)
 //var version = '0x80' for mainnet
 result[0]='0x80'
 childkey.privateKey.copy(result, 1)
 if (compressed) {
   result[33] = 0x01
 }
 return base58check.encode(result)
}

function electrumGetXpubFromWords(electrum_words,type){
  // electrum_words = 'year rapid control ecology buffalo depend cup pudding bag expect pyramid service'
  my_prefix = what_is_prefix(electrum_words) 
  console.log ( "prefix, from 'what_is_perfix1()' is: " + my_prefix)
  my_prefix2= what_is_prefix2(electrum_words,type)
  console.log ( "prefix , from 'what_is_prefix2()' is: " + my_prefix2)

  console.log(mn.validateMnemonic(electrum_words,my_prefix)); // true 

  if (type=="p2pkh"){
    const electrum_seed = mn.mnemonicToSeedSync(electrum_words, { passphrase: '', prefix: mn.PREFIXES.standard })
    //var electrum_hdkey = HDKey.fromMasterSeed(Buffer.from(electrum_seed, 'hex')) // seed derived above from mnemonic
    var electrum_hdkey = HDKey.fromMasterSeed(Buffer.from(electrum_seed, 'hex'))//versions_segwit) // seed derived above from mnemonic
    var electrum_childkey = electrum_hdkey.derive("m") //***** electrum's masterkey *****
    hdkey = electrum_hdkey // set the global hdkey for the other functions to use.. ie, getprivatekey().... and others
  } else if (type=="p2wpkh"){
    versions_segwit = {private: 0x04b2430c, public: 0x04b24746}  //https://github.com/satoshilabs/slips/blob/master/slip-0132.md
    const electrum_seed = mn.mnemonicToSeedSync(electrum_words, { passphrase: '', prefix: mn.PREFIXES.segwit })
    var electrum_hdkey = HDKey.fromMasterSeed(Buffer.from(electrum_seed, 'hex'),versions_segwit) // seed derived above from mnemonic
    hdkey = electrum_hdkey // set the global hdkey for the other functions to use.. ie, getprivatekey().... and others
    var electrum_childkey = electrum_hdkey.derive("m/84'/0'/0'") //***** electrum's segwit first address *****
  }
    console.log(electrum_childkey.privateExtendedKey)
    console.log(electrum_childkey.publicExtendedKey+"\n")
    console.log ("publicKey is, toString('hex'): " + electrum_childkey.publicKey.toString('hex')+"\n")
    return electrum_childkey // it is an 'instance of' electrum_hdkey
}
function what_is_prefix(electrum_words){
  var prefixes = {segwit:'100', standard:'01', '2fa': '101', '2fa-segwit': '102',}
  for(var key in prefixes){ 
    if( mn.validateMnemonic(electrum_words, prefixes[key]))
     //return key
     return prefixes[key]
    }      
}
function  what_is_prefix2(electrum_words,type){
  const prefixes = new Map([
    ['p2wpkh', '100'],
    ['p2pkh', '01'],
    ['2fa', '101'],
    ['2fa-segwit', '102']
  ])
    if( mn.validateMnemonic(electrum_words, prefixes.get(type)))
    return prefixes.get(type)
}
module.exports = {
  'getXpubFromWords': getXpubFromWords,
  'getPrivkey': getPrivkey,
  'getPrivkey_change': getPrivkey_change,
  'electrumGetXpubFromWords': electrumGetXpubFromWords,
//  'electrumGetXpubFromWordsSegwit': electrumGetXpubFromWordsSegwit
}