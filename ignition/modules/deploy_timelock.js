const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Timelock with account:", deployer.address);

  const Timelock = await ethers.getContractFactory("TimelockUUPSUpgradeable");
  const minDelay = 3600;
  const proposers = [deployer.address];
  const executors = [deployer.address];

  const timelock = await upgrades.deployProxy(
    Timelock,
    [minDelay, proposers, executors, deployer.address],
    { initializer: "initializeTimelock" }
  );
  await timelock.waitForDeployment();

  console.log("Timelock deployed at:", await timelock.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
