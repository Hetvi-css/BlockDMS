const express = require('express');
const router = express.Router();
const {
  uploadDocument, getDocuments, getDocumentById,
  approveDocument, rejectDocument, escalateDocument,
  verifyDocument, getDocumentStats
} = require('../controllers/document.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getDocumentStats);
router.post('/upload', uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.patch('/:id/approve', authorize('hod', 'admin'), approveDocument);
router.patch('/:id/reject', authorize('hod', 'admin'), rejectDocument);
router.patch('/:id/escalate', authorize('hod'), escalateDocument);
router.post('/:id/verify', verifyDocument);

module.exports = router;
