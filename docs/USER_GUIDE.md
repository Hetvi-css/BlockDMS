# 📖 BlockDMS — USER GUIDE
### Blockchain-Based Secure Document Management & Approval System
**Version 1.0 | March 2026**

---

## 🧭 TABLE OF CONTENTS

1. [What is BlockDMS?](#what-is-blockdms)
2. [Who Uses This System?](#who-uses-this-system)
3. [How to Access & Login](#how-to-access--login)
4. [Understanding the Dashboard](#understanding-the-dashboard)
5. [Employee Guide — Step by Step](#employee-guide)
6. [HOD Guide — Step by Step](#hod-guide)
7. [Admin Guide — Step by Step](#admin-guide)
8. [Understanding Document Statuses](#understanding-document-statuses)
9. [Audit Logs — What They Mean](#audit-logs)
10. [Blockchain Verification — What It Means](#blockchain-verification)
11. [Frequently Asked Questions](#frequently-asked-questions)
12. [Troubleshooting](#troubleshooting)

---

## 1. WHAT IS BLOCKDMS?

**BlockDMS** is a secure, digital document management and approval system used by your organization.

Think of it as a **digital filing cabinet that cannot be tampered with.** When you upload a document, the system:
- Creates a unique digital "fingerprint" (called a **hash**) of your file
- Stores the file in a decentralized storage system called **IPFS**
- Records the fingerprint permanently on a **blockchain** (like a digital ledger that cannot be erased or changed)

This means:
✅ Nobody can secretly change your document without the system detecting it
✅ Every action (upload, approve, reject) is permanently recorded
✅ You can prove a document is authentic at any time

---

## 2. WHO USES THIS SYSTEM?

There are **three types of users (roles)** in BlockDMS:

| Role | Who They Are | What They Can Do |
|------|-------------|-----------------|
| **Employee** | Regular staff who create documents | Upload, view own documents, check status, verify documents |
| **HOD** | Department Head / Authority | Review, approve, reject, or escalate documents in their department |
| **Admin** | System Administrator | Manage all users, view all documents, monitor blockchain, generate reports |

---

## 3. HOW TO ACCESS & LOGIN

### Step 1 — Open the Application
Open your web browser (Chrome, Firefox, or Edge) and go to:
```
http://localhost:5173
```
> Replace `localhost:5173` with your organization's URL if deployed to a server.

### Step 2 — Login Screen
You will see the **BlockDMS Sign In** page.

1. Enter your **Email Address** — provided by your Admin
2. Enter your **Password** — provided by your Admin
3. Click the **"Sign In Securely"** button

> 💡 **Tip:** If you're testing the system, use the **Fill** buttons next to the demo credentials to auto-fill your login.

### Demo Login Credentials (for testing):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dms.com | Admin@123 |
| HOD | hod@dms.com | Hod@123 |
| Employee | employee@dms.com | Employee@123 |

### Step 3 — After Login
After successful login, you will be taken to your **Dashboard**, which shows:
- A welcome message with your name, department, and role
- Key statistics about documents
- Recent system activity
- Quick action buttons

---

## 4. UNDERSTANDING THE DASHBOARD

The dashboard is your **home page** after login. Here is what you see:

### Welcome Banner (Top Blue Section)
- Shows your **name**, **department**, and current **date**
- Your role (Employee / HOD / Admin) is shown in colored text in the sidebar

### Stat Cards (Row of Numbers)
These show counts for:
- 📄 **Total Documents** — How many documents you have uploaded (or in your department)
- ✅ **Approved** — Documents that have been approved
- ⏳ **Pending** — Documents waiting for approval
- ❌ **Rejected** — Documents that were rejected
- 🔗 **Blockchain Tx** — Total blockchain transaction records

### Quick Actions (Left Card)
Buttons that take you directly to the most common tasks:
- **Upload New Document** — Go to the upload page
- **View My Documents** — See all your uploaded documents
- **Verify a Document** — Check if a document is authentic
- **Review Pending Approvals** (HOD/Admin only) — Go to the approval queue

### Recent Activity (Right Card)
Shows the last 8 actions that happened in the system — who did what and when.

### Blockchain Network Status (Bottom)
Shows the current state of the blockchain network:
- Total transactions recorded
- Latest block number
- Network name (Hyperledger Fabric)

---

## 5. EMPLOYEE GUIDE

### 5.1 — Uploading a Document

This is your most important task. Follow these steps carefully:

**Step 1:** Click **"Upload Document"** in the left sidebar OR the **"Upload New Document"** quick action button on the dashboard.

**Step 2:** Fill in the **Document Information** form:
- **Document Title** *(required)* — A clear name for your document (e.g., "Q3 Financial Report 2024")
- **Category** — Select the type: Report, Contract, Policy, Invoice, Research, Proposal, or Other
- **Tags** *(optional)* — Keywords separated by commas (e.g., "finance, q3, 2024")
- **Description** *(optional)* — A brief explanation of what this document contains

**Step 3:** Upload your file:
- Click the **upload box** (or drag and drop your file onto it)
- Supported formats: PDF, DOCX, XLSX, PNG, JPG, and more
- Maximum file size: **25 MB**

**Step 4:** Click **"Upload & Record on Blockchain"** button.

**Step 5 — Success Screen:** After upload you will see a confirmation screen showing:
- ✅ Confirmation message
- **IPFS CID** (Content Identifier) — Your file's unique address in IPFS storage
- **SHA-256 Hash** — Your document's unique digital fingerprint
- **Blockchain Transaction ID** — Proof it was recorded on the blockchain
- **Block Number** — Which block in the blockchain holds your record

> ⚠️ **IMPORTANT:** Save the Transaction ID and Block Number if you need to prove your document's authenticity later.

**Step 6:** Your document is now in **"Pending"** status, waiting for your HOD to review it.

---

### 5.2 — Viewing Your Documents

1. Click **"My Documents"** in the left sidebar
2. You will see a table of all documents you've uploaded
3. You can **search** by typing a document name in the search bar
4. You can **filter** by status (Pending, Approved, Rejected) or category using the dropdowns
5. Click the **"View"** button to see a document's full details

---

### 5.3 — Checking Document Status

In **My Documents**, look at the **Status** column:

| Status Label | What It Means |
|-------------|--------------|
| 🟡 **Pending** | Your document is waiting for HOD to review |
| 🔵 **Under Review** | HOD has started reviewing your document |
| 🟢 **Approved** | HOD has approved your document — it's official! |
| 🔴 **Rejected** | HOD has rejected it — check the reason in document details |
| 🟣 **Escalated** | HOD has referred it to the Admin for a final decision |

---

### 5.4 — Viewing Document Details

Click **"View"** on any document to see its full details, including:
- All document metadata (file name, size, upload date)
- **SHA-256 Hash** — The document's digital fingerprint
- **IPFS CID** — Where the file is stored
- **Blockchain Transaction ID** — Permanent blockchain record
- **Approval Comments** — Any notes from the reviewer
- **Blockchain History** — Every action taken on this document (Upload, Approve, Reject) shown on a timeline
- **Rejection Reason** (if rejected)

---

### 5.5 — Verifying a Document

If you want to prove that a document has NOT been tampered with:

1. Click **"Verify Document"** in the sidebar
2. In the search box, type the document title and select it from the results
3. Optionally, upload the physical copy of the file to compare its hash
4. Click **"Verify Document Integrity"**

**Result — Authentic ✅:** A green checkmark appears. The document hash matches the blockchain record. The document is genuine.

**Result — Tampered ⚠️:** A red warning appears. The hash does NOT match. The document may have been altered after upload.

---

### 5.6 — Viewing Your Audit Logs

1. Click **"Audit Logs"** in the sidebar
2. You will see all actions YOU have performed (employees only see their own logs)
3. Filter by action type using the dropdown at the top
4. Navigate through pages using the Previous/Next buttons

---

## 6. HOD GUIDE (Department Authority)

> HODs have all Employee abilities PLUS the ability to review and take action on documents.

### 6.1 — Reviewing Pending Documents

1. Click **"Pending Approvals"** in the sidebar — a number badge shows how many are waiting
2. You will see a table of all documents in your department
3. Use the **filter buttons** at the top to view Pending, Escalated, Under Review, Approved, or Rejected documents
4. Click **"Review"** button on any document to open its full details

---

### 6.2 — Approving a Document

On the Document Detail page:
1. Click the **green "Approve"** button (top right)
2. A dialog box appears — optionally add a comment (e.g., "Reviewed and found compliant")
3. Click **"Confirm Approval"**
4. The document status changes to **Approved** and a new blockchain record is created

---

### 6.3 — Rejecting a Document

On the Document Detail page:
1. Click the **red "Reject"** button (top right)
2. A dialog box appears:
   - **Rejection Reason** *(required)* — Explain clearly why you are rejecting (e.g., "Missing signature on page 3")
   - **Comment** *(optional)* — Any additional notes
3. Click **"Confirm Rejection"**
4. The document status changes to **Rejected** with your reason saved

---

### 6.4 — Escalating a Document to Admin

If a document requires Admin-level decision (e.g., it's too complex or outside your authority):
1. Click the **amber "Escalate"** button (top right)
2. Optionally add a comment explaining why you're escalating
3. Click **"Escalate to Admin"**
4. The document status becomes **Escalated** and the Admin can now take action on it

---

### 6.5 — HOD-Only Features

As HOD, you also have access to:
- **Blockchain Explorer** — View all blockchain transaction records
- **Reports** — View pie charts and bar charts for document statistics

---

## 7. ADMIN GUIDE

> Admins have full access to ALL features.

### 7.1 — User Management

1. Click **"User Management"** in the sidebar
2. You will see a table of all registered users with their name, email, role, department, employee ID, and status

**To Create a New User:**
1. Click the **"+ Add User"** button (top right)
2. Fill in the form:
   - Full Name, Email Address (required)
   - Password (required for new users)
   - Role: Employee, HOD, or Admin
   - Department, Employee ID, Phone
3. Click **"Create User"**

**To Edit a User:**
1. Click the **pencil (✏️) icon** next to any user
2. Update their details (leave password blank to keep existing)
3. Click **"Save Changes"**

**To Deactivate a User:**
1. Click the **trash (🗑️) icon** next to any user
2. Confirm deactivation in the dialog
3. Their account is deactivated — they cannot log in anymore

---

### 7.2 — Monitoring All Documents

1. Click **"My Documents"** — As Admin you see ALL documents from ALL departments
2. Use the department filter (if available) to filter by department
3. You can approve/reject any documents, especially **Escalated** ones

---

### 7.3 — Overriding Approvals

Admins can approve or reject any document, including escalated ones.
1. Go to **Pending Approvals** and select the **"Escalated"** filter
2. Click **"Review"** on the escalated document
3. Click **Approve** or **Reject** and confirm the action

---

### 7.4 — Monitoring the Blockchain

1. Click **"Blockchain Explorer"**
2. See all blockchain transactions recorded in the system
3. Click **"Details"** on any record to see:
   - Block Hash
   - Document Hash
   - Channel name (mychannel)
   - Chaincode name (document-chaincode)

---

### 7.5 — Viewing Audit Logs

1. Click **"Audit Logs"** — as Admin you see ALL users' logs
2. Filter by action type using the dropdown
3. Navigate with Previous/Next buttons
4. See who did what, when, and on which document

---

### 7.6 — Reports & Analytics

1. Click **"Reports"**
2. View:
   - **KPI cards** showing total documents, users, blockchain transactions, audit records
   - **Pie chart** — Documents by Status (Approved, Pending, Rejected, etc.)
   - **Bar chart** — Documents by Category (Report, Contract, Policy, etc.)
   - **Department breakdown** — Progress bars showing which departments have submitted how many documents
   - **Recent activity table** — Last 10 system actions

---

## 8. UNDERSTANDING DOCUMENT STATUSES

| Status | Color | Meaning | Who Sees This |
|--------|-------|---------|--------------|
| **Pending** | 🟡 Yellow | Newly uploaded, waiting for HOD to review | Employee, HOD, Admin |
| **Under Review** | 🔵 Blue | HOD has opened and is reviewing | All roles |
| **Approved** | 🟢 Green | Officially approved — document is valid | All roles |
| **Rejected** | 🔴 Red | Rejected by HOD — see rejection reason | All roles |
| **Escalated** | 🟣 Purple | Referred to Admin for decision | All roles visible, Admin action required |

---

## 9. AUDIT LOGS

Audit logs record **every single action** taken in the system. You cannot delete or change audit logs — they are permanent.

### What Each Action Means:

| Action Name | What Happened |
|------------|--------------|
| DOCUMENT_UPLOADED | A new document was uploaded |
| DOCUMENT_APPROVED | A document was approved |
| DOCUMENT_REJECTED | A document was rejected |
| DOCUMENT_ESCALATED | A document was escalated to Admin |
| DOCUMENT_VERIFIED | Someone ran a blockchain verification check |
| DOCUMENT_TAMPERED | Tampering was detected during verification |
| BLOCKCHAIN_RECORDED | A transaction was recorded on the blockchain |
| USER_LOGIN | A user logged into the system |
| USER_CREATED | Admin created a new user |

---

## 10. BLOCKCHAIN VERIFICATION

### What is a Hash?
A **hash** is a unique string of characters generated from your document content. If even ONE character in the document changes, the hash changes completely. For example:
- Original document hash: `a3f9c1d8e2b4...`
- After tampering: `99b12af7d3c1...` ← Completely different!

### What is IPFS?
IPFS (InterPlanetary File System) is a decentralized storage system. Your files are not stored on just one server — they are distributed, making them more secure and reliable.

### What is Hyperledger Fabric?
Hyperledger Fabric is an enterprise blockchain platform. Your document's hash is written to this blockchain. Because blockchain records are **immutable** (cannot be changed), this proves the document existed at a specific time with a specific content.

### How Verification Works (simple terms):
1. System takes your document file
2. Calculates the current hash (SHA-256 algorithm)
3. Compares it with the hash stored on the blockchain when it was first uploaded
4. If they **match** → Document is authentic ✅
5. If they **don't match** → Document was altered ⚠️

---

## 11. FREQUENTLY ASKED QUESTIONS

**Q: I forgot my password. What do I do?**
A: Contact your System Administrator. They can reset your password from the User Management page.

**Q: I can't see some menu items like "Blockchain Explorer" or "User Management".**
A: These are restricted to specific roles. Blockchain Explorer is for HOD and Admin only. User Management is for Admin only. If you need access, contact your Admin.

**Q: My document was rejected. What should I do?**
A: Go to **My Documents**, click **"View"** on the rejected document. Scroll down to see the **"Rejection Reason"** in the red alert box. Fix the issue and upload a corrected version.

**Q: How long does blockchain recording take?**
A: The process is near-instant (under 1 second) since this is a simulated blockchain environment.

**Q: Can I delete a document I uploaded?**
A: No. Once a document is uploaded and recorded on the blockchain, the record is permanent. This is by design — it prevents tampering and maintains a complete audit trail.

**Q: What happens if I upload the same file twice?**
A: Both uploads will have the same SHA-256 hash (because the content is identical), but each will receive a unique IPFS CID and blockchain transaction ID.

**Q: Is my document content visible to everyone?**
A: Only users in your department and Admins can see your document metadata. The actual file content is only accessible to authorized roles.

---

## 12. TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Can't log in | Check email/password. Ensure account is active. Contact Admin. |
| Upload fails | Ensure file is under 25 MB. Check internet connection. |
| Page shows loading forever | Refresh the page. Check if the backend server is running. |
| "Access denied" error | You're trying to access a page that requires a higher role. |
| Verification shows "failed to load" | Ensure the backend is running on port 5000. |
| Blockchain Explorer shows no records | Upload at least one document first to generate records. |

---

*For technical support, contact your System Administrator.*
*Document Version: 1.0 | BlockDMS Secure Document Management System*
