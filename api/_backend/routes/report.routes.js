const express = require('express');
const router = express.Router();
const { getOverviewReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/overview', authorize('admin', 'hod'), getOverviewReport);

module.exports = router;
