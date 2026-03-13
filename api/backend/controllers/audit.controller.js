const AuditLog = require('../models/AuditLog.model');

// GET /api/audit - Admin sees all, others see their own
const getAuditLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 50, startDate, endDate } = req.query;
    const filter = {};
    if (req.user.role !== 'admin') filter.performedBy = req.user._id;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .populate('targetDocument', 'title fileName')
      .populate('targetUser', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, total, count: logs.length, pages: Math.ceil(total / parseInt(limit)), logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAuditLogs };
