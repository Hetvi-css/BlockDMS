const AuditLog = require('../models/AuditLog');

/**
 * AuditService - Logs every system action for complete audit trail
 */
class AuditService {
    static async log({
        documentId = null,
        documentTitle = null,
        userId,
        userName,
        userRole,
        action,
        previousState = null,
        newState = null,
        details = '',
        ipAddress = 'unknown',
        userAgent = 'unknown',
        blockchainTxId = null
    }) {
        try {
            const entry = await AuditLog.create({
                documentId,
                documentTitle,
                userId,
                userName,
                userRole,
                action,
                previousState,
                newState,
                details,
                ipAddress,
                userAgent,
                blockchainTxId,
                timestamp: new Date()
            });
            return entry;
        } catch (error) {
            console.error('Audit log failed:', error.message);
            return null;
        }
    }

    static async getByDocument(documentId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog.find({ documentId }).sort({ timestamp: -1 }).skip(skip).limit(limit).populate('userId', 'name email role'),
            AuditLog.countDocuments({ documentId })
        ]);
        return { logs, total, page, totalPages: Math.ceil(total / limit) };
    }

    static async getAll(filters = {}, page = 1, limit = 50) {
        const query = {};
        if (filters.userId) query.userId = filters.userId;
        if (filters.action) query.action = filters.action;
        if (filters.documentId) query.documentId = filters.documentId;
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
            if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
        }

        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
            AuditLog.countDocuments(query)
        ]);
        return { logs, total, page, totalPages: Math.ceil(total / limit) };
    }

    static async getStats() {
        const total = await AuditLog.countDocuments();
        const byAction = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(10);
        return { total, byAction, recentActivity };
    }
}

module.exports = AuditService;
