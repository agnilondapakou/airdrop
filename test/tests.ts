import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("PakouAirdrop", function () {
  const deployContracts = async () => {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("CustomERC20");
    const token = await Token.deploy("PakouToken", "PAK", 18, ethers.parseEther("1000000"));
    await token.waitForDeployment();

    const claimingAddresses = [
        [addr1.address, ethers.parseEther("100")],
        [addr2.address, ethers.parseEther("100")]
      ].map(([addr, amount]) => keccak256(ethers.solidityPacked(["address", "uint256"], [addr, amount])));
      
    const merkleTree = new MerkleTree(claimingAddresses, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    const Airdrop = await ethers.getContractFactory("PakouAirdrop");
    const airdrop = await Airdrop.deploy(merkleRoot, await token.getAddress());
    await airdrop.waitForDeployment();

    await token.transfer(await airdrop.getAddress(), ethers.parseEther("100"));

    return { airdrop, token, owner, addr1, addr2, addr3, merkleTree };
  };

  it("Permet aux utilisateurs éligibles de réclamer l'airdrop", async function () {
    const { airdrop, token, addr1, merkleTree } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("100");
    const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, amount]);
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr1).claimAirdrop(amount, proof))
      .to.emit(airdrop, "AirdropClaimed")
      .withArgs(addr1.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("Empêche une double réclamation", async function () {
    const { airdrop, addr1, merkleTree } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("100");
    const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, amount]);
    const proof = merkleTree.getHexProof(leaf);

    await airdrop.connect(addr1).claimAirdrop(amount, proof);

    await expect(airdrop.connect(addr1).claimAirdrop(amount, proof))
      .to.be.revertedWith("Already claimed");
  });

  it("Empêche un utilisateur non éligible de réclamer", async function () {
    const { airdrop, addr1,addr3, merkleTree } = await loadFixture(deployContracts);
    const amount = ethers.parseEther("100");
    const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, amount]);
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr3).claimAirdrop(amount, proof))
      .to.be.revertedWith("Not eligible");
  });

  it("Permet au propriétaire de mettre à jour le Merkle Root", async function () {
    const { airdrop, owner } = await loadFixture(deployContracts);
    const newMerkleRoot = ethers.keccak256(ethers.toUtf8Bytes("new root"));
    await expect(airdrop.connect(owner).updateMerkleRoot(newMerkleRoot))
      .to.not.be.reverted;
    expect(await airdrop.merkleRoot()).to.equal(newMerkleRoot);
  });

  it("Empêche un non-propriétaire de mettre à jour le Merkle Root", async function () {
    const { airdrop, addr1 } = await loadFixture(deployContracts);
    const newMerkleRoot = ethers.keccak256(ethers.toUtf8Bytes("new root"));
    await expect(airdrop.connect(addr1).updateMerkleRoot(newMerkleRoot))
    .to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount");
  
  });
});