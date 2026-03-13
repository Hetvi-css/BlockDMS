const { getAllChainRecords, getBlockchainHistory } = require('../services/blockchain.service');
const BlockchainRecord = require('../models/BlockchainRecord.model');

// GET /api/blockchain/records
const getAllRecords = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const records = await getAllChainRecords(limit);
    const totalBlocks = await BlockchainRecord.countDocuments();
    res.json({ success: true, totalRecords: totalBlocks, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blockchain/document/:docId
const getDocumentChain = async (req, res) => {
  try {
    const history = await getBlockchainHistory(req.params.docId);
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blockchain/stats
const getBlockchainStats = async (req, res) => {
  try {
    const total = await BlockchainRecord.countDocuments();
    const byAction = await BlockchainRecord.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }]);
    const latest = await BlockchainRecord.findOne().sort({ blockNumber: -1 });
    res.json({
      success: true,
      stats: {
        totalTransactions: total,
        latestBlock: latest ? latest.blockNumber : 0,
        byAction,
        network: 'Hyperledger Fabric (Simulated)',
        channel: 'mychannel',
        chaincode: 'document-chaincode'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRecords, getDocumentChain, getBlockchainStats };
