const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MyAINFTModule = buildModule("NFTModule", (m) => {
  const nft = m.contract("MyAINFT");

  m.call(nft, "mintNFT", ["uri from module ignition"]);

  return { nft };
});

module.exports = MyAINFTModule;
