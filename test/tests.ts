import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert } from "console";
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("Lock", function () {
  async function deployPakouAirdrop() {

    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

    const [owner, claimer] = await hre.ethers.getSigners();

    const AirdropContract = await hre.ethers.getContractFactory("PakouAirdrop");
    const airdropContract = await AirdropContract.deploy("0x0ac8f340ce5584b493a0f1488ed6111d9d220903fd9188de802b131621e680e4");

    return { airdropContract, owner, claimer, ADDRESS_ZERO};
  }

  describe("Deploy PakouAirdrop", function () {
    it("Should deploy PakouAirdrop", async function () {
      let { airdropContract, owner } = await loadFixture(deployPakouAirdrop);

      const runner = airdropContract.runner as HardhatEthersSigner;

      expect(runner.address).to.be.equal(owner.address);
    });

    it("Should not be address 0", async function () {
      let { airdropContract, ADDRESS_ZERO } = await loadFixture(deployPakouAirdrop);

      expect(airdropContract.target).to.be.not.equal(ADDRESS_ZERO)
    });
  });

  describe("Claim PAK", function () {
    it("Should fail if user alredy claimed", async function () {
      let { airdropContract } = await loadFixture(deployPakouAirdrop);

      expect(airdropContract.claimed).to.be.revertedWith("Already claimed");
    });

    it("Should fail if user is not in the waitlist", async function () {
      let { airdropContract } = await loadFixture(deployPakouAirdrop);

    });
  });

});
