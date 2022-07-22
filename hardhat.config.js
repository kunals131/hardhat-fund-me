require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require('hardhat-deploy');
/** @type import('hardhat/config').HardhatUserConfig */

const RINKBY_RPC_URL = process.env.RINKBY_RPC_URL || "https://eth-rinkbey"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xKey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Key"
const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY || "Key";


module.exports = {
  // solidity: "0.8.7",
  //mutiple versions of solidity
  solidity : {
    compilers : [
      {version : "0.8.0"},
      {version : "0.6.6"},
      {version : "0.8.8"}
    ]
  },
  defaultNetwork : "hardhat",
  networks : {
    rinkeby : {
      url : RINKBY_RPC_URL,
      accounts : [PRIVATE_KEY],
      chainId : 4,
      blockConfirmation : 6
    },
    localhost : {
      url : 'http://127.0.0.1:8545/',
      //accounts are placed by hardhat
      chainId : 31337
    }
  },
  defaultNetwork : 'hardhat',
  etherscan : {
    apiKey : ETHERSCAN_API_KEY
  },
  gasReporter : {
    enabled : false,
    outputFile : 'gas-report.txt',
    noColors : true,
    currency : 'INR',
    coinmarketcap : COINMARKETCAP_API_KEY,
    token : "MATIC" //for polygon
  },
  namedAccounts : {
    deployer : {
      default : 2
    }
  }
}
