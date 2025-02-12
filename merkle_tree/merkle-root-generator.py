import hashlib


def keccak256(waitlist: str) -> str:
    return hashlib.sha3_256(waitlist.encode("utf-8")).hexdigest()

def buid_merkle_tree(leaves: list) -> str:
    if len(leaves) == 0:
        return None
    
    # Hash leaves
    layer = [keccak256(leaf) for leaf in leaves]
    
    # Build the tree until we reach the root
    while len(layer) > 1:
        # if add number of elements, duplicate the last one
        if len(layer) % 2 != 0:
            layer.append(layer[-1])
            
        # Hash pairs of nodes
        layer = [keccak256(layer[i] + layer[i + 1]) for i in range(0, len(layer), 2)]
        
    # Return the root
    return layer[0]

def get_proof(index: int, tree_layers: list) -> list:
    proof = []
    for layer in tree_layers[:-1]: # exclude the root layer
        is_right_node = index % 2 == 1 # check if the node is right or left
        pair_index = index + 1 if is_right_node else index - 1 # get the index of the pair node
        
        if pair_index < len(layer):
            proof.append(layer[pair_index])
            
        index //= 2 # move to the next layer
    return proof

waitlist = [
    "0x1234567890abcdef1234567890abcdef12345678 | 100"
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd | 200"
    "0x7890123456789012345678901234567890123456 | 300"
    "0xfedcba9876543210fedcba9876543210fedcba98 | 400"
    "0x1111111111111111111111111111111111111111 | 500"
    "0x2222222222222222222222222222222222222222 | 600"
    "0x3333333333333333333333333333333333333333 | 700"
    "0x4444444444444444444444444444444444444444 | 800"
    "0x5555555555555555555555555555555555555555 | 900"
    "0x6666666666666666666666666666666666666666 | 1000"
]

# Generate the merkle tree and get the root
merkle_root = buid_merkle_tree(waitlist)
tree_layers = buid_merkle_tree(waitlist)

print("Merkle root : " + merkle_root)

merkle_proof = get_proof(1, tree_layers)

print(merkle_proof)
    