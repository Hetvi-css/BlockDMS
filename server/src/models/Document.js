const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
    version: Number,
    fileHash: String,
    cid: String,
    ipfsPath: String,
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    action: String,
    timestamp: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    documentType: { type: String, required: true },
    fileOriginalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileMimeType: { type: String, required: true },

    // Storage
    ipfsPath: { type: String, required: true },
    cid: { type: String, required: true, unique: true }, // SHA-256 of file = CID
    fileHash: { type: String, required: true }, // SHA-256 hash for integrity

    // Blockchain
    blockchainTxId: { type: String, default: null },
    blockIndex: { type: Number, default: null },
    blockHash: { type: String, default: null },
    isOnBlockchain: { type: Boolean, default: false },

    // Ownership
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },

    // Approval Workflow
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'escalated', 'archived'],
        default: 'pending'
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    escalatedAt: { type: Date, default: null },
    escalationReason: { type: String, default: null },

    // Versioning
    version: { type: Number, default: 1 },
    versionHistory: [documentVersionSchema],

    // Comments
    comments: [commentSchema],

    // Tags
    tags: [String],

    // Verification
    lastVerifiedAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    tamperingDetected: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
