const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  cid: { type: String },
  hash: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeNote: { type: String }
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ['report', 'contract', 'policy', 'invoice', 'research', 'proposal', 'other'], default: 'other' },
  fileName: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  fileData: { type: String }, // base64 encoded file (for demo without real IPFS)
  cid: { type: String, default: null }, // IPFS CID
  hash: { type: String, required: true }, // SHA-256 hash
  blockchainTxId: { type: String, default: null }, // Blockchain transaction ID
  blockchainBlock: { type: Number, default: null }, // Block number
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'escalated'],
    default: 'pending'
  },
  currentVersion: { type: Number, default: 1 },
  versions: [documentVersionSchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  comments: [commentSchema],
  rejectionReason: { type: String },
  escalatedAt: { type: Date },
  approvedAt: { type: Date },
  tags: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  tamperingDetected: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
