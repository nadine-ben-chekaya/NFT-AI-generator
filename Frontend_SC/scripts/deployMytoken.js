const hre = require("hardhat");

async function main() {
  const mintfees = ethers.utils.parseUnits("0.001", "ether"); // 0.001 ETH
  //Transactions
  const gasPriceOracle = "https://gasstation-mainnet.matic.network";
  const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const estimate = await MyToken.estimateGas.deploy(
    "0x29F6D1c6Ec10C4E0975240936576db439632d664",
    mintfees
  );
  console.log("estimate=", estimate);
  //   const MyToken = await hre.ethers.getContractFactory("MyToken");
  //   const myToken = await MyToken.deploy(
  //     "0x29F6D1c6Ec10C4E0975240936576db439632d664",
  //     mintfees
  //   );
  //   await myToken.deployed();

  //   console.log(
  //     `Deployed Mytoken Contract at: ${myToken.address}, from owner ${myToken.owner}`
  //   );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
