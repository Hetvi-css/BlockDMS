# 📘 BlockDMS — Blockchain Secure Document Management System

## Enterprise-Grade Document Management with Blockchain Integrity

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running on localhost:27017

### 1. Start Backend
```powershell
cd server
npm install
npm run dev
```

### 2. Start Frontend (new terminal)
```powershell
cd client
npm install
npm run dev
```

### 3. Open Browser
Go to: **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@dms.com | Admin@123 |
| **HOD** | hod@dms.com | Hod@123 |
| **Employee** | employee@dms.com | Employee@123 |

---

## 📁 Project Structure

```
blockchain-dms/
├── server/          ← Node.js + Express Backend
├── client/          ← React + Vite Frontend
└── docs/
    ├── USER_GUIDE.md       ← Complete user documentation
    └── DEVELOPER_GUIDE.md  ← Full technical reference
```

---

## ⚡ Feature Overview

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Secure login with bcrypt passwords |
| 📄 **Document Upload** | SHA-256 hash + IPFS CID + Blockchain TX |
| ✅ **Approval Workflow** | Employee → HOD → Admin escalation chain |
| 🔗 **Blockchain** | Hyperledger Fabric simulation with block hashes |
| 🛡️ **Verification** | Real-time hash comparison against blockchain |
| 📋 **Audit Trail** | Every action logged permanently |
| 📊 **Reports** | Charts for document statistics |
| 👥 **User Management** | Admin CRUD for all users |

---

## 📚 Documentation

- **[📖 User Guide](docs/USER_GUIDE.md)** — For all users (Employee, HOD, Admin)
- **[🛠️ Developer Guide](docs/DEVELOPER_GUIDE.md)** — Full technical documentation

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Vanilla CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Blockchain | Hyperledger Fabric (Simulated) |
| File Storage | IPFS (Simulated) |
| Hashing | SHA-256 (Node.js crypto) |
| Charts | Recharts |
| Icons | Lucide React |
