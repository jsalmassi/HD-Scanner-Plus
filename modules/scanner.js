const fs = require('fs')
const path = require('path')
const dirOutput = require('./dirs').dirOutput
const xpubAndPrivkeyGetter = require('./xpubAndPrivkeyGetter')
const bitcoin = require('bitcoinjs-lib')
const initWallets = require('./init-wallets')
const bitcoinClient = require('./bitcoin-client')
const getAddressFromTxOutput = require('./get-address-from-tx-output')

const generateReport = require('./generate-report')
process.on('message', (message) => {
    if (message === 'START') {
        ////console.log('Child process (scanner) received START message*************');
    }
});
//------------------replaceConsole()------------------------- 
var consoleMessage = '';
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
console.log("****************** hello from scanner ************************");
process.send(consoleMessage);
//--------------------------------------------------------

const MAX_ADDRESSES_PER_ITERATION = process.env.MAX_ADDRESSES_PER_ITERATION || 100000

const allAddresses = new Map()
const allPrivateKeys = []
const allAddresses_change = new Map()
const allPrivateKeys_change = []
let usedAdresses

async function getBlockTxs(blockHeight) {
    const block = await bitcoinClient.getBlockByHeight(blockHeight)
    const parsedBlock = bitcoin.Block.fromHex(block)
    return parsedBlock.transactions
}

async function scanAllAddresses(blockHeightFrom, blockHeightTo) {
    console.log('Start scanning addresses')
    process.send(consoleMessage);

    for (let blockHeight = blockHeightFrom; blockHeight <= blockHeightTo; blockHeight++) {
        if (blockHeight % 1000 == 0) {
            console.log("we are stopping to save data every 1000th. block processed...")
            process.send(consoleMessage);
            await generateReport(usedAdresses)
        }
        console.log(`Processing Block. Height ${blockHeight}/${blockHeightTo}. Progress ${((blockHeight - blockHeightFrom) / (blockHeightTo - blockHeightFrom)).toFixed(4)}`)
        process.send(consoleMessage);

        const txs = await getBlockTxs(blockHeight)
        txs.forEach(tx => {
            tx.outs.forEach(output => {
                const outAddr = getAddressFromTxOutput(output)
                const addrData = allAddresses.get(outAddr)
                if (addrData) {
                    if (!usedAdresses[outAddr]) {
                        usedAdresses[outAddr] = {
                            addr: outAddr,
                            addrIdx: addrData.addrIdx,
                            wallet: addrData.wallet,
                            txs: []
                        }
                    }
                    usedAdresses[outAddr].txs.push({
                        blockHeight,
                        value: output.value
                    })
                }
//---- do the same thing for change addresses
                const addrData_change = allAddresses_change.get(outAddr)
                if (addrData_change) {
                    if (!usedAdresses[outAddr]) {
                        usedAdresses[outAddr] = {// save it at same place as the 'receive' addresses
                            addr: outAddr,
                            addrIdx: addrData_change.addrIdx,
                            wallet: addrData_change.wallet,
                            txs: []
                        }
                    }
                    usedAdresses[outAddr].txs.push({
                        blockHeight,
                        value: output.value
                    })
                }
            })
        })
    }

    // clear
    allAddresses.clear()
}

async function scan() {
    allAddresses.clear()
    allAddresses_change.clear()

    usedAdresses = {}
    let scanFromBlockHeight = 999999999
    //js I want to be able to scan to where I want and not all the way to the current blockheight
    // so we give it a 'interval' from (assigned in wallets'js) to what we set below.

    // const scanToBlockHeight = await bitcoinClient.getBlockCount()
    var scanToBlockHeight;
    // const scanToBlockHeight = 645920  // for wallet-coinbase
    //const scanToBlockHeight = 552000 // for breeze...
    //const scanToBlockHeight = 190900 //for testnet form blockchain.info,...
    const wallets = initWallets()
    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i]
        scanToBlockHeight = wallet.scanToBlockHeight;
        if (wallet.scanToBlockHeight == 0 || wallet.blockHeightFrom >= wallet.scanToBlockHeight) {
            console.log('<br>scanToBlockHeight is: ' + wallet.scanToBlockHeight + '. Defaulting to current block height. Will take a while!<br>');
            process.send(consoleMessage);
            scanToBlockHeight = await bitcoinClient.getBlockCount();
        }
        if (wallet.blockHeightFrom < scanFromBlockHeight) {
            scanFromBlockHeight = wallet.blockHeightFrom
        }
        for (let addrIdx = wallet.addrIdxFrom; addrIdx <= wallet.addrIdxTo; addrIdx++) {
            if (addrIdx % 2000 === 0) {
                console.log(`Generating addresses for ${wallet.id}; idxs ${addrIdx}...`);
                process.send(consoleMessage);
            }
            if (wallet.words || wallet.electrum_words || wallet.electrum_words_segwit) { // we only deal with privatekeys if we are deriving everything from 'words' and not 'xpub'
                let privateKey
                if (wallet.words) {
                    privateKey = xpubAndPrivkeyGetter.getPrivkey(addrIdx, keyType = "p2pkh_none_electrum")//,wallet)
                } else if (wallet.electrum_words) {
                    privateKey = xpubAndPrivkeyGetter.getPrivkey(addrIdx, keyType = "p2pkh_electrum")//,wallet)
                } else { // wallet.elctrum_words_segwit
                    privateKey = xpubAndPrivkeyGetter.getPrivkey(addrIdx, keyType = "p2wpkh")//,wallet)
                }
                allPrivateKeys.push(privateKey)
            } // if words...
            const addr = wallet.generateAddress(addrIdx)
            allAddresses.set(addr, {addrIdx, wallet})

        } // for addrIdx..
        // wallet.select1 is the number of change addresses we want to generte. Walltes nomrally don't check more than firt 20 but
        // we can select it here and should not be any more that 50 or so max.
        for (let addrIdx_change = wallet.addrIdxFrom; addrIdx_change <= wallet.addrIdxFrom + wallet.select1; addrIdx_change++) {
            if (wallet.words || wallet.electrum_words || wallet.electrum_words_segwit) { // we only deal with privatekeys if we are deriving everything from 'words' and not 'xpub'
                let privateKey_change
                if (wallet.words) {
                    privateKey_change = xpubAndPrivkeyGetter.getPrivkey_change(addrIdx_change, keyType = "p2pkh_none_electrum")//,wallet)
                } else if (wallet.electrum_words) {
                    privateKey_change = xpubAndPrivkeyGetter.getPrivkey_change(addrIdx_change, keyType = "p2pkh_electrum")//,wallet)
                } else { // wallet.elctrum_words_segwit
                    privateKey_change = xpubAndPrivkeyGetter.getPrivkey_change(addrIdx_change, "p2wpkh")//,wallet)
                }
                allPrivateKeys_change.push(privateKey_change)
            } // if words...
            // do it for change addresses
            const addr_change = wallet.generateAddress_change(addrIdx_change)
            allAddresses_change.set(addr_change, {addrIdx_change, wallet})
        } // for addrIdx_change..

        if (allAddresses.size >= MAX_ADDRESSES_PER_ITERATION) {
            try {
                await scanAllAddresses(scanFromBlockHeight, scanToBlockHeight)
            } catch (error) {
                console.log("Error: looks like the bitcoin node is not running OR " + erro1);
                process.send(consoleMessage);
            }
        }
    } // for i...
    receiveOrChange = ''
    write_to_file(allAddresses, allPrivateKeys, receiveOrChange = 'receive')
    write_to_file(allAddresses, allPrivateKeys, receiveOrChange = 'change')

    if (allAddresses.size > 0) {
        try {
            await scanAllAddresses(scanFromBlockHeight, scanToBlockHeight)
        } catch (error) {
            console.log("Error: looks line the bitcoin node is not running OR " + error);
            process.send(consoleMessage);
        }
    }
    return usedAdresses
}
async function write_to_file(allAddresses, allPrivateKeys, receiveOrChange) {
    var ws = fs.WriteStream
    if (receiveOrChange == 'receive') {

        ws = fs.createWriteStream(path.dirname(__dirname) + '/public/allAddrAndPrivReceive.html');

        ws.write('<!DOCTYPE html><html lang="en"><head><title></title><style> div.scroll { ackground-color: #ffffff; \
              width: 600px; height:fit-content; text-align: justify;} #t01 { background-color: #ffffff; margin-left: auto; \
              margin-right: auto;} th,td { padding: 10px; text-align: center;height:max-content;} </style></head><body style="height: max-content; \
              background-color: #f4f0d8;"><table border="0" width="1" cellspacing="1" cellpadding="1" style="width:50%;" \
              id="t01" ><thead><tr><th><b>Address</b></th><th><b>Private Key</b></th></tr></thead><tbody><tr><td style="width:100%"> \
              <div class="scroll">');

        allAddresses.forEach((val, key) => {
            ws.write(`${val.addrIdx}<span style="display: inline-block; width: 2ch;">&#9; </span><b>${key}</b><br><hr>`)
        });
        ws.write('</div></td><td style="width:100%"><div class="scroll" > ');
        allAddresses.forEach((val) => {
            ws.write(`<b>${allPrivateKeys[val.addrIdx]}</b><br><hr>`)
        });
        ws.write('</div></td></tr></tbody></table></body></html> ');
    } else {
        ws = fs.createWriteStream(path.dirname(__dirname) + '/public/allAddrAndPrivChange.html');
        ws.write('<!DOCTYPE html><html lang="en"><head><title></title><style> div.scroll { ackground-color: #ffffff; \
            width: 600px; height:fit-content; text-align: justify;} #t01 { background-color: #ffffff; margin-left: auto; \
            margin-right: auto;} th,td { padding: 10px; text-align: center;height:max-content;} </style></head><body style="height: max-content; \
            background-color: #f4f0d8;"><table border="0" width="1" cellspacing="1" cellpadding="1" style="width:50%;" \
            id="t01" ><thead><tr><th><b>Address</b></th><th><b>Private Key</b></th></tr></thead><tbody><tr><td style="width:100%"> \
            <div class="scroll">');
        allAddresses_change.forEach((val, key) => {
            ws.write(`${val.addrIdx_change}<span style="display: inline-block; width: 2ch;">&#9; </span><b>${key}</b><br><hr>`)
        });
        ws.write('</div></td><td style="width:100%"><div class="scroll" > ');
        allAddresses_change.forEach((val) => {
            ws.write(`<b>${allPrivateKeys_change[val.addrIdx_change]}</b><br><hr>`)
        });
        ws.write('</div></td></tr></tbody></table></body></html> ');
    }
    const pathName = ws.path;

    // the finish event is emitted when all data has been flushed from the stream
    ws.on('finish', () => {
        console.log(`wrote all the array data to file ${pathName}`);
        process.send(consoleMessage);
    });
    // handle the errors on the write process
    ws.on('error', (err) => {
        console.error(`There is an error writing the file ${pathName} => ${err}`)
        process.send(consoleMessage);
    });
    // close the stream
    ws.end();
}
//******************************************************************** */
async function main() {
    const usedAddresses = await scan();
    await generateReport(usedAddresses);
    console.error(`ALL DONE! Generated report in: output directroy in root of this app.`)
    process.send(consoleMessage);
}
main();
//******************************************************************** */
module.exports = {
    scan
}
