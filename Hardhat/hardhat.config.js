require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("dotenv").config();

const { PRIVATE_KEY_ACCOUNT1, ALCHEMY_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/FQLza3Pw812rsFJyGWZvPsJXGzRvnWNv`,
      accounts: [PRIVATE_KEY_ACCOUNT1],
    },
  },

  etherscan: {
    apiKey: "1U4UF6N65R9EZMBUFW8RFAT4ZYGQEVIHXA",
  },
};
