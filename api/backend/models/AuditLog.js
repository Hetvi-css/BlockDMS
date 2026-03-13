const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    documentTitle: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: {
        type: String,
        required: true,
        enum: [
            'USER_REGISTERED', 'USER_APPROVED', 'USER_REJECTED', 'USER_LOGIN', 'USER_LOGOUT',
            'USER_DEACTIVATED', 'USER_ACTIVATED', 'USER_UPDATED',
            'DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_VIEWED',
            'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'DOCUMENT_ESCALATED',
            'DOCUMENT_VERIFIED', 'DOCUMENT_TAMPERED', 'DOCUMENT_ARCHIVED',
            'BLOCKCHAIN_ENTRY', 'BLOCKCHAIN_VERIFIED',
            'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED',
            'REPORT_GENERATED', 'SYSTEM_ACCESS'
        ]
    },
    previousState: { type: mongoose.Schema.Types.Mixed, default: null },
    newState: { type: mongoose.Schema.Types.Mixed, default: null },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
    blockchainTxId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

// Index for fast queries
auditLogSchema.index({ documentId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
