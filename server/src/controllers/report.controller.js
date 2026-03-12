const Document = require('../models/Document.model');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const BlockchainRecord = require('../models/BlockchainRecord.model');

// GET /api/reports/overview
const getOverviewReport = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalChainTx = await BlockchainRecord.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();

    const docsByStatus = await Document.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const docsByCategory = await Document.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const docsByDept = await Document.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);

    const recentActivity = await AuditLog.find()
      .populate('performedBy', 'name role')
      .populate('targetDocument', 'title')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      overview: {
        totalDocuments, totalUsers, totalChainTx, totalAuditLogs,
        docsByStatus, docsByCategory, docsByDept
      },
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOverviewReport };
