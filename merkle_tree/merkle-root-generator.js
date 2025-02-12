const { MerkleTree } = require('merkletreejs')

const SHA256 = require('crypto-js/sha256')

const addresses = [
    "0x9700f414bdcB4Dd211716D424D61490b42eD0883",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabc",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
    "0xcafebabecafebabecafebabecafebabecafebabe"
]

const leaves = addresses.map(x => SHA256(x))

const tree = new MerkleTree(leaves, SHA256)

const root = tree.getRoot().toString('hex')

const leaf = SHA256('0xabcdefabcdefabcdefabcdefabcdefabcdefabc')

const proof = tree.getProof(leaf)

console.log("Merkle root : " + root)
console.log(proof)
console.log(tree.verify(proof, leaf, root))