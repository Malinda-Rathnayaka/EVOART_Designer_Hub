# EVO ART — Designer Platform (MERN Stack)

A complete, production-grade **Designer Platform** engineered for **EVO ART** with the **MERN** stack: **MongoDB**, **Express.js**, **React.js**, and **Node.js**.

---

## 🌟 Key Architecture & Capabilities

### 1. User Roles & Capabilities

#### **Administrator**
- **Authentication**: Secure JWT-based login with bcrypt password hashing.
- **Designer Account Management**: Create designer accounts, assign login credentials, track active assignment capacity, and activate/deactivate accounts.
- **Project Creation & Management**: Publish client design briefs with initial price, deadline, category, and multi-file reference specifications.
- **Independent Bidding Controls**: Open or close bidding on any project at any time without disrupting awarded assignments.
- **All-Bid Review & Winner Selection**: Inspect all private bids submitted for a project, compare proposals, review designer active loads, and select the winning bidder with automated quota safety checks.
- **Deliverables Review & Revisions**: Download submitted design files, review version history, approve completed work (releasing the assignment slot), or request revisions with constructive feedback.
- **Formal Assignment Cancellation**: Formally cancel assignments when client scope changes, immediately releasing the designer's active slot.

#### **Designer**
- **Secure Access**: Log in with administrator-assigned credentials.
- **Card-Based Project Dashboard**: Explore available projects, review design specifications, initial budgets, deadlines, and download reference materials.
- **Private Bidding**: Submit bids strictly lower than the initial project price.
- **Bid Privacy Guaranteed**: Designers can only view their own bids. Under no circumstances can designers inspect other bidders' details, pricing, or proposals.
- **Real-Time 3-Active-Assignment Quota Gauge**: Live visual tracker (`1/3 Active`, `2/3 Active`, `3/3 Limit Reached`) showing available assignment slots and preventing overallocation.
- **Design Deliverable & Revision Uploads**: Submit initial deliverables and revised design files directly to the platform.
- **Revision Feedback Feed**: Review admin critique and upload subsequent versions.

---

### 2. The Strict Maximum 3 Active Assignments Rule

The platform enforces a strict backend and frontend limit: **a designer can hold a maximum of 3 active awarded assignments concurrently**.

- **Active Assignment Statuses**: `in_progress`, `under_review`, and `revision_requested`.
- **Uploading a design does NOT release an assignment slot** (moves to `under_review`).
- **A revision request does NOT release an assignment slot** (moves to `revision_requested`).
- **Admin approval releases the slot** (moves to `approved`, allowing the designer to accept a new project).
- **Formal admin cancellation also releases the slot** (moves to `cancelled`).
- Attempting to award a 4th assignment to a designer at capacity is blocked at the service level with an explicit quota error.

---

### 3. Design Submission & Review Lifecycle

```text
[ Admin Publishes Project & Opens Bidding ]
                     │
                     ▼
[ Designers Submit Confidential Bids (< Initial Price) ]
                     │
                     ▼
[ Admin Reviews All Bids & Awards Winner ]
                     │ (Checks 3-Assignment Quota)
                     ▼
[ Assignment Created (Status: In Progress) ]
                     │
                     ▼
[ Designer Uploads Deliverable Files ]
                     │ (Status: Under Review — Slot NOT released)
                     ▼
[ Admin Reviews Deliverable Files ]
       │                                │
       ▼ (Revision Needed)              ▼ (Approved)
[ Admin Requests Revision ]      [ Admin Approves Work ]
       │ (Slot NOT released)            │
       ▼                                ▼
[ Designer Uploads Revision ]    [ Project Completed ]
       │                                │
       └───────────────►                ▼
                                 [ Assignment Slot Released! ]
```

---

## 📁 Project Structure

```text
designer-bidding-platform/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AwardModal.jsx
│   │   │   ├── BidModal.jsx
│   │   │   ├── CancelModal.jsx
│   │   │   ├── DesignerModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectModal.jsx
│   │   │   ├── QuotaBadge.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── SubmissionModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminAssignmentsPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDesignersPage.jsx
│   │   │   ├── DesignerAssignmentsPage.jsx
│   │   │   ├── DesignerBidsPage.jsx
│   │   │   ├── DesignerDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProjectDetailsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── assignmentController.js
│   │   ├── authController.js
│   │   ├── bidController.js
│   │   ├── fileController.js
│   │   ├── projectController.js
│   │   ├── submissionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Assignment.js
│   │   ├── Bid.js
│   │   ├── Project.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/
│   │   ├── assignmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bidRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── submissionRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── assignmentService.js
│   ├── tests/
│   │   └── workflow.test.js
│   ├── uploads/
│   │   ├── references/
│   │   └── submissions/
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **npm**: v9+

### 2. Environment Configuration
The backend comes pre-configured with zero-configuration fallback:
- If `MONGO_URI` is set in `backend/.env`, Mongoose connects to your local or MongoDB Atlas instance.
- If `MONGO_URI` is blank or no external daemon is running, the server automatically starts an embedded in-memory MongoDB runner so you can test and run out of the box with zero external configuration!

To configure custom credentials, copy the example:
```bash
cp backend/.env.example backend/.env
```

### 3. Install All Dependencies
From the repository root:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 4. Run Seed & Test Suite
Verify all 8 workflow tests (including the 3-active-assignment enforcement, private bidding, and revisions):
```bash
npm test
```

Seed initial demo data (Admin, 3 Designers, sample projects, and bids):
```bash
npm run seed
```

### 5. Launch Development Platform
Start both the backend API and frontend React client simultaneously:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Pre-Seeded Evaluation Accounts

The platform includes a **One-Click Quick Switcher** in the top navigation bar and on the login page for rapid testing:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Victoria Vance | `admin@platform.com` | `admin123` | Lead Art Director & System Administrator |
| **Designer** | Sarah Jenkins | `sarah@designer.com` | `designer123` | Senior UI/UX (Has 1 active assignment seeded) |
| **Designer** | Marcus Chen | `marcus@designer.com` | `designer123` | Brand Identity Designer (0/3 active) |
| **Designer** | Elena Rostova | `elena@designer.com` | `designer123` | 3D & Motion Artist (0/3 active) |

---

## 🔒 Security & Data Privacy

1. **Strict Bid Privacy**:
   - `/api/bids/project/:id` is strictly protected by `authorize('admin')`.
   - Designers querying `/api/bids/my-bids` receive exclusively their own records.
   - Individual bid lookups `/api/bids/:id` verify ownership; a designer attempting to query another designer's bid ID is blocked with HTTP 403 Forbidden.
2. **Protected File Serving**:
   - Deliverables are served via `/api/files/submissions/:filename`.
   - The route validates the JWT and checks whether the requester is an admin or the designer who submitted the file. Unauthorized access attempts receive HTTP 403.
   - Path sanitization prevents directory traversal attacks.

---

## 🧪 Automated Test Suite

Run `npm test` from the root directory to execute the end-to-end test suite (`backend/tests/workflow.test.js`). The test validates:
1. Admin user creation & bcrypt password hashing
2. Designer account creation
3. Project publication with initial price and bidding rules
4. Bid validation: rejection of bids $\ge$ initial price, unique bid indexing
5. Winner selection & rejected bid status cascade
6. **Maximum 3-Active-Assignment Enforcement**:
   - Awarding 1st, 2nd, and 3rd assignments succeeds
   - Awarding a 4th assignment to the same designer fails with an explicit quota error
7. Design submission: verifying that uploading deliverable files does **not** release an assignment slot
8. Revision requests: verifying that revision requests do **not** release an assignment slot
9. Admin approval: verifying that approving deliverables **releases** the designer's slot
10. Re-awarding after release: verifying the designer can now receive another project
11. Formal cancellation: verifying that cancelling an assignment releases the designer's slot
