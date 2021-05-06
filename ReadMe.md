This tool is based upon https://github.com/alexk111/HD-Wallet-Scanner. It is called HD-Scanner-Plus simply
 because I added some more capabilites to it. In addition to the features that alexk111's 'HD-Wallet-Scanner' offers 
 this tools adds things like:
*  Entering **bip39** words seed instead of/in addtion to, xpub.
*  Entering **Electrum** seed words (none bip39) and also it's **segwit** version.
*  The entire process is gui based now, enabling a view of progress, info and errors at one glance.
   For this I use **nodejs/Express** farmework. And this potentially makes the scan and/or recovery possible 
   remotely, though one should keep in mind that private keys are also generated. In short if this tool is 
   to be used remotely extra care should be taken in that regard. The final result however, is stored in an
   output directroy on the server only.
*  Generating the corresponding private keys to the generated address both for external/internal chains (receive and change).
   This way, this tool can be thought of an universal wallet of sort. 

### Requirements for this tool are:
 *   One must have a full node running so this tool can query it using 'rpc' calls.
 *   This tool as been tested on the following: 
      node: v15.8.0, npm: 7.5.1
 *   All this was done on 'Ubuntu 16.4'.
### Installing
#### clone repo
git clone https://github.com/jsalmassi/HD-Scanner-Plus
#### navigate to it
cd HD-Scanner-Plus

#### install dependencies
npm install

#### add env variables
cp .env.sample .env


#### Edit .env:

BITCOIND_RPCUSER and BITCOIND_RPCPASSWORD - user/pass to access Bitcoin RPC server
MAX_ADDRESSES_PER_ITERATION - max number of addresses per a scan iteration (default: 100000)

#### Run
Please make sure that tab titled "HD-Scanner-Plus" is closed, from previous session if any.
Also make sure that bitcoin core is running.

**node ./bin/www** 
or 
**node --inspect=9229 ./bin/www** (if using vscode ide)

```
Donate: 18ANu3L1LfbTsHtnt8mWnkk6o4cBj6GqhC
Comments? please email me at jsalmassi@yahoo.com

 
