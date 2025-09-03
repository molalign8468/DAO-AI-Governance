const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ERC20 token with account:", deployer.address);

  const Token = await ethers.getContractFactory("MyGovernance");
  const token = await upgrades.deployProxy(Token, [deployer.address], {
    initializer: "initialize",
  });
  await token.waitForDeployment();

  console.log("ERC20 Governance Token deployed at:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
