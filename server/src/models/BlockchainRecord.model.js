const mongoose = require('mongoose');

const blockchainRecordSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  transactionId: { type: String, required: true, unique: true },
  blockNumber: { type: Number, required: true },
  blockHash: { type: String, required: true },
  documentHash: { type: String, required: true },
  action: { type: String, enum: ['UPLOAD', 'APPROVE', 'REJECT', 'ESCALATE', 'VERIFY'], required: true },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  smartContract: { type: String, default: 'DocumentRegistry' },
  channelName: { type: String, default: 'mychannel' },
  chaincodeName: { type: String, default: 'document-chaincode' },
  payload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('BlockchainRecord', blockchainRecordSchema);
