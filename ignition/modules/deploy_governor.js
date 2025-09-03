const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Governor with account:", deployer.address);

  const tokenAddress = "0x36922890655De3106f42aC3f8354C15DB3983e1a";
  const timelockAddress = "0x4E16c65C1dD02D295C4612c0Ec3AD53758d0459f";

  const Governor = await ethers.getContractFactory("MyGovernor");
  const governor = await upgrades.deployProxy(
    Governor,
    [tokenAddress, timelockAddress],
    { initializer: "initialize" }
  );
  await governor.waitForDeployment();

  console.log("Governor deployed at:", await governor.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
