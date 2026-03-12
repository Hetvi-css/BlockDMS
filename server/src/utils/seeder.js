const crypto = require('crypto');
const User = require('../models/User.model');
const Document = require('../models/Document.model');
const BlockchainRecord = require('../models/BlockchainRecord.model');
const AuditLog = require('../models/AuditLog.model');

let blockNumber = 1000;

function makeHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data) + Date.now() + Math.random()).digest('hex');
}

function makeTxId() {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
}

async function createBlockchainRecord(docId, documentHash, action, userId) {
  blockNumber++;
  const txId = makeTxId();
  const blockHash = makeHash({ blockNumber, txId, documentHash });
  return await BlockchainRecord.create({
    documentId: docId,
    transactionId: txId,
    blockNumber,
    blockHash,
    documentHash,
    action,
    initiatedBy: userId,
    timestamp: new Date(),
    smartContract: 'DocumentRegistry',
    channelName: 'mychannel',
    chaincodeName: 'document-chaincode',
    payload: { documentId: docId, action }
  });
}

const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@dms.com' });
    if (adminExists) {
      console.log('✅ Database already seeded — skipping.');
      return;
    }

    console.log('🌱 Seeding database with demo users and sample data...');

    // ── Users ──
    const users = await User.create([
      { name: 'System Administrator', email: 'admin@dms.com', password: 'Admin@123', role: 'admin', department: 'Administration', employeeId: 'EMP001', phone: '+91-9999000001' },
      { name: 'Dr. Rajesh Kumar', email: 'hod@dms.com', password: 'Hod@123', role: 'hod', department: 'Computer Science', employeeId: 'EMP002', phone: '+91-9999000002' },
      { name: 'Priya Sharma', email: 'employee@dms.com', password: 'Employee@123', role: 'employee', department: 'Computer Science', employeeId: 'EMP003', phone: '+91-9999000003' },
      { name: 'Amit Patel', email: 'amit@dms.com', password: 'Amit@123', role: 'employee', department: 'Computer Science', employeeId: 'EMP004', phone: '+91-9999000004' },
      { name: 'Dr. Meena Reddy', email: 'hod.ee@dms.com', password: 'HodEE@123', role: 'hod', department: 'Electrical Engineering', employeeId: 'EMP005', phone: '+91-9999000005' }
    ]);

    const [admin, hod, emp1, emp2, hod2] = users;

    // ── Sample Documents ──
    const docsData = [
      { title: 'Q3 Research Report 2024', category: 'report', status: 'approved', uploader: emp1, reviewer: hod, dept: 'Computer Science', tags: ['research', 'q3', '2024'], desc: 'Quarterly research summary report for Q3 2024 covering AI integration milestones.' },
      { title: 'Network Security Policy v2.1', category: 'policy', status: 'approved', uploader: hod, reviewer: admin, dept: 'Computer Science', tags: ['security', 'policy', 'network'], desc: 'Updated institutional network security policy document version 2.1.' },
      { title: 'Cloud Infrastructure Proposal', category: 'proposal', status: 'pending', uploader: emp2, reviewer: null, dept: 'Computer Science', tags: ['cloud', 'infrastructure', 'proposal'], desc: 'Proposal for migrating on-premise servers to cloud infrastructure.' },
      { title: 'Annual Budget Contract FY2025', category: 'contract', status: 'escalated', uploader: hod2, reviewer: hod2, dept: 'Electrical Engineering', tags: ['budget', 'contract', 'fy2025'], desc: 'Annual budget allocation contract for the department for FY2025.' },
      { title: 'Employee Performance Review Q4', category: 'report', status: 'rejected', uploader: emp1, reviewer: hod, dept: 'Computer Science', tags: ['hr', 'performance', 'q4'], desc: 'Employee performance evaluation report for Q4 2024.', rejReason: 'Incomplete data for 3 employees. Please resubmit after updating.' },
      { title: 'Lab Equipment Invoice #INV-2024-089', category: 'invoice', status: 'approved', uploader: emp2, reviewer: hod, dept: 'Computer Science', tags: ['invoice', 'equipment', 'lab'], desc: 'Invoice for new lab equipment purchased for the CS department.' },
      { title: 'Machine Learning Research Paper', category: 'research', status: 'under_review', uploader: emp1, reviewer: hod, dept: 'Computer Science', tags: ['ml', 'research', 'ai'], desc: 'Research paper on federated learning for distributed privacy-preserving ML models.' },
      { title: 'EE Department Syllabus Update', category: 'policy', status: 'pending', uploader: hod2, reviewer: null, dept: 'Electrical Engineering', tags: ['syllabus', 'ee', '2025'], desc: 'Updated syllabus for EE department effective from 2025 academic year.' }
    ];

    for (const d of docsData) {
      const fileContent = `${d.title} - ${d.desc} - Created by ${d.uploader.name}`;
      const docHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      const cid = 'Qm' + docHash.substring(0, 44);
      const txRecord = await createBlockchainRecord(null, docHash, 'UPLOAD', d.uploader._id);

      const docPayload = {
        title: d.title,
        description: d.desc,
        category: d.category,
        fileName: d.title.toLowerCase().replace(/\s+/g, '_') + '.pdf',
        fileType: 'application/pdf',
        fileSize: Math.floor(Math.random() * 500000) + 100000,
        cid,
        hash: docHash,
        blockchainTxId: txRecord.transactionId,
        blockchainBlock: txRecord.blockNumber,
        uploadedBy: d.uploader._id,
        department: d.dept,
        status: d.status,
        tags: d.tags,
        currentVersion: 1,
        versions: [{ version: 1, cid, hash: docHash, uploadedAt: new Date(), uploadedBy: d.uploader._id }]
      };

      if (d.reviewer) { docPayload.reviewedBy = d.reviewer._id; docPayload.reviewedAt = new Date(); }
      if (d.rejReason) { docPayload.rejectionReason = d.rejReason; }
      if (d.status === 'approved') { docPayload.approvedAt = new Date(); }
      if (d.status === 'escalated') { docPayload.escalatedAt = new Date(); }

      // Add sample comments
      if (d.reviewer) {
        docPayload.comments = [{
          user: d.reviewer._id,
          text: d.status === 'approved' ? 'Reviewed and approved. All requirements met.' :
                d.status === 'rejected' ? d.rejReason :
                d.status === 'escalated' ? 'Escalating to admin for final decision.' :
                'Document is under review. Will provide feedback shortly.',
          timestamp: new Date()
        }];
      }

      const doc = await Document.create(docPayload);

      // Update the blockchain record with the doc ID
      await BlockchainRecord.findByIdAndUpdate(txRecord._id, { documentId: doc._id });

      // Add action records for non-pending documents
      if (d.status === 'approved') {
        await createBlockchainRecord(doc._id, docHash, 'APPROVE', d.reviewer._id);
        await AuditLog.create({ action: 'DOCUMENT_APPROVED', performedBy: d.reviewer._id, targetDocument: doc._id, details: `Document "${d.title}" approved`, department: d.dept, timestamp: new Date() });
      } else if (d.status === 'rejected') {
        await createBlockchainRecord(doc._id, docHash, 'REJECT', d.reviewer._id);
        await AuditLog.create({ action: 'DOCUMENT_REJECTED', performedBy: d.reviewer._id, targetDocument: doc._id, details: `Document "${d.title}" rejected: ${d.rejReason}`, department: d.dept, timestamp: new Date() });
      } else if (d.status === 'escalated') {
        await createBlockchainRecord(doc._id, docHash, 'ESCALATE', d.reviewer._id);
        await AuditLog.create({ action: 'DOCUMENT_ESCALATED', performedBy: d.reviewer._id, targetDocument: doc._id, details: `Document "${d.title}" escalated to Admin`, department: d.dept, timestamp: new Date() });
      }

      // Upload audit log
      await AuditLog.create({ action: 'DOCUMENT_UPLOADED', performedBy: d.uploader._id, targetDocument: doc._id, details: `Document "${d.title}" uploaded and recorded on blockchain`, department: d.dept, timestamp: new Date() });
      await AuditLog.create({ action: 'BLOCKCHAIN_RECORDED', performedBy: d.uploader._id, targetDocument: doc._id, details: `Blockchain TX: ${txRecord.transactionId.substring(0, 16)}...`, department: d.dept, timestamp: new Date() });
    }

    // Login audit logs
    await AuditLog.create([
      { action: 'USER_LOGIN', performedBy: admin._id, details: 'Admin logged in', timestamp: new Date() },
      { action: 'USER_LOGIN', performedBy: hod._id, details: 'HOD logged in', timestamp: new Date() },
      { action: 'USER_LOGIN', performedBy: emp1._id, details: 'Employee logged in', timestamp: new Date() }
    ]);

    console.log('✅ Demo users created:');
    console.log('   👑 admin@dms.com / Admin@123');
    console.log('   🏢 hod@dms.com / Hod@123');
    console.log('   👤 employee@dms.com / Employee@123');
    console.log(`✅ ${docsData.length} sample documents created`);
    console.log(`✅ ${blockNumber - 1000} blockchain transactions recorded`);
    console.log('✅ Audit logs created');

  } catch (err) {
    console.error('⚠️  Seeder error (continuing):', err.message);
  }
};

module.exports = { seedDatabase };
