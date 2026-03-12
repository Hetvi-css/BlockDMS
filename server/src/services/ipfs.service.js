const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Simulated IPFS service
// In production, replace with actual IPFS/Pinata API calls

const simulateCIDGeneration = (fileBuffer) => {
  // Real IPFS CID is a content-addressed hash using multihash
  // We simulate it using SHA-256 with a Qm prefix (IPFS CIDv0 style)
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const cid = `Qm${hash.substring(0, 44)}`;
  return cid;
};

const uploadToIPFS = async (fileBuffer, fileName) => {
  // Simulate IPFS upload delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const cid = simulateCIDGeneration(fileBuffer);
  return {
    cid,
    size: fileBuffer.length,
    gateway: `https://ipfs.io/ipfs/${cid}`,
    localGateway: `http://localhost:8080/ipfs/${cid}`
  };
};

const getFromIPFS = async (cid) => {
  return {
    cid,
    gateway: `https://ipfs.io/ipfs/${cid}`,
    available: true
  };
};

module.exports = { uploadToIPFS, getFromIPFS, simulateCIDGeneration };
