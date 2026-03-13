const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const BlockchainService = require('../services/blockchainService');
const AuditService = require('../services/auditService');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin', 'hod'));

// GET /api/approvals/pending
router.get('/pending', async (req, res) => {
    try {
        const query = { status: { $in: ['pending', 'under_review', 'escalated'] } };
        if (req.user.role === 'hod') {
            query.department = req.user.department?._id || req.user.department;
        }

        const docs = await Document.find(query)
            .populate('uploadedBy', 'name email')
            .populate('department', 'name code')
            .sort({ createdAt: -1 });

        res.json({ success: true, documents: docs, total: docs.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/approvals/:id/approve
router.patch('/:id/approve', async (req, res) => {
    try {
        const { comment } = req.body;
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

        if (!['pending', 'under_review', 'escalated'].includes(doc.status)) {
            return res.status(400).json({ success: false, message: `Cannot approve document with status: ${doc.status}` });
        }

        // HOD can only approve docs in their department
        if (req.user.role === 'hod') {
            const deptId = req.user.department?._id?.toString() || req.user.department?.toString();
            if (doc.department.toString() !== deptId) {
                return res.status(403).json({ success: false, message: 'Access denied: Not your department.' });
            }
        }

        const previousStatus = doc.status;
        doc.status = 'approved';
        doc.approvedBy = req.user._id;
        doc.approvedAt = new Date();
        doc.reviewedBy = req.user._id;
        doc.reviewedAt = new Date();

        if (comment) {
            doc.comments.push({ user: req.user._id, comment, action: 'approved', timestamp: new Date() });
        }

        await doc.save();

        // Blockchain: approveDocument()
        const bcResult = await BlockchainService.approveDocument(doc._id, doc.fileHash, req.user._id, previousStatus);
        doc.blockchainTxId = bcResult.txId;
        await doc.save();

        await AuditService.log({
            documentId: doc._id, documentTitle: doc.title,
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DOCUMENT_APPROVED',
            previousState: { status: previousStatus }, newState: { status: 'approved' },
            details: `Document approved. Comment: ${comment || 'None'}`,
            blockchainTxId: bcResult.txId, ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document approved successfully.', document: doc, blockchain: bcResult });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/approvals/:id/reject
router.patch('/:id/reject', async (req, res) => {
    try {
        const { comment, reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required.' });

        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

        const previousStatus = doc.status;
        doc.status = 'rejected';
        doc.reviewedBy = req.user._id;
        doc.reviewedAt = new Date();
        doc.comments.push({ user: req.user._id, comment: reason, action: 'rejected', timestamp: new Date() });
        if (comment && comment !== reason) {
            doc.comments.push({ user: req.user._id, comment, action: 'additional_comment', timestamp: new Date() });
        }

        await doc.save();

        // Blockchain: rejectDocument()
        const bcResult = await BlockchainService.rejectDocument(doc._id, doc.fileHash, req.user._id, reason);

        await AuditService.log({
            documentId: doc._id, documentTitle: doc.title,
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DOCUMENT_REJECTED',
            previousState: { status: previousStatus }, newState: { status: 'rejected' },
            details: `Document rejected. Reason: ${reason}`,
            blockchainTxId: bcResult.txId, ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document rejected.', document: doc, blockchain: bcResult });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/approvals/:id/escalate (HOD to Admin)
router.patch('/:id/escalate', requireRole('hod'), async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Escalation reason is required.' });

        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

        const admin = await User.findOne({ role: 'admin', isActive: true });
        if (!admin) return res.status(500).json({ success: false, message: 'No active admin found for escalation.' });

        const previousStatus = doc.status;
        doc.status = 'escalated';
        doc.escalatedTo = admin._id;
        doc.escalatedAt = new Date();
        doc.escalationReason = reason;
        doc.comments.push({ user: req.user._id, comment: `Escalated to Admin: ${reason}`, action: 'escalated', timestamp: new Date() });

        await doc.save();

        // Blockchain: escalateDocument()
        const bcResult = await BlockchainService.escalateDocument(doc._id, doc.fileHash, req.user._id, admin._id, reason);

        await AuditService.log({
            documentId: doc._id, documentTitle: doc.title,
            userId: req.user._id, userName: req.user.name, userRole: req.user.role,
            action: 'DOCUMENT_ESCALATED',
            previousState: { status: previousStatus }, newState: { status: 'escalated', escalatedTo: admin.name },
            details: `Escalated to admin. Reason: ${reason}`,
            blockchainTxId: bcResult.txId, ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document escalated to Admin.', document: doc, blockchain: bcResult, escalatedTo: admin.name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
