const AuditLog = require('../models/AuditLog.model');

const logAction = async ({ action, performedBy, targetDocument, targetUser, previousState, newState, ipAddress, userAgent, details, department }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetDocument: targetDocument || undefined,
      targetUser: targetUser || undefined,
      previousState,
      newState,
      ipAddress,
      userAgent,
      details,
      department
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAction };
