const bitcoin = require('bitcoinjs-lib')
const HDKey = require ('hdkey') // from cryptocoinjs/hdkey  https://github.com/cryptocoinjs/hdkey

function p2pkh (hdKey, idx) {
  //------------
  //console.log("********************* electrum_child is an instance of HDKey: "+(hdKey instanceof HDKey))
  if (hdKey instanceof HDKey) // this is for electrum from wallet.electrum_words
  return bitcoin.payments.p2pkh({
    pubkey: hdKey.deriveChild(0).deriveChild(idx).publicKey // m/0'/0/idx // hdKey=m/0'
  }).address
  //-------------
  else {
    //console.log("if (hdKey instanceof HDKey) is: "+ (hdkey instanceof HDKey))
    return bitcoin.payments.p2pkh({
    // js give it '1' vs. '0' to get change address
    pubkey: hdKey.derive(0).derive(idx).publicKey // m/0'/0/idx // hdKey=m/0'
    //pubkey: hdKey.derive(0).derive(1).derive(idx).publicKey // ie, m/0'/0/0/idx
  }).address
  }
}
// gonna implemnet the same func for change address of every 'addrEnc', for now just the 'p2pkh'
// all that is different it the '1' instead of '0' passed to the first 'drive()' functino
 function p2pkh_change (hdKey, idx) {
  if (hdKey instanceof HDKey) // this is for electrum crap
  return bitcoin.payments.p2pkh({
    pubkey: hdKey.deriveChild(1).deriveChild(idx).publicKey // m/0'/0/idx // hdKey=m/0'
  }).address
  else return bitcoin.payments.p2pkh({
    // js give it '1' vs. '0' to get change address
    pubkey: hdKey.derive(1).derive(idx).publicKey // m/0'/1/idx // hdKey=m/0'
    //pubkey: hdKey.derive(0).derive(1).derive(idx).publicKey // ie, m/0'/0/0/idx
    // end js
  }).address
} 

function p2wpkhInP2sh (hdKey, idx) {
  return bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: hdKey.derive(0).derive(idx).publicKey
    })
  }).address
}

function p2wpkh (hdKey, idx) {
/*  return bitcoin.payments.p2wpkh({
    pubkey: hdKey.derive(0).derive(idx).publicKey
  }).address
} */
//console.log("********************* electrum_child is an instance of HDKey: "+(hdKey instanceof HDKey))
if (hdKey instanceof HDKey) // this is for electrum from wallet.electrum_words
return bitcoin.payments.p2wpkh({
  pubkey: hdKey.deriveChild(0).deriveChild(idx).publicKey // m/0'/0/idx // hdKey=m/0'
}).address
//-------------
else return bitcoin.payments.p2wpkh({
  // js give it '1' vs. '0' to get change address
  pubkey: hdKey.derive(0).derive(idx).publicKey // m/0'/0/idx // hdKey=m/0'
  //pubkey: hdKey.derive(0).derive(1).derive(idx).publicKey // ie, m/0'/0/0/idx
}).address
}

function p2wpkh_change (hdKey, idx) {
  /* return bitcoin.payments.p2wpkh({
    pubkey: hdKey.derive(1).derive(idx).publicKey
  }).address */
  if (hdKey instanceof HDKey) // this is for electrum crap
  return bitcoin.payments.p2wpkh({
    pubkey: hdKey.deriveChild(1).deriveChild(idx).publicKey // m/0'/0/idx // hdKey=m/0'
  }).address
  else return bitcoin.payments.p2wpkh({
    // js give it '1' vs. '0' to get change address
    pubkey: hdKey.derive(1).derive(idx).publicKey // m/0'/1/idx // hdKey=m/0'
    //pubkey: hdKey.derive(0).derive(1).derive(idx).publicKey // ie, m/0'/0/0/idx
    // end js
  }).address
}

function multisigP2wshInP2sh (hdKey, idx) {
  // will add later
}

function multisigP2wsh (hdKey, idx) {
  // will add later
}

module.exports = {
  'p2pkh': p2pkh,
  'p2pkh_change': p2pkh_change,
  'p2wpkh-in-p2sh': p2wpkhInP2sh,
  'p2wpkh': p2wpkh,
  'p2wpkh_change': p2wpkh_change
  // 'multisig-p2wsh-in-p2sh': multisigP2wshInP2sh,
  // 'multisig-p2wsh': multisigP2wsh
}
