require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const path = require("path");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            chainId: 31337
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
            chainId: 97,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 10000000000 // 10 gwei
        },
        bsc: {
            url: process.env.BSC_RPC || "https://bsc-dataseed1.binance.org/",
            chainId: 56,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 5000000000 // 5 gwei
        },
        opbnb: {
            url: process.env.OPBNB_RPC || "https://opbnb-mainnet-rpc.bnbchain.org",
            chainId: 204,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 1000000000 // 1 gwei
        },
        opbnbTestnet: {
            url: process.env.OPBNB_TESTNET_RPC || "https://opbnb-testnet-rpc.bnbchain.org",
            chainId: 5611,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 1000000000 // 1 gwei
        }
    },
    etherscan: {
        // Use single API key for Etherscan v2
        apiKey: process.env.BSCSCAN_API_KEY || "",
        customChains: [
            {
                network: "bscTestnet",
                chainId: 97,
                urls: {
                    apiURL: "https://api-testnet.bscscan.com/api",
                    browserURL: "https://testnet.bscscan.com"
                }
            },
            {
                network: "bsc",
                chainId: 56,
                urls: {
                    apiURL: "https://api.bscscan.com/api",
                    browserURL: "https://bscscan.com"
                }
            },
            {
                network: "opbnb",
                chainId: 204,
                urls: {
                    apiURL: "https://api-opbnb.bscscan.com/api",
                    browserURL: "https://opbnb.bscscan.com"
                }
            },
            {
                network: "opbnbTestnet",
                chainId: 5611,
                urls: {
                    apiURL: "https://api-opbnb-testnet.bscscan.com/api",
                    browserURL: "https://opbnb-testnet.bscscan.com"
                }
            }
        ]
    },
    paths: {
        sources: path.resolve(__dirname, "./contracts"),
        tests: path.resolve(__dirname, "./test"),
        cache: path.resolve(__dirname, "./cache"),
        artifacts: path.resolve(__dirname, "./artifacts")
    },
    mocha: {
        timeout: 40000
    }
};
