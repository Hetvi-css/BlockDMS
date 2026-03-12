require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure upload directories exist
['uploads/temp', 'uploads/ipfs'].forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Too many requests.' });
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/approvals', require('./routes/approval.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/blockchain', require('./routes/blockchain.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date(), service: 'Blockchain DMS API' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large. Max 10MB.' });
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function seedInline() {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Department = require('./models/Department');
    const blockchainService = require('./services/blockchainService');

    await blockchainService.initializeChain();

    const salt = await bcrypt.genSalt(10);

    const depts = await Department.insertMany([
        { name: 'Research & Development', code: 'RND', description: 'Core plasma research' },
        { name: 'Engineering', code: 'ENG', description: 'Engineering and systems' },
        { name: 'Administration', code: 'ADM', description: 'Administrative division' },
    ]);

    const admin = await User.create({
        name: 'System Administrator', email: 'admin@ipr.gov.in',
        password: await bcrypt.hash('Admin@123', salt), role: 'admin',
        employeeId: 'IPR-ADM-001', isActive: true, isApproved: true,
    });

    const hod1 = await User.create({
        name: 'Dr. Ramesh Kumar', email: 'hod.rnd@ipr.gov.in',
        password: await bcrypt.hash('Hod@123', salt), role: 'hod',
        department: depts[0]._id, employeeId: 'IPR-HOD-001', isActive: true, isApproved: true,
    });
    const hod2 = await User.create({
        name: 'Dr. Priya Sharma', email: 'hod.eng@ipr.gov.in',
        password: await bcrypt.hash('Hod@123', salt), role: 'hod',
        department: depts[1]._id, employeeId: 'IPR-HOD-002', isActive: true, isApproved: true,
    });

    await Department.findByIdAndUpdate(depts[0]._id, { hod: hod1._id, createdBy: admin._id });
    await Department.findByIdAndUpdate(depts[1]._id, { hod: hod2._id, createdBy: admin._id });
    await Department.findByIdAndUpdate(depts[2]._id, { createdBy: admin._id });

    await User.create([
        { name: 'Arun Patel', email: 'employee1@ipr.gov.in', password: await bcrypt.hash('Emp@123', salt), role: 'employee', department: depts[0]._id, employeeId: 'IPR-EMP-001', isActive: true, isApproved: true },
        { name: 'Meena Nair', email: 'employee2@ipr.gov.in', password: await bcrypt.hash('Emp@123', salt), role: 'employee', department: depts[1]._id, employeeId: 'IPR-EMP-002', isActive: true, isApproved: true },
        { name: 'Vikram Singh', email: 'pending1@ipr.gov.in', password: await bcrypt.hash('Emp@123', salt), role: 'employee', department: depts[0]._id, isActive: false, isApproved: false },
    ]);

    for (const user of [admin, hod1, hod2]) {
        await blockchainService.registerUser(`${user.role}-${user._id}`, user.role).catch(() => { });
    }

    console.log('✅ Demo data seeded successfully!');
}

async function startServer() {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/blockchain-dms';
    let usingMemory = false;

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB connected:', mongoUri);
    } catch (err) {
        console.log('⚠️  Local MongoDB unavailable → starting in-memory MongoDB (demo mode)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
        usingMemory = true;
        console.log('✅ In-memory MongoDB ready');
    }

    // Auto-seed if empty
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
        console.log('🌱 Auto-seeding demo data...');
        await seedInline();
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Blockchain DMS  → http://localhost:${PORT}`);
        if (usingMemory) console.log(`⚠️  DEMO MODE (in-memory DB — data resets on restart)`);
        console.log('\n🔑 Demo Credentials:');
        console.log('   Admin:    admin@ipr.gov.in    / Admin@123');
        console.log('   HOD:      hod.rnd@ipr.gov.in  / Hod@123');
        console.log('   Employee: employee1@ipr.gov.in / Emp@123\n');
    });
}

startServer().catch(err => {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
});

module.exports = app;
