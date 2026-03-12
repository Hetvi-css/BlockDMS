const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAuditLogs);

module.exports = router;
