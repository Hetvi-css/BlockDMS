const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const BlockchainRecord = require('../models/BlockchainRecord.model');

// Simulated Hyperledger Fabric blockchain service
// In production, replace with actual fabric-network SDK calls

let currentBlockNumber = 1000; // Start at block 1000 for realism

const generateTransactionId = () => {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
};

const generateBlockHash = (blockNumber, txId, documentHash) => {
  const data = `${blockNumber}${txId}${documentHash}${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

const computeSHA256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

const registerDocumentOnChain = async (documentId, documentHash, userId, action = 'UPLOAD') => {
  currentBlockNumber++;
  const txId = generateTransactionId();
  const blockHash = generateBlockHash(currentBlockNumber, txId, documentHash);

  const record = await BlockchainRecord.create({
    documentId,
    transactionId: txId,
    blockNumber: currentBlockNumber,
    blockHash,
    documentHash,
    action,
    initiatedBy: userId,
    smartContract: 'DocumentRegistry',
    channelName: 'mychannel',
    chaincodeName: 'document-chaincode',
    payload: { documentId, action, timestamp: new Date().toISOString() }
  });

  return {
    transactionId: txId,
    blockNumber: currentBlockNumber,
    blockHash,
    timestamp: record.timestamp
  };
};

const verifyDocumentOnChain = async (documentHash, documentId) => {
  const records = await BlockchainRecord.find({ documentId }).sort({ timestamp: 1 });
  if (!records || records.length === 0) {
    return { verified: false, reason: 'No blockchain record found for this document.' };
  }
  const originalRecord = records[0];
  if (originalRecord.documentHash === documentHash) {
    return {
      verified: true,
      originalHash: originalRecord.documentHash,
      currentHash: documentHash,
      transactionId: originalRecord.transactionId,
      blockNumber: originalRecord.blockNumber,
      blockHash: originalRecord.blockHash,
      registeredAt: originalRecord.timestamp,
      totalRecords: records.length
    };
  } else {
    return {
      verified: false,
      reason: 'Document hash mismatch — tampering detected!',
      originalHash: originalRecord.documentHash,
      currentHash: documentHash,
      transactionId: originalRecord.transactionId,
      blockNumber: originalRecord.blockNumber
    };
  }
};

const getBlockchainHistory = async (documentId) => {
  return BlockchainRecord.find({ documentId })
    .populate('initiatedBy', 'name email role')
    .sort({ timestamp: 1 });
};

const getAllChainRecords = async (limit = 50) => {
  return BlockchainRecord.find()
    .populate('initiatedBy', 'name email role')
    .populate('documentId', 'title fileName')
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = {
  computeSHA256,
  registerDocumentOnChain,
  verifyDocumentOnChain,
  getBlockchainHistory,
  getAllChainRecords
};
