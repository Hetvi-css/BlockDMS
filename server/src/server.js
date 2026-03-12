const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes      = require('./routes/auth.routes');
const userRoutes      = require('./routes/user.routes');
const documentRoutes  = require('./routes/document.routes');
const auditRoutes     = require('./routes/audit.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const reportRoutes    = require('./routes/report.routes');
const { seedDatabase } = require('./utils/seeder');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests.' }
}));

// CORS  
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing — 50 MB for base64 file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Blockchain DMS API is running', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/documents',  documentRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/reports',    reportRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Auto MongoDB: try real → fall back to in-memory ───
const PORT = process.env.PORT || 5000;
const EXTERNAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain_dms';

async function startServer() {
  let mongoUri = EXTERNAL_URI;

  try {
    // Try real MongoDB first (1-second timeout)
    await mongoose.connect(EXTERNAL_URI, { serverSelectionTimeoutMS: 1500 });
    console.log('✅ Connected to external MongoDB');
  } catch {
    // Fall back to in-memory MongoDB (works with no install)
    console.log('⚡ External MongoDB unavailable — starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.disconnect();
    await mongoose.connect(mongoUri);
    console.log('✅ In-memory MongoDB started:', mongoUri.split('?')[0]);
  }

  // Seed demo users + sample data
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 BlockDMS API running → http://localhost:${PORT}`);
    console.log(`🔗 Health check       → http://localhost:${PORT}/health`);
    console.log('\n🔑 Demo Credentials:');
    console.log('   👑 Admin    → admin@dms.com      / Admin@123');
    console.log('   🏢 HOD      → hod@dms.com        / Hod@123');
    console.log('   👤 Employee → employee@dms.com   / Employee@123');
    console.log('\n📦 Blockchain: Hyperledger Fabric (Simulated)');
    console.log('📁 Storage:    IPFS (Simulated with real SHA-256 hashing)');
    console.log('\n✨ Frontend: http://localhost:5173\n');
  });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
