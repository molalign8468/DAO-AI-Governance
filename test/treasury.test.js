const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Treasury", function () {
  let treasury;
  let governor, user, anotherUser;

  beforeEach(async function () {
    [governor, user, anotherUser] = await ethers.getSigners();

    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    treasury = await TreasuryFactory.deploy(governor.address);
    await treasury.waitForDeployment();
  });

  it("should set the correct governor on deployment", async function () {
    expect(await treasury.governor()).to.equal(governor.address);
  });

  it("should have an owner address of 0x0...0", async function () {
    expect(await treasury.owner()).to.equal(ethers.ZeroAddress);
  });

  it("should receive Ether via the receive() function and emit an event", async function () {
    const depositAmount = ethers.parseEther("1.0");

    await expect(
      user.sendTransaction({
        to: await treasury.getAddress(),
        value: depositAmount,
      })
    )
      .to.emit(treasury, "Deposited")
      .withArgs(user.address, depositAmount);

    expect(await treasury.getBalance()).to.equal(depositAmount);
  });

  it("should allow deposits via the deposit() function and emit an event", async function () {
    const depositAmount = ethers.parseEther("1.0");

    await expect(treasury.connect(user).deposit({ value: depositAmount }))
      .to.emit(treasury, "Deposited")
      .withArgs(user.address, depositAmount);

    expect(await treasury.getBalance()).to.equal(depositAmount);
  });

  it("should allow the governor to transfer funds", async function () {
    const initialDeposit = ethers.parseEther("10.0");
    const transferAmount = ethers.parseEther("2.0");

    await governor.sendTransaction({
      to: await treasury.getAddress(),
      value: initialDeposit,
    });

    const recipientInitialBalance = await ethers.provider.getBalance(
      anotherUser.address
    );

    await expect(
      treasury.connect(governor).transfer(anotherUser.address, transferAmount)
    )
      .to.emit(treasury, "Transferred")
      .withArgs(anotherUser.address, transferAmount);

    const recipientFinalBalance = await ethers.provider.getBalance(
      anotherUser.address
    );
    expect(recipientFinalBalance - recipientInitialBalance).to.equal(
      transferAmount
    );
  });

  it("should revert if a non-governor tries to transfer funds", async function () {
    const initialDeposit = ethers.parseEther("1.0");
    await user.sendTransaction({
      to: await treasury.getAddress(),
      value: initialDeposit,
    });

    await expect(
      treasury
        .connect(user)
        .transfer(anotherUser.address, ethers.parseEther("0.5"))
    ).to.be.revertedWith("Only governor can call");
  });

  it("should revert if the governor tries to transfer more than the balance", async function () {
    const initialDeposit = ethers.parseEther("1.0");
    await user.sendTransaction({
      to: await treasury.getAddress(),
      value: initialDeposit,
    });

    await expect(
      treasury
        .connect(governor)
        .transfer(anotherUser.address, ethers.parseEther("2.0"))
    ).to.be.revertedWith("Not enough funds in Treasury");
  });

  // Test Case 4: Changing Governor
  it("should allow anyone to change the governor address (VULNERABILITY)", async function () {
    // This test highlights the security vulnerability of an unprotected setGovernor function.
    const newGovernor = anotherUser.address;

    await treasury.connect(user).setGovernor(newGovernor);

    expect(await treasury.governor()).to.equal(newGovernor);
  });
});
