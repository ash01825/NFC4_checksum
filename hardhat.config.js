// hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            // This is the default network used for testing
            chainId: 31337,
        },
        localhost: {
            // This is for connecting to the `npx hardhat node`
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
        },
    },
    namedAccounts: {
        // This allows you to name accounts for easier use in deployment scripts
        deployer: {
            default: 0, // here this will by default take the first account as deployer
        },
        exporter: {
            default: 1,
        },
        importer: {
            default: 2,
        },
        customs: {
            default: 3,
        },
    },
    gasReporter: {
        enabled: true, // Set to false to disable
        currency: "INR",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: "YOUR_COINMARKETCAP_API_KEY", // Optional: for accurate USD values
    },
};
