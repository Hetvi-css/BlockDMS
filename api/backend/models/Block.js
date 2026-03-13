const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    txId: { type: String, required: true },
    type: { type: String, required: true }, // uploadDocument, approveDocument, etc.
    documentId: { type: String, default: null },
    documentHash: { type: String, default: null },
    userId: { type: String, default: null },
    data: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const blockSchema = new mongoose.Schema({
    blockIndex: { type: Number, required: true, unique: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    transactions: [transactionSchema],
    nonce: { type: Number, default: 0 },
    merkleRoot: { type: String, default: null },
    validator: { type: String, default: 'SYSTEM' }
}, { timestamps: false });

blockSchema.index({ blockIndex: 1 });
blockSchema.index({ hash: 1 });

module.exports = mongoose.model('Block', blockSchema);
