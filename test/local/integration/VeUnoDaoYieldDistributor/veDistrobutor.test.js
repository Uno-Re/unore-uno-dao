const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = ethers;

describe("VeUnoDaoYieldDistributor", function() {
  const YEAR = BigNumber.from(86400 * 365);
  const WEEK = BigNumber.from(86400 * 7);

  const name = "UnoRe Token";
  const symbol = "UnoRe";
  const decimal = 18;

  const MAX_TIME = YEAR.mul("4");
  const two_to_the_256_minus_1 = BigNumber.from("2").pow(BigNumber.from("256")).sub(BigNumber.from("1"));
  const ten_to_the_40 = BigNumber.from("10000000000000000000000000000000000000000");

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  before(async function() {

  });

  beforeEach(async function() {
    this.signers = await ethers.getSigners();
    this.creator = this.signers[0];
    this.alice = this.signers[1];
    this.bob = this.signers[2];
    this.migrator = this.signers[3];
    const accounts = [this.creator, this.alice, this.bob];
    this.Ownership = await ethers.getContractFactory("Ownership");
    this.Token = await ethers.getContractFactory("MockUno");
    this.VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    this.VeUnoDaoYieldDistributor = await ethers.getContractFactory("VeUnoDaoYieldDistributor");

    this.ownership = await this.Ownership.deploy();
    this.token = await this.Token.deploy(name, symbol);
    this.voting_escrow = await this.VotingEscrow.deploy(
      this.token.address, "Voting-escrowed UnoRe", "veUnoRe", "1", this.ownership.address,this.migrator.address
    );

    this.veUnoDaoYieldDistributor = await upgrades.deployProxy(this.VeUnoDaoYieldDistributor, [
      this.token.address,
      this.voting_escrow.address,
      this.creator.address,
      this.creator.address
    ]);
    await this.veUnoDaoYieldDistributor.deployed();

    //init
    for (i = 0; i < accounts.length; i++) {
      await this.token.connect(accounts[i]).faucet(ten_to_the_40);
      await this.token.connect(accounts[i]).approve(this.voting_escrow.address, two_to_the_256_minus_1);
    }

    this.rewardAmount = BigNumber.from(1000000).mul(BigNumber.from(10).pow(18)); // one million UNO for reward
    await this.token.transfer(this.veUnoDaoYieldDistributor.address, this.rewardAmount);
    await this.veUnoDaoYieldDistributor.setYieldRate(BigNumber.from(1).mul(BigNumber.from(10).pow(17)), false); // 0.1 UNO for 1 second
    const timestamp = ~~(new Date().getTime() / 1000);

    //setup
    this.escrowedAmount = BigNumber.from(1000).mul(BigNumber.from(10).pow(18));
  });

  it("veToken distributor flow", async function() {
    let aliceUNOBalance = await this.token.balanceOf(this.alice.address);
    console.log('aliceUnoBalance ==>', aliceUNOBalance.toString());

    await this.voting_escrow.connect(this.alice).create_lock(this.escrowedAmount, MAX_TIME);
    let veBalance = await this.voting_escrow["balanceOf(address)"](this.alice.address);
    console.log("Account veToken balance ==>", veBalance.toString());

    // await this.veUnoDaoYieldDistributor.connect(this.alice).getYield();
    aliceUNOBalance = await this.token.balanceOf(this.alice.address);
    console.log('Alice UNO Balance ==>', aliceUNOBalance.toString());

    // increase block time 4 weeks
    await ethers.provider.send("evm_increaseTime", [
      WEEK.mul(4).toNumber(),
    ]);
    await ethers.provider.send("evm_mine");

    // after 4 weeks
    veBalance = await this.voting_escrow["balanceOf(address)"](this.alice.address);
    console.log("Account veToken balance ==>", veBalance.toString());

    console.log("\n\n=== Checkpoint ===\n");
    await this.veUnoDaoYieldDistributor.connect(this.alice).checkpoint();

    console.log("\n\n=== First getting yield ===\n");
    await this.veUnoDaoYieldDistributor.connect(this.alice).getYield();
    aliceUNOBalance = await this.token.balanceOf(this.alice.address);
    console.log('Alice UNO Balance ==>', aliceUNOBalance.toString());
    let userLocked = await this.voting_escrow.locked(this.alice.address);
    console.log('userLocked ==>', userLocked.amount.toString());

    console.log("\n\n=== Second getting yield ===\n");
    await this.veUnoDaoYieldDistributor.connect(this.alice).getYield();
    aliceUNOBalance = await this.token.balanceOf(this.alice.address);
    console.log('Alice UNO Balance ==>', aliceUNOBalance.toString());
  })
})
