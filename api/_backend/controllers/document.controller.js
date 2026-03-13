const crypto = require('crypto');
const Document = require('../models/Document.model');
const { logAction } = require('../services/audit.service');
const { computeSHA256, registerDocumentOnChain, verifyDocumentOnChain, getBlockchainHistory } = require('../services/blockchain.service');
const { uploadToIPFS } = require('../services/ipfs.service');

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    const { title, description, category, tags, fileData, fileName, fileType, fileSize } = req.body;
    if (!title || !fileData || !fileName) {
      return res.status(400).json({ success: false, message: 'Title, file name, and file data are required.' });
    }

    // Compute SHA-256 hash of file content
    const fileBuffer = Buffer.from(fileData, 'base64');
    const hash = computeSHA256(fileBuffer);

    // Simulate IPFS upload
    const ipfsResult = await uploadToIPFS(fileBuffer, fileName);

    // Create document in MongoDB
    const document = await Document.create({
      title,
      description,
      category: category || 'other',
      fileName,
      fileType,
      fileSize,
      fileData, // stored as base64 for demo
      cid: ipfsResult.cid,
      hash,
      uploadedBy: req.user._id,
      department: req.user.department,
      status: 'pending',
      currentVersion: 1,
      versions: [{
        version: 1,
        cid: ipfsResult.cid,
        hash,
        uploadedAt: new Date(),
        uploadedBy: req.user._id,
        changeNote: 'Initial upload'
      }],
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    // Register on blockchain
    const chainResult = await registerDocumentOnChain(document._id, hash, req.user._id, 'UPLOAD');
    await Document.findByIdAndUpdate(document._id, {
      blockchainTxId: chainResult.transactionId,
      blockchainBlock: chainResult.blockNumber
    });

    // Audit log
    await logAction({
      action: 'DOCUMENT_UPLOADED',
      performedBy: req.user._id,
      targetDocument: document._id,
      newState: { title, hash, status: 'pending' },
      ipAddress: req.ip,
      details: `Document "${title}" uploaded. CID: ${ipfsResult.cid}`,
      department: req.user.department
    });
    await logAction({
      action: 'BLOCKCHAIN_RECORDED',
      performedBy: req.user._id,
      targetDocument: document._id,
      details: `Blockchain TX: ${chainResult.transactionId}, Block: ${chainResult.blockNumber}`
    });

    const populatedDoc = await Document.findById(document._id).populate('uploadedBy', 'name email department');
    res.status(201).json({
      success: true,
      message: 'Document uploaded and recorded on blockchain.',
      document: populatedDoc,
      blockchain: chainResult,
      ipfs: { cid: ipfsResult.cid, gateway: ipfsResult.gateway }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const { status, category, department, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'employee') {
      filter.uploadedBy = req.user._id;
    } else if (req.user.role === 'hod') {
      filter.department = req.user.department;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department && req.user.role === 'admin') filter.department = department;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: documents.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      documents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/:id
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email department role')
      .populate('reviewedBy', 'name email role')
      .populate('comments.user', 'name email role');

    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });

    // Role check
    if (req.user.role === 'employee' && document.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'hod' && document.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await logAction({
      action: 'DOCUMENT_VIEWED',
      performedBy: req.user._id,
      targetDocument: document._id,
      details: `Document "${document.title}" viewed`
    });

    res.json({ success: true, document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/documents/:id/approve - HOD/Admin
const approveDocument = async (req, res) => {
  try {
    const { comment } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!['pending', 'under_review', 'escalated'].includes(document.status)) {
      return res.status(400).json({ success: false, message: `Cannot approve a document with status: ${document.status}` });
    }
    const previousStatus = document.status;
    document.status = 'approved';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    document.approvedAt = new Date();
    if (comment) {
      document.comments.push({ user: req.user._id, text: comment, timestamp: new Date() });
    }
    await document.save();

    // Record on blockchain
    const chainResult = await registerDocumentOnChain(document._id, document.hash, req.user._id, 'APPROVE');

    await logAction({
      action: 'DOCUMENT_APPROVED',
      performedBy: req.user._id,
      targetDocument: document._id,
      previousState: { status: previousStatus },
      newState: { status: 'approved' },
      details: `Document "${document.title}" approved by ${req.user.name}`,
      department: document.department
    });

    res.json({ success: true, message: 'Document approved.', document, blockchain: chainResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/documents/:id/reject - HOD/Admin
const rejectDocument = async (req, res) => {
  try {
    const { reason, comment } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });

    const previousStatus = document.status;
    document.status = 'rejected';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    document.rejectionReason = reason;
    if (comment) {
      document.comments.push({ user: req.user._id, text: comment, timestamp: new Date() });
    }
    await document.save();

    await registerDocumentOnChain(document._id, document.hash, req.user._id, 'REJECT');

    await logAction({
      action: 'DOCUMENT_REJECTED',
      performedBy: req.user._id,
      targetDocument: document._id,
      previousState: { status: previousStatus },
      newState: { status: 'rejected', reason },
      details: `Document "${document.title}" rejected. Reason: ${reason}`,
      department: document.department
    });

    res.json({ success: true, message: 'Document rejected.', document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/documents/:id/escalate - HOD
const escalateDocument = async (req, res) => {
  try {
    const { comment } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });
    const previousStatus = document.status;
    document.status = 'escalated';
    document.escalatedAt = new Date();
    document.reviewedBy = req.user._id;
    if (comment) {
      document.comments.push({ user: req.user._id, text: `[ESCALATED] ${comment}`, timestamp: new Date() });
    }
    await document.save();

    await registerDocumentOnChain(document._id, document.hash, req.user._id, 'ESCALATE');

    await logAction({
      action: 'DOCUMENT_ESCALATED',
      performedBy: req.user._id,
      targetDocument: document._id,
      previousState: { status: previousStatus },
      newState: { status: 'escalated' },
      details: `Document "${document.title}" escalated to Admin by ${req.user.name}`
    });

    res.json({ success: true, message: 'Document escalated to Admin.', document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/documents/:id/verify
const verifyDocument = async (req, res) => {
  try {
    const { fileData } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found.' });

    // Compute current hash from provided file or stored hash
    let currentHash;
    if (fileData) {
      const fileBuffer = Buffer.from(fileData, 'base64');
      currentHash = computeSHA256(fileBuffer);
    } else {
      currentHash = document.hash;
    }

    const verifyResult = await verifyDocumentOnChain(currentHash, document._id);
    const tamperingDetected = !verifyResult.verified;

    if (tamperingDetected) {
      document.tamperingDetected = true;
      await document.save();
    }
    document.isVerified = verifyResult.verified;
    await Document.findByIdAndUpdate(document._id, { isVerified: verifyResult.verified, tamperingDetected });

    await logAction({
      action: tamperingDetected ? 'DOCUMENT_TAMPERED' : 'DOCUMENT_VERIFIED',
      performedBy: req.user._id,
      targetDocument: document._id,
      details: tamperingDetected
        ? `⚠️ Tampering detected for "${document.title}"`
        : `✅ Document "${document.title}" verified successfully`
    });

    const blockchainHistory = await getBlockchainHistory(document._id);

    res.json({
      success: true,
      verified: verifyResult.verified,
      tamperingDetected,
      document: {
        title: document.title,
        fileName: document.fileName,
        storedHash: document.hash,
        currentHash,
        blockchainTxId: document.blockchainTxId
      },
      blockchain: verifyResult,
      history: blockchainHistory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/stats
const getDocumentStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter.uploadedBy = req.user._id;
    if (req.user.role === 'hod') filter.department = req.user.department;

    const total = await Document.countDocuments(filter);
    const byStatus = await Document.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byCategory = await Document.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const recent = await Document.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, stats: { total, byStatus, byCategory, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadDocument, getDocuments, getDocumentById, approveDocument, rejectDocument, escalateDocument, verifyDocument, getDocumentStats };
