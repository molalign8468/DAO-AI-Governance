const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DAO Lifecycle Integration Tests", function () {
  async function deployDAOFixture() {
    const [deployer, voter1, voter2, voter3] = await ethers.getSigners();

    const MyGovernance = await ethers.getContractFactory("MyGovernance");
    const governanceToken = await upgrades.deployProxy(
      MyGovernance,
      [deployer.address],
      {
        initializer: "initialize",
      }
    );
    await governanceToken.waitForDeployment();

    const tokenAmount = ethers.parseEther("1000");
    await governanceToken.mint(voter1.address, tokenAmount);
    await governanceToken.mint(voter2.address, tokenAmount);
    await governanceToken.mint(voter3.address, tokenAmount);

    await governanceToken.connect(voter1).delegate(voter1.address);
    await governanceToken.connect(voter2).delegate(voter2.address);
    await governanceToken.connect(voter3).delegate(voter3.address);

    const Timelock = await ethers.getContractFactory("TimelockUUPSUpgradeable");
    const minDelay = 2;
    const proposers = [deployer.address];
    const executors = [deployer.address];
    const timelock = await upgrades.deployProxy(
      Timelock,
      [minDelay, proposers, executors, deployer.address],
      {
        initializer: "initializeTimelock",
      }
    );
    await timelock.waitForDeployment();

    const Governor = await ethers.getContractFactory("MyGovernor");
    const governor = await upgrades.deployProxy(
      Governor,
      [await governanceToken.getAddress(), await timelock.getAddress()],
      {
        initializer: "initialize",
      }
    );
    await governor.waitForDeployment();

    const governorAddress = await governor.getAddress();
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

    await timelock.grantRole(PROPOSER_ROLE, governorAddress);
    await timelock.grantRole(EXECUTOR_ROLE, governorAddress);

    await governanceToken.transferOwnership(await timelock.getAddress());

    return {
      governanceToken,
      timelock,
      governor,
      deployer,
      voter1,
      voter2,
      voter3,
      minDelay,
    };
  }

  describe("DAO Setup", function () {
    it("Should deploy all contracts correctly", async function () {
      const { governanceToken, timelock, governor } = await loadFixture(
        deployDAOFixture
      );

      expect(ethers.isAddress(await governanceToken.getAddress())).to.be.true;
      expect(ethers.isAddress(await timelock.getAddress())).to.be.true;
      expect(ethers.isAddress(await governor.getAddress())).to.be.true;
    });

    it("Should set correct roles in timelock", async function () {
      const { timelock, governor } = await loadFixture(deployDAOFixture);

      const governorAddress = await governor.getAddress();
      const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
      const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

      expect(await timelock.hasRole(PROPOSER_ROLE, governorAddress)).to.be.true;
      expect(await timelock.hasRole(EXECUTOR_ROLE, governorAddress)).to.be.true;
    });

    it("Should transfer token ownership to timelock", async function () {
      const { governanceToken, timelock } = await loadFixture(deployDAOFixture);

      expect(await governanceToken.owner()).to.equal(
        await timelock.getAddress()
      );
    });

    it("Should distribute tokens to voters", async function () {
      const { governanceToken, voter1, voter2, voter3 } = await loadFixture(
        deployDAOFixture
      );

      const balance1 = await governanceToken.balanceOf(voter1.address);
      const balance2 = await governanceToken.balanceOf(voter2.address);
      const balance3 = await governanceToken.balanceOf(voter3.address);

      expect(balance1).to.equal(ethers.parseEther("1000"));
      expect(balance2).to.equal(ethers.parseEther("1000"));
      expect(balance3).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Proposal Lifecycle", function () {
    it("Should create and vote on a proposal", async function () {
      const { governor, voter1, voter2, voter3 } = await loadFixture(
        deployDAOFixture
      );

      const targets = [await governor.getAddress()];
      const values = [0];
      const calldatas = [
        governor.interface.encodeFunctionData("updateTiming", [2, 12, 1]),
      ];
      const description = "Update governor timing parameters";

      const proposalTx = await governor
        .connect(voter1)
        .propose(targets, values, calldatas, description);

      const receipt = await proposalTx.wait();
      const proposalId = receipt.logs[0].args[0];

      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");

      const state = await governor.state(proposalId);
      expect(Number(state)).to.equal(1);

      await governor.connect(voter1).castVote(proposalId, 1);
      await governor.connect(voter2).castVote(proposalId, 1);
      await governor.connect(voter3).castVote(proposalId, 0);

      const proposalVotes = await governor.proposalVotes(proposalId);
      expect(proposalVotes.forVotes).to.be.above(0);
      expect(proposalVotes.againstVotes).to.be.above(0);
    });

    it("Should execute a successful proposal", async function () {
      const { governor, voter1, voter2, minDelay } = await loadFixture(
        deployDAOFixture
      );

      const targets = [await governor.getAddress()];
      const values = [0];
      const calldatas = [
        governor.interface.encodeFunctionData("updateTiming", [2, 12, 1]),
      ];
      const description = "Update governor timing parameters";
      const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));

      const proposalTx = await governor
        .connect(voter1)
        .propose(targets, values, calldatas, description);

      const receipt = await proposalTx.wait();
      const proposalId = receipt.logs[0].args[0];

      await ethers.provider.send("evm_mine");

      await governor.connect(voter1).castVote(proposalId, 1);
      await governor.connect(voter2).castVote(proposalId, 1);

      for (let i = 0; i < 9; i++) {
        await ethers.provider.send("evm_mine");
      }

      await governor.queue(targets, values, calldatas, descriptionHash);

      await ethers.provider.send("evm_increaseTime", [minDelay + 1]);
      await ethers.provider.send("evm_mine");

      await governor.execute(targets, values, calldatas, descriptionHash);

      const votingDelay = await governor.votingDelay();
      expect(Number(votingDelay)).to.equal(2);
    });
  });
});
