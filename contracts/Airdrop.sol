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

    constructor (bytes32 _merkleRoot, address _token) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        token = CustomERC20(_token);
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not eligible");

        claimed[msg.sender] = true;
        emit AirdropClaimed(msg.sender, amount);

        token.transfer(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}