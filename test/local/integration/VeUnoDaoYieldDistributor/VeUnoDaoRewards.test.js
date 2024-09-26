const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { getBigNumber } = require("../../../../scripts/shared/utilities");

const VeUnoDaoYieldDistributorAbi = require("../../../../scripts/abis/VeUnoDistributor.json");
const mockUnoAbi = require("../../../../scripts/abis/MockUno.json");

describe("VeUnoDaoYieldDistributor", function () {
  before(async function () {
    this.VeUnoDaoYieldDistributor = await ethers.getContractFactory(
      "VeUnoDaoYieldDistributor"
    );

    this.MockUno = await ethers.getContractFactory("MockUno");

    this.signers = await ethers.getSigners();
  });

  beforeEach(async function () {
    this.VeUnoDaoYieldDistributor = await ethers.getContractAt(
      VeUnoDaoYieldDistributorAbi,
      "0x0F8862fF7275620bBCc111908E47bAC5feC05b31"
    );

    this.MockUno = await ethers.getContractAt(
      mockUnoAbi,
      "0x474021845C4643113458ea4414bdb7fB74A01A77"
    );

    this.multisig = await ethers.getSigner(
      "0x91D6e9cdad0a61EDAB4139F2E3171029f2e3607b"
    );

    this.notifierAddress = await ethers.getSigner(
      "0x1eeab8b3f0136f06bedf45170e8d5fa1e5289a29"
    );

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x91D6e9cdad0a61EDAB4139F2E3171029f2e3607b"],
    });

    this.UnoMillionaire = await ethers.getSigner(
      "0xCBCe172d7af2616804ab5b2494102dAeC47B2635"
    );
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xCBCe172d7af2616804ab5b2494102dAeC47B2635"],
    });

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x1eeab8b3f0136f06bedf45170e8d5fa1e5289a29"],
    });

    await network.provider.send("hardhat_setBalance", [
      "0xCBCe172d7af2616804ab5b2494102dAeC47B2635",
      "0x1000000000000000000000000000000000",
    ]);

    await network.provider.send("hardhat_setBalance", [
      "0x91D6e9cdad0a61EDAB4139F2E3171029f2e3607b",
      "0x1000000000000000000000000000000000",
    ]);

    await network.provider.send("hardhat_setBalance", [
      "0x1eeab8b3f0136f06bedf45170e8d5fa1e5289a29",
      "0x1000000000000000000000000000000000",
    ]);

    this.clientAddress = "0xa75e5e7f3d094b592c4e4522d2a7df0248e4dd26";
  });

  describe("VeUnoDaoYieldDistributor rewards test", function () {
    const three_months_in_seconds = 2629800;

    it("Should set new yield duration", async function () {
      await (
        await this.VeUnoDaoYieldDistributor.connect(
          this.multisig
        ).setYieldDuration(three_months_in_seconds)
      ).wait(); // 3 months in seconds

      const block = await ethers.provider.getBlock("latest");
      const blockNow = block.timestamp;

      const yieldDuration = await this.VeUnoDaoYieldDistributor.yieldDuration();
      expect(yieldDuration).to.be.eq(three_months_in_seconds);
    });

    it("Should notify new rewards and check client address rewards", async function () {
      await this.MockUno.connect(this.UnoMillionaire).transfer(
        this.notifierAddress.address,
        getBigNumber("50000", 18)
      );

      await this.MockUno.connect(this.notifierAddress).approve(
        this.VeUnoDaoYieldDistributor.address,
        getBigNumber("50000", 18)
      );

      await this.VeUnoDaoYieldDistributor.connect(
        this.notifierAddress
      ).notifyRewardAmount(getBigNumber("50000", 18));

      const earned = await this.VeUnoDaoYieldDistributor.earned(
        this.clientAddress
      );

      expect(earned).to.be.eq(0);

      await hre.network.provider.send("hardhat_mine", ["0x1"]);

      const earnedAfter = await this.VeUnoDaoYieldDistributor.earned(
        this.clientAddress
      );

      console.log(earnedAfter);
      expect(earnedAfter).to.be.above(0);
    });
  });
});
