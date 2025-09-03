const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("TimelockUUPSUpgradeable", function () {
  let owner, proposer, executor, timelock;

  beforeEach(async function () {
    [owner, proposer, executor] = await ethers.getSigners();
    const Timelock = await ethers.getContractFactory("TimelockUUPSUpgradeable");
    timelock = await upgrades.deployProxy(
      Timelock,
      [3600, [proposer.address], [executor.address], owner.address],
      { initializer: "initializeTimelock" }
    );
    await timelock.waitForDeployment();
  });

  it("should initialize correctly", async function () {
    const minDelay = await timelock.getMinDelay();
    expect(minDelay).to.equal(3600);
  });

  it("should allow only owner to upgrade", async function () {
    const TimelockV2 = await ethers.getContractFactory(
      "TimelockUUPSUpgradeable"
    );
    await expect(upgrades.upgradeProxy(timelock, TimelockV2.connect(proposer)))
      .to.be.rejected;
    const timelockV2 = await upgrades.upgradeProxy(
      timelock,
      TimelockV2.connect(owner)
    );
    expect(timelockV2).to.exist;
  });
});
