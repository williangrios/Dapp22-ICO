
const hre = require("hardhat");

async function main() {
 
  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy("ICO Token", "ICOT", "18", "5000000");

  await ico.deployed();

  console.log(
    `ICO deployed to ${ico.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
