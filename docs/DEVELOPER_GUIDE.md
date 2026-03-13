# 🛠️ BlockDMS — DEVELOPER GUIDE
### Blockchain-Based Secure Document Management & Approval System
**Version 1.0 | March 2026**

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technology Stack (Explained)](#technology-stack-explained)
3. [Complete Project Directory Structure](#complete-project-directory-structure)
4. [Prerequisites & Installation](#prerequisites--installation)
5. [Running the Application](#running-the-application)
6. [Backend Architecture — Full Details](#backend-architecture)
7. [Frontend Architecture — Full Details](#frontend-architecture)
8. [Database Schema (MongoDB)](#database-schema-mongodb)
9. [API Reference (All Endpoints)](#api-reference)
10. [Blockchain Service — How It Works](#blockchain-service)
11. [IPFS Service — How It Works](#ipfs-service)
12. [Authentication & Security](#authentication--security)
13. [Audit Log System](#audit-log-system)
14. [Role-Based Access Control (RBAC)](#role-based-access-control)
15. [Environment Configuration](#environment-configuration)
16. [Extending the System](#extending-the-system)
17. [Deployment Guide](#deployment-guide)
18. [Common Errors & Solutions](#common-errors--solutions)

---

## 1. PROJECT OVERVIEW

BlockDMS is a **Node.js + React** full-stack application that implements a document management lifecycle with:

- **JWT-based authentication** with role-based access control
- **SHA-256 hashing** of every uploaded file
- **Simulated IPFS storage** (produces realistic CID hash strings from file content)
- **Simulated Hyperledger Fabric** blockchain (MongoDB-backed immutable ledger with block hashes and transaction IDs)
- **Complete audit trail** of every system action
- **React SPA frontend** with Enterprise Navy theme

> **Note on "Simulated" Blockchain and IPFS:**
> The system uses SHA-256 algorithms and MongoDB to simulate Hyperledger Fabric and IPFS, producing realistic output (block numbers, TX IDs, block hashes, CIDs). To connect real Hyperledger Fabric, update `blockchain.service.js`. To connect real IPFS/Pinata, update `ipfs.service.js`. All other code remains the same.

---

## 2. TECHNOLOGY STACK EXPLAINED

### Backend
| Technology | Version | Purpose | Why Used |
|-----------|---------|---------|---------|
| **Node.js** | LTS 20+ | Runtime environment | Fast, non-blocking I/O, huge ecosystem |
| **Express.js** | ^4.x | Web framework | Minimal, flexible, MVC-compatible |
| **MongoDB** | ^7.x | Primary database | Flexible schema for document metadata |
| **Mongoose** | ^8.x | MongoDB ODM | Schema validation, middleware hooks |
| **bcryptjs** | ^2.4 | Password hashing | Secure one-way password hash (cost factor 12) |
| **jsonwebtoken** | ^9.x | JWT authentication | Stateless auth with role claims |
| **cors** | ^2.8 | Cross-Origin Resource Sharing | Allow React frontend to call API |
| **helmet** | ^7.x | HTTP security headers | XSS protection, CSP, HSTS headers |
| **express-rate-limit** | ^7.x | Rate limiting | Prevent brute force (500 req / 15 min) |
| **morgan** | ^1.10 | HTTP request logging | Dev environment request logging |
| **crypto** *(built-in)* | Node built-in | SHA-256 hashing, TX ID generation | Part of Node.js standard library |
| **uuid** | ^10.x | Unique ID generation | Used for internal IDs |
| **multer** | ^1.4 | File upload middleware | Included for future real IPFS integration |
| **nodemon** | ^3.x | Dev auto-restart | Restart server on file change |

### Frontend
| Technology | Version | Purpose | Why Used |
|-----------|---------|---------|---------|
| **React** | ^18.3 | UI library | Component-based, reactive updates |
| **Vite** | ^5.4 | Build tool | Lightning-fast dev server, HMR |
| **React Router DOM** | ^6.26 | Client-side routing | SPA navigation |
| **Axios** | ^1.7 | HTTP client | Interceptors for JWT, clean API calls |
| **Lucide React** | ^0.454 | Icon library | Clean SVG icons |
| **Recharts** | ^2.12 | Charts | Pie and bar charts for reports |
| **React Hot Toast** | ^2.4 | Toast notifications | Non-blocking success/error messages |
| **date-fns** | ^3.6 | Date formatting | Lightweight date utility |
| **Vanilla CSS** | — | Styling | Full control, no framework overhead |

---

## 3. COMPLETE PROJECT DIRECTORY STRUCTURE

```
blockchain-dms/
├── server/                         ← Backend (Node.js + Express)
│   ├── src/
│   │   ├── server.js               ← Entry point: app setup, MongoDB connect
│   │   ├── models/
│   │   │   ├── User.model.js       ← User schema (name, email, role, dept.)
│   │   │   ├── Document.model.js   ← Document schema (title, hash, CID, status)
│   │   │   ├── AuditLog.model.js   ← Audit trail schema (action, user, state)
│   │   │   └── BlockchainRecord.model.js ← Blockchain ledger schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  ← login(), logout(), getMe()
│   │   │   ├── user.controller.js  ← CRUD + stats for users
│   │   │   ├── document.controller.js ← upload, get, approve, reject, escalate, verify
│   │   │   ├── audit.controller.js ← getAuditLogs()
│   │   │   ├── blockchain.controller.js ← getAllRecords(), stats()
│   │   │   └── report.controller.js ← getOverviewReport()
│   │   ├── routes/
│   │   │   ├── auth.routes.js      ← POST /login, /logout | GET /me
│   │   │   ├── user.routes.js      ← GET/POST/PUT/DELETE /users
│   │   │   ├── document.routes.js  ← GET/POST documents, PATCH approve/reject/escalate
│   │   │   ├── audit.routes.js     ← GET /audit
│   │   │   ├── blockchain.routes.js ← GET /blockchain/records, /stats
│   │   │   └── report.routes.js    ← GET /reports/overview
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  ← protect() + authorize(...roles)
│   │   ├── services/
│   │   │   ├── blockchain.service.js ← SHA-256, TX generation, verify
│   │   │   ├── ipfs.service.js     ← CID simulation, uploadToIPFS()
│   │   │   └── audit.service.js    ← logAction() helper
│   │   └── utils/
│   │       └── seeder.js           ← Creates 5 demo users on first run
│   ├── .env                        ← Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   └── package.json
│
├── client/                         ← Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx                ← ReactDOM.createRoot() entry
│   │   ├── App.jsx                 ← Router + ProtectedRoute definitions
│   │   ├── index.css               ← Complete CSS design system (Enterprise Navy)
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← useAuth() hook, login/logout state
│   │   ├── services/
│   │   │   └── api.js              ← Axios instance + all API call functions
│   │   ├── components/
│   │   │   └── Layout.jsx          ← Sidebar + Topbar + <Outlet> wrapper
│   │   └── pages/
│   │       ├── Login.jsx           ← Login form with demo credentials
│   │       ├── Dashboard.jsx       ← Stats, quick actions, blockchain status
│   │       ├── MyDocuments.jsx     ← Document list with search + filter
│   │       ├── UploadDocument.jsx  ← File upload with base64 + blockchain confirm
│   │       ├── DocumentDetail.jsx  ← Full doc view, approve/reject/escalate modals
│   │       ├── PendingApprovals.jsx ← HOD/Admin review queue
│   │       ├── AuditLogs.jsx       ← Paginated audit trail table
│   │       ├── BlockchainExplorer.jsx ← Transaction ledger view
│   │       ├── VerifyDocument.jsx  ← Hash comparison verification
│   │       ├── UserManagement.jsx  ← Admin CRUD for users
│   │       └── Reports.jsx         ← Charts + analytics
│   ├── index.html
│   ├── vite.config.js              ← Proxy /api → localhost:5000
│   └── package.json
│
└── docs/
    ├── USER_GUIDE.md
    └── DEVELOPER_GUIDE.md          ← This file
```

---

## 4. PREREQUISITES & INSTALLATION

### What You Need Installed
Before running this project, install:

1. **Node.js** (v18 or higher) — https://nodejs.org/
   - Verify: `node -v` → should show v18.x.x or higher
2. **MongoDB Community Server** (v6 or 7) — https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`
   - MongoDB must be running on `localhost:27017`
3. **npm** (comes with Node.js)
   - Verify: `npm -v`

### Installing the Backend
```powershell
cd blockchain-dms/server
npm install
```

### Installing the Frontend
```powershell
cd blockchain-dms/client
npm install
```

---

## 5. RUNNING THE APPLICATION

### Step 1 — Start MongoDB
MongoDB must be running. On Windows:
```powershell
# Option 1 — Run as a service (if installed as service)
net start MongoDB

# Option 2 — Run directly
mongod --dbpath C:\data\db
```

### Step 2 — Start the Backend Server
```powershell
cd blockchain-dms/server
npm run dev

```
Expected output:
```
✅ MongoDB connected successfully
🌱 Seeding database with demo users...
✅ Database seeded with demo users:
   Admin    → admin@dms.com / Admin@123
   HOD (CS) → hod@dms.com / Hod@123
   Employee → employee@dms.com / Employee@123
🚀 Server running on http://localhost:5000
📋 API Health: http://localhost:5000/health
```

### Step 3 — Start the Frontend
Open a new terminal:
```powershell
cd blockchain-dms/client
npm run dev
```
Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 4 — Access the Application
Open your browser and go to: **http://localhost:5173**

---

## 6. BACKEND ARCHITECTURE

### File: `server.js` (Entry Point)

This is the main Express application file. It:
1. Creates the Express `app` instance
2. Attaches all middleware in order:
   - `helmet()` — Security headers
   - `rateLimit()` — 500 requests per 15 minutes per IP
   - `cors()` — Allows requests from `http://localhost:5173`
   - `express.json()` — Parse JSON bodies up to 50MB
   - `morgan('dev')` — Log all HTTP requests
3. Registers all route groups under `/api/*`
4. Registers a global 404 handler
5. Registers a global error handler
6. Connects to MongoDB and starts the HTTP server

### Middleware Order (Important)
```
Request → helmet → rateLimit → cors → body-parser → morgan → routes → error handler → Response
```

### Route Architecture (MVC Pattern)

All routes follow the **Model → Controller → Route → Middleware** pattern:

```
HTTP Request
    ↓
Route File (routes/*.routes.js)      ← Defines URL + HTTP method
    ↓
Auth Middleware (protect/authorize)  ← Verifies JWT, checks role
    ↓
Controller Function                  ← Business logic
    ↓
Model / Service                      ← Database / blockchain / IPFS
    ↓
HTTP Response
```

### Key Functions in Each Controller

**`auth.controller.js`**
- `login(req, res)` — Validates email/password, issues JWT, logs login
- `logout(req, res)` — Logs logout in audit trail
- `getMe(req, res)` — Returns current user from `req.user`

**`user.controller.js`**
- `getUsers()` — Lists all users with optional filters (role, dept, active status, search)
- `createUser()` — Creates user with hashed password, logs action
- `updateUser()` — Updates user details, logs previous vs new state
- `deleteUser()` — Marks user as `isActive: false` (soft delete)
- `getUserStats()` — Aggregates counts by role and department

**`document.controller.js`** (most complex)
- `uploadDocument()` — Converts base64 → Buffer → SHA-256 hash → simulated IPFS → MongoDB → blockchain
- `getDocuments()` — Filtered list based on role (employee sees own, HOD sees dept, admin sees all)
- `getDocumentById()` — Returns single document with role permission check
- `approveDocument()` — Changes status → approved, creates blockchain record, logs action
- `rejectDocument()` — Requires reason, changes status → rejected, creates blockchain record
- `escalateDocument()` — Changes status → escalated, creates blockchain record
- `verifyDocument()` — Computes current hash → compares with blockchain → returns result
- `getDocumentStats()` — Aggregates counts by status and category

---

## 7. FRONTEND ARCHITECTURE

### State Management
The app uses **React Context API** (not Redux, kept simpler):
- `AuthContext` — Stores the logged-in user object, provides `login()` and `logout()`
- No global state library needed; all page-level state is managed with `useState` + `useEffect`

### Routing (React Router v6)
The routing is defined in `App.jsx`:
```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />             // Public
  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="documents" element={<MyDocuments />} />
    <Route path="approvals" element={<ProtectedRoute roles={['hod','admin']}>...</>} />
    // ... more routes
  </Route>
</Routes>
```

`ProtectedRoute` component:
- If user is not logged in → redirect to `/login`
- If user doesn't have required role → redirect to `/dashboard`

### API Communication (`api.js`)
All API calls go through a single Axios instance:
```javascript
const API = axios.create({ baseURL: '/api' });
// Request interceptor: adds Authorization: Bearer <token> to every request
// Response interceptor: if 401 → clears storage and redirects to /login
```

Vite proxies `/api/*` → `http://localhost:5000/api/*` in development.

### CSS Design System (`index.css`)
The entire styling system is built in a single CSS file using CSS custom properties (variables). Key sections:

| CSS Section | Variables / Classes |
|------------|---------------------|
| Color tokens | `--navy-900`, `--royal`, `--success`, `--error` |
| Layout | `.layout`, `.sidebar`, `.main-content` |
| Navigation | `.nav-item`, `.nav-item.active`, `.nav-badge` |
| Cards | `.card`, `.card-header`, `.stat-card` |
| Buttons | `.btn`, `.btn-primary`, `.btn-success`, `.btn-danger` |
| Status badges | `.badge-pending`, `.badge-approved`, `.badge-rejected` |
| Forms | `.form-group`, `.form-label`, `.form-control` |
| Tables | `table`, `thead`, `th`, `td` |
| Modals | `.modal-overlay`, `.modal`, `.modal-header` |
| Blockchain | `.hash-block`, `.hash-valid`, `.hash-invalid` |
| Timeline | `.timeline`, `.timeline-item`, `.timeline-dot` |

---

## 8. DATABASE SCHEMA (MONGODB)

### Collection: `users`
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (bcrypt hashed, min 6 chars),
  role: Enum['employee', 'hod', 'admin'] (default: 'employee'),
  department: String,
  employeeId: String (unique),
  phone: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdBy: ObjectId → users,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Mongoose hooks:**
- `pre('save')` — Hashes password using bcrypt (cost factor 12) before saving
- `methods.comparePassword()` — Compares plain text with stored hash
- `methods.toJSON()` — Removes password from JSON output

### Collection: `documents`
```javascript
{
  title: String (required),
  description: String,
  category: Enum['report','contract','policy','invoice','research','proposal','other'],
  fileName: String (required),
  fileType: String,
  fileSize: Number,
  fileData: String,              // base64 file content (demo mode)
  cid: String,                   // IPFS CID (simulated)
  hash: String (required),       // SHA-256 hash of file content
  blockchainTxId: String,        // Blockchain transaction ID
  blockchainBlock: Number,       // Block number
  uploadedBy: ObjectId → users (required),
  department: String,
  status: Enum['pending','under_review','approved','rejected','escalated'],
  currentVersion: Number,
  versions: [{
    version: Number,
    cid: String,
    hash: String,
    uploadedAt: Date,
    uploadedBy: ObjectId → users,
    changeNote: String
  }],
  reviewedBy: ObjectId → users,
  reviewedAt: Date,
  comments: [{
    user: ObjectId → users,
    text: String,
    timestamp: Date
  }],
  rejectionReason: String,
  escalatedAt: Date,
  approvedAt: Date,
  tags: [String],
  isVerified: Boolean,
  tamperingDetected: Boolean
}
```

### Collection: `auditlogs`
```javascript
{
  action: Enum[...20 action types],
  performedBy: ObjectId → users (required),
  targetDocument: ObjectId → documents,
  targetUser: ObjectId → users,
  previousState: Mixed,          // JSON snapshot before change
  newState: Mixed,               // JSON snapshot after change
  ipAddress: String,
  userAgent: String,
  details: String,
  department: String,
  timestamp: Date (default: now)
}
```
**Indexes:** `timestamp: -1`, `performedBy: 1`, `targetDocument: 1`

### Collection: `blockchainrecords`
```javascript
{
  documentId: ObjectId → documents (required),
  transactionId: String (unique, required),  // 64-char hex uppercase
  blockNumber: Number (required),
  blockHash: String (required),              // SHA-256 of block data
  documentHash: String (required),           // SHA-256 of document file
  action: Enum['UPLOAD','APPROVE','REJECT','ESCALATE','VERIFY'],
  initiatedBy: ObjectId → users (required),
  timestamp: Date,
  smartContract: String,                     // 'DocumentRegistry'
  channelName: String,                       // 'mychannel'
  chaincodeName: String,                     // 'document-chaincode'
  payload: Mixed
}
```

---

## 9. API REFERENCE

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

### Authentication
| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/login` | ❌ | `{email, password}` | Login, returns JWT |
| POST | `/auth/logout` | ✅ | — | Log out, audit entry |
| GET | `/auth/me` | ✅ | — | Get current user object |

### Documents
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/documents/upload` | ✅ | All | Upload document |
| GET | `/documents` | ✅ | All | List documents (filtered by role) |
| GET | `/documents/stats` | ✅ | All | Document statistics |
| GET | `/documents/:id` | ✅ | All | Get single document |
| PATCH | `/documents/:id/approve` | ✅ | hod, admin | Approve document |
| PATCH | `/documents/:id/reject` | ✅ | hod, admin | Reject with reason |
| PATCH | `/documents/:id/escalate` | ✅ | hod | Escalate to admin |
| POST | `/documents/:id/verify` | ✅ | All | Verify blockchain hash |

**Upload Document Request Body:**
```json
{
  "title": "Q3 Report 2024",
  "description": "...",
  "category": "report",
  "tags": "finance, q3",
  "fileData": "<base64 string>",
  "fileName": "q3_report.pdf",
  "fileType": "application/pdf",
  "fileSize": 245678
}
```

**Upload Document Response:**
```json
{
  "success": true,
  "document": { "hash": "...", "cid": "...", "blockchainTxId": "..." },
  "blockchain": { "transactionId": "...", "blockNumber": 1001 },
  "ipfs": { "cid": "Qm...", "gateway": "https://ipfs.io/ipfs/Qm..." }
}
```

### Users (Admin Only)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users` | admin | List all users |
| GET | `/users/stats` | admin | User statistics |
| GET | `/users/:id` | admin | Get user by ID |
| POST | `/users` | admin | Create user |
| PUT | `/users/:id` | admin | Update user |
| DELETE | `/users/:id` | admin | Deactivate user |

### Audit Logs
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/audit` | All | Get logs (employees see own only) |

Query params: `action`, `page`, `limit`, `startDate`, `endDate`

### Blockchain
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/blockchain/stats` | All | Transaction count, latest block |
| GET | `/blockchain/records` | hod, admin | All chain records |
| GET | `/blockchain/document/:docId` | All | Chain history for a document |

### Reports
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/reports/overview` | hod, admin | Full system overview |

---

## 10. BLOCKCHAIN SERVICE

**File:** `server/src/services/blockchain.service.js`

### How the Simulation Works

1. **`computeSHA256(buffer)`** — Uses Node.js built-in `crypto.createHash('sha256')` to produce a 64-character hex hash from any data.

2. **`registerDocumentOnChain(documentId, documentHash, userId, action)`**
   - Increments an in-memory `currentBlockNumber` counter
   - Generates a 64-char uppercase hex **Transaction ID** using `crypto.randomBytes(32)`
   - Computes a **Block Hash** using SHA-256 of `blockNumber + txId + documentHash + timestamp`
   - Saves a `BlockchainRecord` document to MongoDB
   - Returns `{ transactionId, blockNumber, blockHash, timestamp }`

3. **`verifyDocumentOnChain(currentHash, documentId)`**
   - Queries `BlockchainRecord` for the oldest record (first upload) for this document
   - Compares `originalRecord.documentHash` with `currentHash`
   - Returns `{ verified: true/false, originalHash, currentHash, ...blockInfo }`

4. **`getBlockchainHistory(documentId)`** — Returns all records for a document, sorted oldest first (full audit chain)

5. **`getAllChainRecords(limit)`** — Returns all records newest first, for the explorer

### To Connect Real Hyperledger Fabric
Replace the above functions with `fabric-network` SDK calls:
```javascript
const { Gateway, Wallets } = require('fabric-network');
// Load connection profile (network.yaml)
// Submit transactions via gateway.getNetwork().getContract()
```

---

## 11. IPFS SERVICE

**File:** `server/src/services/ipfs.service.js`

### How the Simulation Works

1. **`simulateCIDGeneration(fileBuffer)`**
   - Computes SHA-256 of the file content
   - Returns `"Qm" + hash.substring(0, 44)` — mimics a real IPFS CIDv0 format

2. **`uploadToIPFS(fileBuffer, fileName)`**
   - Simulates a short delay (100ms)
   - Returns `{ cid, size, gateway, localGateway }` — same structure as real IPFS upload

### To Connect Real IPFS (Pinata)
```javascript
const { PinataSDK } = require('pinata');
const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });
const upload = await pinata.upload.stream(fileStream);
return { cid: upload.IpfsHash, gateway: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}` };
```

Or use the official `kubo-rpc-client` for a local IPFS node:
```javascript
const { create } = require('kubo-rpc-client');
const ipfs = create({ url: 'http://localhost:5001' });
const result = await ipfs.add(Buffer.from(fileData, 'base64'));
return { cid: result.cid.toString() };
```

---

## 12. AUTHENTICATION & SECURITY

### JWT Flow
```
1. Client sends POST /api/auth/login with {email, password}
2. Server validates credentials using bcrypt.compare()
3. Server signs JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' })
4. Client receives token and stores it in localStorage
5. On every subsequent request: Authorization: Bearer <token>
6. auth.middleware.js verifies: jwt.verify(token, JWT_SECRET)
7. Decoded { id } is used to fetch user from MongoDB → stored in req.user
```

### `protect` Middleware
```javascript
// Extracts token from "Authorization: Bearer ..." header
// Verifies using jwt.verify()
// Loads user from MongoDB
// Rejects if user is inactive
// Sets req.user = user
```

### `authorize(...roles)` Middleware
```javascript
// Returns a middleware that checks: roles.includes(req.user.role)
// Example: authorize('admin', 'hod') — allows only admin or hod
```

### Security Headers (Helmet)
- `X-XSS-Protection` — Basic XSS protection
- `X-Frame-Options: DENY` — Clickjacking prevention
- `X-Content-Type-Options: nosniff` — MIME sniffing prevention
- `Content-Security-Policy` — Restricts resource loading
- `Strict-Transport-Security` — HTTPS enforcement

### Password Hashing
```javascript
// In User.model.js pre-save hook:
this.password = await bcrypt.hash(this.password, 12); // cost factor 12
// Comparison:
await bcrypt.compare(candidatePassword, this.password); // timing-safe
```

### Rate Limiting
- Window: 15 minutes
- Max requests: 500 per IP
- Response on exceed: `429 Too Many Requests`

---

## 13. AUDIT LOG SYSTEM

**File:** `server/src/services/audit.service.js`

The `logAction()` helper is called from every controller after each significant action:

```javascript
await logAction({
  action: 'DOCUMENT_APPROVED',        // One of 20 defined action types
  performedBy: req.user._id,          // Who did it
  targetDocument: document._id,       // Which document (optional)
  targetUser: userId,                 // Which user was affected (optional)
  previousState: { status: 'pending' }, // Before snapshot
  newState: { status: 'approved' },     // After snapshot
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  details: 'Document "Report" approved by Dr. Kumar'
});
```

All 20 action types:
```
USER_LOGIN, USER_LOGOUT, USER_CREATED, USER_UPDATED, USER_DELETED,
DOCUMENT_UPLOADED, DOCUMENT_VIEWED, DOCUMENT_DOWNLOADED,
DOCUMENT_APPROVED, DOCUMENT_REJECTED, DOCUMENT_ESCALATED,
DOCUMENT_VERIFIED, DOCUMENT_TAMPERED,
BLOCKCHAIN_RECORDED, IPFS_STORED,
SYSTEM_CONFIG
```

---

## 14. ROLE-BASED ACCESS CONTROL

| Feature | Employee | HOD | Admin |
|---------|----------|-----|-------|
| Upload document | ✅ | ✅ | ✅ |
| View own documents | ✅ | ✅ | ✅ |
| View all dept documents | ❌ | ✅ | ✅ |
| View all documents | ❌ | ❌ | ✅ |
| Approve/Reject | ❌ | ✅ | ✅ |
| Escalate to Admin | ❌ | ✅ | ❌ |
| Override decisions | ❌ | ❌ | ✅ |
| View audit logs (own) | ✅ | ✅ | ✅ |
| View all audit logs | ❌ | ❌ | ✅ |
| Blockchain explorer | ❌ | ✅ | ✅ |
| Reports | ❌ | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ |
| Verify documents | ✅ | ✅ | ✅ |

---

## 15. ENVIRONMENT CONFIGURATION

**File:** `server/.env`

```env
PORT=5000                                         # API server port
MONGODB_URI=mongodb://localhost:27017/blockchain_dms  # Database connection
JWT_SECRET=your_super_secret_key_minimum_32_chars # JWT signing secret
JWT_EXPIRES_IN=24h                                # Token validity
NODE_ENV=development                              # Environment flag
FRONTEND_URL=http://localhost:5173               # CORS allowed origin
```

**For Production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blockchain_dms
JWT_SECRET=<256-bit random key>
FRONTEND_URL=https://yourdomain.com
PORT=5000
```
Generate a secure JWT secret:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 16. EXTENDING THE SYSTEM

### Adding a New Role
1. Add the role to `User.model.js`:
   ```javascript
   role: { type: String, enum: ['employee', 'hod', 'admin', 'director'], ... }
   ```
2. Add it to navigation items in `Layout.jsx`:
   ```javascript
   { label: 'Director Panel', path: '/director', roles: ['director', 'admin'] }
   ```
3. Create the page component in `src/pages/`
4. Add the route in `App.jsx`
5. Update `authorize()` calls in routes as needed

### Adding a New Document Action (e.g., "Request Revision")
1. Add `DOCUMENT_REVISION_REQUESTED` to `AuditLog.model.js` enum
2. Create `requestRevision(req, res)` in `document.controller.js`
3. Add route: `router.patch('/:id/revision', authorize('hod'), requestRevision)`
4. Add API function in `api.js`
5. Add button in `DocumentDetail.jsx`

### Connecting Real Hyperledger Fabric
1. Install: `npm install fabric-network fabric-common`
2. Replace `blockchain.service.js` functions with `fabric-network` Gateway calls
3. Mount the connection profile and wallet to the container

### Adding Email Notifications
1. Install: `npm install nodemailer`
2. Create `server/src/services/notification.service.js`
3. Call `sendEmail()` after approval/rejection in the document controller

---

## 17. DEPLOYMENT GUIDE

### Docker Compose (Recommended)
Create `docker-compose.yml` at project root:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
  
  backend:
    build: ./server
    ports: ["5000:5000"]
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/blockchain_dms
      - JWT_SECRET=your_secure_secret
    depends_on: [mongodb]
  
  frontend:
    build: ./client
    ports: ["80:80"]
    depends_on: [backend]

volumes:
  mongo_data:
```

### Server `Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Client `Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### NGINX Reverse Proxy (for production)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;  # SPA routing
    }
}
```

---

## 18. COMMON ERRORS & SOLUTIONS

| Error | Cause | Solution |
|-------|-------|---------|
| `ECONNREFUSED 27017` | MongoDB not running | Start MongoDB: `net start MongoDB` or `mongod` |
| `JsonWebTokenError: invalid signature` | Wrong JWT_SECRET | Check `.env` file, restart server |
| `Cannot find module './models/BlockchainRecord'` | Missing import suffix | Use `BlockchainRecord` (capital B) consistently |
| CORS error in browser | Frontend URL mismatch | Update `FRONTEND_URL` in `.env` |
| `404 /favicon.ico` | Missing favicon | Ignore or add `favicon.svg` to `client/public/` |
| Documents not loading | Backend not running | Ensure `npm run dev` is running in `/server` |
| Vite proxy error (`fetch ERR_EMPTY_RESPONSE`) | Backend crashed | Check server terminal for errors |
| bcrypt error | Incorrect bcryptjs import | Use `bcryptjs` not `bcrypt` |
| `ValidationError: email already exists` | Duplicate user | Use unique email or check existing users |
| Charts not rendering | Recharts install issue | Run `npm install recharts` in client directory |

---

## 📌 KEY DESIGN DECISIONS

1. **Base64 file storage** — Files stored as base64 in MongoDB for the demo. In production, only the CID should be stored and files served from real IPFS.

2. **Soft delete** — Users are deactivated (`isActive: false`) rather than deleted, to preserve audit trail integrity.

3. **Separated service layer** — Blockchain, IPFS, and audit are services (not controllers) to make them easily swappable without affecting business logic.

4. **No Redux** — React Context + `useState` is sufficient for this app size. Redux would add complexity without benefit.

5. **CSS Variables over Tailwind** — Full control of the design system, no build-time dependency, easier to theme.

6. **Vite proxy** — In development, Vite forwards `/api` requests to the backend, eliminating CORS issues entirely during development.

---

*BlockDMS Developer Guide — Version 1.0*
*Technology: Node.js + Express + MongoDB + React + Vite + Simulated Hyperledger Fabric*
