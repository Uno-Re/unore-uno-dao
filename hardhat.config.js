const { utils } = require("ethers");

require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ganache");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
  // accountsBalance: "990000000000000000000",
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: "USD",
    enabled: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    dev: {
      default: 1,
    },
  },
  networks: {
    hardhat: {
      gasPrice: "auto",
      accounts,
      forking: {
        url: `${process.env.ETHEREUM_RPC}`,
        enabled: true,
      },
    },
    mainnet: {
      url: `${process.env.ETHEREUM_RPC}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 1,
      live: false,
      saveDeployments: true,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      live: true,
      gas: 'auto',
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    deploy: "scripts/deploy",
    deployments: "deployments",
    sources: "contracts",
    tests: "test",
  },
  // contractSizer: {
  //   alphaSort: true,
  //   disambiguatePaths: true,
  //   runOnCompile: true
  // },
  mocha: {
    timeout: 300000,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ],
  },
};
