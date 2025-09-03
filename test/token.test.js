const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("MyGovernance Token", function () {
  let token, owner, addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyGovernance");
    token = await upgrades.deployProxy(Token, [owner.address], {
      initializer: "initialize",
    });
  });

  it("should initialize correctly", async function () {
    expect(await token.name()).to.equal("MyGovernance");
    expect(await token.symbol()).to.equal("MGT");
    expect(await token.owner()).to.equal(owner.address);
  });

  it("should allow only owner to mint", async function () {
    await token.mint(owner.address, 100n);
    expect(await token.balanceOf(owner.address)).to.equal(100n);

    await expect(
      token.connect(addr1).mint(addr1.address, 50n)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("should track voting power correctly", async function () {
    await token.mint(addr1.address, 100n);
    await token.connect(addr1).delegate(addr1.address);
    expect(await token.getVotes(addr1.address)).to.equal(100n);
  });
});
