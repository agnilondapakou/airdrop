import { ethers } from "hardhat";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

const hre = require("hardhat");

async function main() {
    // deploy contracts
    const [addr1, addr2, addr3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("CustomERC20");
    const token = await Token.deploy("PakouToken", "PAK", 18, ethers.parseEther("1000000"));

    const claimingAddresses = [
        [addr1.address, ethers.parseEther("100")],
        [addr2.address, ethers.parseEther("100")]
    ].map(([addr, amount]) => keccak256(ethers.solidityPacked(["address", "uint256"], [addr, amount])));

    const merkleTree = new MerkleTree(claimingAddresses, keccak256, { sortPairs: true });

    const merkleRoot = merkleTree.getHexRoot();

    const Airdrop = await ethers.getContractFactory("PakouAirdrop");

    const airdrop = await Airdrop.deploy(merkleRoot, await token.getAddress());

    await token.transfer(await airdrop.getAddress(), ethers.parseEther("100"));

    // claim tokens
    const amount = ethers.parseEther("100");
    const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [addr1.address, amount]);
    const proof = merkleTree.getHexProof(leaf);

    await airdrop.connect(addr1).claimAirdrop(amount, proof);

    // check if tokens were claimed
    console.log(await token.balanceOf(addr1.address));

    // check if user already claimed
    await airdrop.connect(addr1).claimAirdrop(amount, proof);

    // check if user is eligible to claim
    const leaf2 = ethers.solidityPackedKeccak256(["address", "uint256"], [addr3.address, amount]);
    const proof2 = merkleTree.getHexProof(leaf2);

    await airdrop.connect(addr3).claimAirdrop(amount, proof2);

    console.log("Done");

}

main ().catch ((error) => {
    console.error(error);
    process.exitCode = 1;
})