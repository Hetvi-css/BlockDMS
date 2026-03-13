const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
      'DOCUMENT_UPLOADED', 'DOCUMENT_VIEWED', 'DOCUMENT_DOWNLOADED',
      'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'DOCUMENT_ESCALATED',
      'DOCUMENT_VERIFIED', 'DOCUMENT_TAMPERED',
      'BLOCKCHAIN_RECORDED', 'IPFS_STORED',
      'SYSTEM_CONFIG'
    ]
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: String },
  department: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetDocument: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
