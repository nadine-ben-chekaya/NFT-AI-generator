const hre = require("hardhat");

async function main() {
  const COST = ethers.utils.parseUnits("0.001", "ether"); // 1 ETH

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(COST);
  await nft.deployed();

  console.log(`Deployed NFT Contract at: ${nft.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
