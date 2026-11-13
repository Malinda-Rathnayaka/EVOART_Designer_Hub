# EVO ART — Designer Platform (MERN Stack)

A complete, production-grade **Creative Design Bidding & Assignment Management Platform** engineered for **EVO ART**. Built with the modern **MERN** stack: **React 19**, **Vite 8**, **Tailwind CSS v4**, **Node.js**, **Express.js**, and **MongoDB Atlas**, featuring hybrid cloud storage via **Cloudinary CDN** and **Google Drive**.

---

## 🌟 Key Features & Architecture

### 1. Dual-Role Creative Workflow

#### **Administrator**
- **Authentication**: Secure JWT-based login with bcrypt password hashing (10 rounds). Supports dual-identifier login (email or username).
- **Designer Accounts**: Create and manage designer accounts, set custom bios and skill tags, track active workload capacity, and activate/deactivate accounts.
- **Project Brief Publishing**: Publish client briefs with initial budgets, deadlines, categories, and multi-file moodboard/reference specifications.
- **Reference Asset Storage (Cloudinary CDN)**: Admin briefs and reference materials are hosted on **Cloudinary CDN** with automated thumbnail generation, responsive previews, and instant downloads.
- **Independent Bidding Controls**: Open or close bidding on any project at any time without impacting awarded assignments.
- **Deep Bidding Inspection & Comparison**:
  - Live metric summary banner: total candidate count, lowest offer, average bid, and fastest turnaround.
  - Interactive sorting pills: sort candidates by **Lowest Price**, **Fastest Delivery**, or **Newest**.
  - Detailed designer profile cards: avatar initials, email, skill pills, bio, active workload capacity (`N/3`), formatted proposal quote, and savings calculation against original initial price (`Save $X (-Y%)`).
  - Access candidate reviews even after a project has been awarded.
- **Deliverable Reviews & Versioning**: Download completed submissions, inspect designer revision notes, approve completed work (releasing the assignment slot), or request revisions with structured feedback.
- **Formal Assignment Cancellation**: Formally cancel assignments if client requirements change, instantly freeing the designer's workload slot.

#### **Designer**
- **Credential Access**: Log in using administrator-assigned credentials (supports email or name).
- **Interactive Project Dashboard**: Explore active design briefs, inspect design guidelines, view initial prices, deadlines, and download reference files.
- **Confidential Bidding**: Submit bids verified strictly lower than the initial project price.
- **Guaranteed Bid Privacy**: Designers can only view their own private bid and status. Under no circumstances can a designer view competitors' bids, pricing, or proposals.
- **Live 3-Active-Assignment Quota Tracker**: Interactive visual gauge (`0/3`, `1/3`, `2/3`, `3/3 Limit Reached`) showing available assignment slots and preventing overallocation.
- **Deliverable Uploads (Google Drive)**: Submit finished design packages, exports, and revisions directly into **Google Drive** using an integrated Apps Script webhook and centralized client drive link.
- **Revision History Feed**: Review administrative feedback notes and upload revised deliverables.

---

### 2. Hybrid Cloud Storage Architecture

The platform intelligently separates file storage based on workflow responsibilities:

```text
                     ┌──────────────────────────────────────────────┐
                     │           EVO ART Storage Router             │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
     [ Admin Reference Files ]                      [ Designer Deliverables ]
     • Moodboards, Wireframes, Specs                • PNG, SVG, PDF, PSD, AI, FIG, ZIP
     • Uploaded via ProjectModal                    • Uploaded via SubmissionModal
     • Direct Cloudinary CDN Storage                • Direct Google Drive Storage
     • Responsive previews & thumbnails             • Apps Script Webhook Integration
```

- **Cloudinary CDN (`cloudinaryService.js`)**: Powers all administrative reference assets and inspiration files with high-speed global delivery.
- **Google Drive Storage (`googleDriveService.js`)**: Directs all designer deliverable submissions and revision versions into a centralized, client-facing Google Drive folder.
- **Real-Time Upload Loading States**: Both upload modals feature animated gradient shimmer bars (`upload-progress-animated`), pulsing highlights, and spinner loaders for transparent progress tracking.

---

### 3. The Strict Maximum 3 Active Assignments Rule

The platform enforces a strict capacity rule: **a designer can hold a maximum of 3 active awarded assignments concurrently**.

- **Active Assignment Statuses**: `in_progress`, `under_review`, and `revision_requested`.
- **Uploading a design does NOT release an assignment slot** (moves to `under_review`).
- **A revision request does NOT release an assignment slot** (moves to `revision_requested`).
- **Admin approval releases the slot** (moves to `approved`, allowing the designer to accept a new project).
- **Formal admin cancellation also releases the slot** (moves to `cancelled`).
- Attempting to award a 4th assignment to a designer at capacity is blocked at the service level with an explicit quota error.

```text
[ Admin Publishes Project & Opens Bidding ]
                     │
                     ▼
[ Designers Submit Confidential Bids (< Initial Price) ]
                     │
                     ▼
[ Admin Reviews All Bids & Awards Winner ]
                     │ (Verifies 3-Assignment Quota)
                     ▼
[ Assignment Created (Status: In Progress) ] ── (Capacity: 1/3)
                     │
                     ▼
[ Designer Uploads Deliverable Files to Drive ]
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

### 4. Dynamic Dark & Light Mode Theming

- **Global Theme Engine (`ThemeContext.jsx`)**: Supports dynamic switching between dark and light themes with automatic system preference detection (`prefers-color-scheme`) and `localStorage` persistence (`evo_theme`).
- **Interactive Toggle Control (`ThemeToggle.jsx`)**: Displays an animated glowing Sun ☀️ in dark mode and Moon 🌙 in light mode. Positioned in the top navigation bar and inside user profile settings.
- **Tailored Palettes**:
  - **Dark Mode**: Deep-space background (`#090c13`), glowing indigo/cyan glassmorphism cards, and neon accent highlights.
  - **Light Mode**: Clean slate background (`#f8fafc`), crisp elevated white cards (`#ffffff`), high-contrast dark typography, and soft pastel status badges.
- **Login Screen Integrity**: The authentication page ([LoginPage.jsx](file:///d:/EVO%20ART/Projects/New%20folder/frontend/src/pages/LoginPage.jsx)) is intentionally locked to its signature dark space aesthetic and particle canvas.

---

### 5. Security & Zero-Hardcode Hardening

- **Zero Hardcoded Secrets**: All authentication keys and sensitive settings are read exclusively from `.env`. If `JWT_SECRET` is missing, the backend fails fast during startup with an explicit terminal error banner.
- **Brute-Force Rate Limiting**: The `POST /api/auth/login` endpoint is protected by `express-rate-limit` (15 requests per 15-minute window per IP).
- **Password Security**: Passwords are encrypted with `bcryptjs` (10 rounds) and protected with `{ select: false }` to prevent leakage in standard database queries.
- **Mass-Assignment Defense**: Profile updates explicitly whitelist permitted fields (`name`, `bio`, `skills`), preventing unauthorized role elevation.
- **Path Traversal Protection**: File controllers enforce `path.basename()` on all disk access.
- **Comprehensive Audit**: Full security vulnerability assessment documented in [SECURITY_REPORT.md](file:///d:/EVO%20ART/Projects/New%20folder/SECURITY_REPORT.md).

---

## 📁 Repository Structure

```text
EVO ART Platform/
├── frontend/                               # React 19 + Vite 8 + Tailwind CSS v4 Client
│   ├── src/
│   │   ├── assets/                         # Static icons and graphic assets
│   │   ├── components/                     # Modular UI components
│   │   │   ├── AwardModal.jsx              # Candidate comparison & winner selection modal
│   │   │   ├── BidModal.jsx                # Designer private bid submission modal
│   │   │   ├── CancelModal.jsx             # Formal assignment cancellation modal
│   │   │   ├── DesignerModal.jsx           # Admin designer account creation/edit modal
│   │   │   ├── Navbar.jsx                  # Top navigation bar with quota & theme toggle
│   │   │   ├── ProfileModal.jsx            # User profile editor & password changer
│   │   │   ├── ProjectCard.jsx             # Dashboard project card with bidding pill
│   │   │   ├── ProjectModal.jsx            # Project creation & edit modal (Cloudinary upload)
│   │   │   ├── QuotaBadge.jsx              # Visual 3-active-assignment capacity gauge
│   │   │   ├── ReviewModal.jsx             # Admin deliverable review & revision modal
│   │   │   ├── StatCard.jsx                # Metrics card with ambient color glow
│   │   │   ├── SubmissionModal.jsx         # Designer deliverable submission (Google Drive)
│   │   │   ├── ThemeToggle.jsx             # Interactive Dark/Light mode toggle button
│   │   │   └── Toast.jsx                   # Global notification alert toasts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # Authentication session & profile context
│   │   │   └── ThemeContext.jsx            # Dark/Light mode state and DOM synchronizer
│   │   ├── pages/                          # Role-specific application views
│   │   │   ├── AdminAssignmentsPage.jsx    # Admin deliverable reviews & approvals
│   │   │   ├── AdminDashboard.jsx          # Admin project portfolio & metrics
│   │   │   ├── AdminDesignersPage.jsx      # Admin designer roster & capacity tracker
│   │   │   ├── DesignerAssignmentsPage.jsx # Designer active assignments & upload hub
│   │   │   ├── DesignerBidsPage.jsx        # Designer private submitted bids view
│   │   │   ├── DesignerDashboard.jsx       # Designer project discovery & bidding feed
│   │   │   ├── LoginPage.jsx               # Dark glassmorphic canvas login view
│   │   │   └── ProjectDetailsPage.jsx      # Full specification view & candidate list
│   │   ├── services/
│   │   │   └── api.js                      # Universal Fetch API client wrapper
│   │   ├── App.jsx                         # Main router & layout coordinator
│   │   ├── index.css                       # Global design system & theme variables
│   │   └── main.jsx                        # React root entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                                # Node.js & Express REST API Server
│   ├── config/
│   │   └── db.js                           # MongoDB Atlas connection & test isolation
│   ├── controllers/                        # Route business logic handlers
│   │   ├── assignmentController.js         # Awarding, reviews, and cancellations
│   │   ├── authController.js               # Login, session validation, and profiles
│   │   ├── bidController.js                # Bid validation, updates, and bid privacy
│   │   ├── fileController.js               # Protected file download & Cloud/Drive redirects
│   │   ├── projectController.js            # Project briefs and bidding toggles
│   │   ├── submissionController.js         # Deliverable versions and revisions
│   │   └── userController.js               # Designer account CRUD and capacity stats
│   ├── middleware/
│   │   ├── authMiddleware.js               # JWT verification & RBAC authorization
│   │   ├── errorMiddleware.js              # Global error handler & Mongoose formatter
│   │   └── uploadMiddleware.js             # Multer multi-part file parser
│   ├── models/                             # Mongoose database schemas
│   │   ├── Assignment.js                   # Project-designer binding & status tracking
│   │   ├── Bid.js                          # Confidential designer proposal & pricing
│   │   ├── Designer.js                     # Designer accounts collection (`designers`)
│   │   ├── Project.js                      # Creative briefs and reference files
│   │   ├── Submission.js                   # Deliverables and revision history versions
│   │   └── User.js                         # Administrator accounts collection (`users`)
│   ├── routes/                             # Express REST API endpoints
│   │   ├── assignmentRoutes.js             # `/api/assignments`
│   │   ├── authRoutes.js                   # `/api/auth` (with rate limiter)
│   │   ├── bidRoutes.js                    # `/api/bids`
│   │   ├── fileRoutes.js                   # `/api/files`
│   │   ├── projectRoutes.js                # `/api/projects`
│   │   ├── submissionRoutes.js             # `/api/submissions`
│   │   └── userRoutes.js                   # `/api/users`
│   ├── services/                           # External cloud & workflow services
│   │   ├── assignmentService.js            # Core quota checks & lifecycle logic
│   │   ├── cloudinaryService.js            # Cloudinary asset uploads & thumbnailing
│   │   └── googleDriveService.js           # Google Drive Apps Script webhook uploads
│   ├── tests/
│   │   └── workflow.test.js                # Comprehensive 8-stage automated test suite
│   ├── utils/
│   │   ├── generateToken.js                # JWT token signing with .env verification
│   │   └── seed.js                         # DB maintenance for Administrator account
│   ├── .env.example                        # Documented environment template
│   ├── package.json
│   └── server.js                           # Application entry & startup validation
├── SECURITY_REPORT.md                      # Complete security audit and vulnerability report
├── .gitignore
├── package.json                            # Root orchestration scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20 and v22)
- **npm**: v9+
- **MongoDB Atlas** database URI

### 2. Environment Configuration
Create a `.env` file in the root and in the `backend/` directory (or copy from `.env.example`):

```bash
cp backend/.env.example backend/.env
```

Configure your environment variables:

```ini
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/designer_platform

# JWT Configuration (Required — server fails fast if missing)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=30d

# Platform Administrator Credentials (used by seed.js)
ADMIN_EMAIL=admin@evoart.com
ADMIN_PASSWORD=YourSecureAdminPassword2026

# Cloudinary Storage Configuration (Admin Reference Files)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Drive Storage Configuration (Designer Deliverables)
GOOGLE_DRIVE_UPLOAD_URL=https://script.google.com/macros/s/your_apps_script_id/exec
GOOGLE_DRIVE_FOLDER_LINK=https://drive.google.com/drive/folders/your_folder_id?usp=drive_link
```

### 3. Installation
From the root directory, install dependencies across both frontend and backend:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 4. Database Setup & Automated Testing
Verify the entire business workflow, including the strict 3-active-assignment limit and revision lifecycles:

```bash
npm test
```

Initialize or maintain the Administrator account in the database (read from `.env`):

```bash
npm run seed
```

### 5. Running the Application
Launch both the backend API and frontend client with a single command:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated System Tests

Execute `npm test` from the root directory to run the end-to-end integration test suite (`backend/tests/workflow.test.js`). The suite validates 8 comprehensive stages:

1. **User Creation & Password Hashing**: Verifies admin creation in `users` collection and designer creation in `designers` collection with bcrypt hashing.
2. **Project Creation & Bidding Status**: Verifies publishing briefs with initial budgets and opening bidding windows.
3. **Private Bid Validation**: Verifies bid submissions lower than initial budget, duplicate prevention via compound indexes, and bid privacy.
4. **Winner Selection & Status Cascade**: Verifies assigning projects to winning bidders and auto-rejecting competing bids.
5. **Strict 3-Active-Assignment Capacity Rule**:
   - Successfully awards 1st, 2nd, and 3rd assignments.
   - Strictly blocks awarding a 4th assignment to a designer at capacity with an explicit quota error.
6. **Deliverable Submissions & Revision Workflow**: Verifies that uploading deliverables and requesting revisions keeps the assignment active and does **not** free the capacity slot.
7. **Admin Approval & Slot Release**: Verifies that approving finished deliverables releases the assignment slot, enabling the designer to take on new projects.
8. **Formal Cancellation & Slot Release**: Verifies that cancelling an assignment releases the slot back to the designer.

---

## 🔒 Security Summary

A comprehensive security audit report is available in [SECURITY_REPORT.md](file:///d:/EVO%20ART/Projects/New%20folder/SECURITY_REPORT.md). Key security controls include:
- **No Hardcoded Credentials**: Automatic startup check validates environment secrets before server boots.
- **Brute Force Protection**: IP rate limiting on login attempts via `express-rate-limit`.
- **Bid Privacy by Design**: Competitor bids are filtered out before reaching any designer.
- **Directory Traversal Mitigation**: Local file requests sanitized using `path.basename()`.
- **Collection Isolation**: Administrative users and designers are stored in separate MongoDB collections.

---

## 📄 License
ISC License © EVO ART
