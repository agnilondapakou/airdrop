// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CustomERC20.sol";

contract PakouAirdrop is Ownable {
    bytes32 public merkleRoot;
    CustomERC20 public token;
    mapping(address => bool) public claimed;

    event AirdropClaimed(address account, uint256 amount);

    error AlreadyClaimed();
    error NotEligible();

    constructor (bytes32 _merkleRoot) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata proof) external {
        if(!claimed[msg.sender]) revert AlreadyClaimed();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        if(!MerkleProof.verify(proof, merkleRoot, leaf)) revert NotEligible();

        claimed[msg.sender] = true;
        emit AirdropClaimed(msg.sender, amount);

        token.transfer(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}