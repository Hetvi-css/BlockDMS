const express = require('express');
const router = express.Router();
const { getAllRecords, getDocumentChain, getBlockchainStats } = require('../controllers/blockchain.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getBlockchainStats);
router.get('/records', authorize('admin', 'hod'), getAllRecords);
router.get('/document/:docId', getDocumentChain);

module.exports = router;
