const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("MyGovernor", function () {
  let owner, proposer, voter1, voter2, executor;
  let token, timelock, governor;

  beforeEach(async function () {
    [owner, proposer, voter1, voter2, executor] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyGovernance");
    token = await upgrades.deployProxy(Token, [owner.address], {
      initializer: "initialize",
    });
    await token.waitForDeployment();

    await token.mint(voter1.address, ethers.parseEther("100"));
    await token.mint(voter2.address, ethers.parseEther("100"));
    await token.connect(voter1).delegate(voter1.address);
    await token.connect(voter2).delegate(voter2.address);

    const Timelock = await ethers.getContractFactory("TimelockUUPSUpgradeable");
    timelock = await upgrades.deployProxy(
      Timelock,
      [3600, [proposer.address], [executor.address], owner.address],
      { initializer: "initializeTimelock" }
    );
    await timelock.waitForDeployment();

    const Governor = await ethers.getContractFactory("MyGovernor");
    governor = await upgrades.deployProxy(
      Governor,
      [await token.getAddress(), await timelock.getAddress()],
      { initializer: "initialize" }
    );
    await governor.waitForDeployment();
  });

  it("should initialize correctly", async function () {
    expect(await governor.name()).to.equal("MyGovernor");
  });

  it("should create a pending proposal", async function () {
    const targets = [owner.address];
    const values = [0];
    const calldatas = [new Uint8Array()];
    const description = "Proposal #1";
    const tx = await governor
      .connect(voter1)
      .propose(targets, values, calldatas, description);
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log) => governor.interface.parseLog(log))
      .find((parsed) => parsed.name === "ProposalCreated");
    const proposalId = event.args.proposalId;

    expect(await governor.state(proposalId)).to.equal(0); // Pending
  });
});
