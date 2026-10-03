# CareerSprint
## Full-Stack Internship & Job Application Tracking Platform

---

# 1. Project Overview

**CareerSprint** is a full-stack web application designed for students and job seekers to manage, organize, and monitor their internship and full-time job applications in one centralized dashboard. It provides candidate application tracking alongside an administrative portal for recruiters or university placement officers to oversee candidate applications, update recruitment statuses, schedule interviews, and provide offer letters.

Unlike basic CRUD applications that merely record static data, CareerSprint incorporates:
- **Bi-directional Status Synchronization**: Application status changes made by administrators automatically synchronize the candidate's recruitment timeline, mark completed milestones, and trigger instant candidate notifications.
- **Role-Based Workflows**: Separate, secure candidate and administrator portals built with JWT authentication and strict server-side middleware authorization.
- **Document Management**: Candidate-owned resume upload/replacement system paired with administrator-restricted offer letter attachment workflows.
- **Preparation & Analytics**: Interactive preparation checklists per application, upcoming interview calendars, and dynamic status distribution visualizations powered by Recharts.
- **Responsive Theme System**: Full light/dark mode support with persistent preferences and responsive layouts across desktop, tablet, and mobile devices.

---

# 2. Problem Statement

Students and job seekers applying to dozens of internships and full-time roles face significant organizational challenges:
1. **Fragmented Tracking**: Applications are often tracked across scattered spreadsheets, text files, and browser bookmarks, leading to forgotten deadlines and missing follow-ups.
2. **Document Confusion**: Maintaining multiple versions of resumes and tracking which resume was submitted to which company creates confusion during interview calls.
3. **Opaque Recruitment Status**: Candidates lack visibility into where they stand in an organization's hiring pipeline once an application is submitted.
4. **Interview Scheduling Conflicts**: Managing multiple interview rounds, online assessments (OA), and technical tests without a consolidated timeline leads to scheduling oversights.
5. **Disconnected Communication**: Communication regarding shortlist status, interview invitations, or offer letter issuance is scattered across emails and messaging platforms without a centralized record.

CareerSprint solves these real-world pain points by providing a unified, real-time application lifecycle platform.

---

# 3. Project Objectives

- **Centralized Application Repository**: Allow candidates to record company name, role, status, application date, interview date, location, job type, salary, job links, and notes.
- **Automated Recruitment Timeline**: Automatically update recruitment stage progression (`Applied` → `Under Review` → `Shortlisted` → `OA` → `Interview` → `Offer` / `Rejected`) when administrators adjust application statuses.
- **Document Association**: Store and serve candidate-specific resumes (PDF/DOCX) and administrator-issued offer letters safely with direct view and download capabilities.
- **Real-Time Notification System**: Deliver target notifications to candidate accounts whenever application statuses change or offer letters are uploaded.
- **Placement & Recruiter Portal**: Equip administrators with candidate filtering, application review tools, status batch management, and candidate profile inspection.
- **Responsive & Accessible Interface**: Provide a seamless user interface featuring dark/light themes, loading skeletons, modal dialogs, location autocompletion, and mobile drawer navigation.

---

# 4. Users and Roles

The current implementation supports two distinct user roles stored in the MongoDB `User` schema:

| Role | Target User | Access & Capabilities | Restricted Actions |
| :--- | :--- | :--- | :--- |
| **Candidate** (`candidate`) | Student / Job Seeker | • View personal dashboard & analytics<br>• Create, edit, and delete personal applications<br>• Upload and update personal resume (PDF/DOCX)<br>• Manage interview dates, notes, and preparation checklists<br>• View notifications & mark them as read<br>• Download admin-attached offer letters<br>• Update profile & change account password | • Cannot access administrative routes (`/admin/*`)<br>• Cannot view other candidates' applications<br>• Cannot directly upload offer letters<br>• Cannot change role to admin |
| **Administrator** (`admin`) | Recruiter / Placement Officer | • Access admin dashboard with global metrics<br>• View all applications submitted across all candidates<br>• Filter, search, and sort global applications<br>• Inspect full candidate profile details & resumes<br>• Update candidate application statuses & synchronize timelines<br>• Attach official offer letters to candidate applications<br>• Schedule/update candidate interview dates | • Cannot modify candidate personal password or profile links<br>• Cannot overwrite candidate resume files directly |

---

# 5. Technology Stack

## Frontend
- **React.js (v18.3.1)**: Component-based user interface library utilizing functional components and hooks (`useState`, `useEffect`, `useContext`, `useMemo`).
- **React Router DOM (v7.18.2)**: Client-side routing with `BrowserRouter`, `Routes`, `Route`, `Navigate`, and route guard wrappers.
- **Tailwind CSS (v3.4.19)**: Utility-first CSS framework styled with custom CSS variables for light/dark theme toggle.
- **Lucide React (v1.27.0)**: Clean, consistent SVG icon set for dashboard cards, status indicators, and navigation elements.
- **Recharts (v3.10.1)**: Responsive data visualization library used for Pie/Donut charts and Bar charts on dashboards.
- **Axios (v1.18.1)**: HTTP client configured with request interceptors for JWT injection and response interceptors for automatic session cleanup.
- **React Hot Toast (v2.6.0)**: Toast notification engine for user feedback on API operations.
- **Vite (v5.4.10)**: Fast frontend build tool and development server.

## Backend
- **Node.js**: Asynchronous JavaScript runtime engine.
- **Express.js (v4.22.2)**: Web application framework handling routing, REST endpoints, middleware execution, and static file serving.
- **JSONWebToken (v9.0.3)**: Signed JWT creation and verification for stateless authentication.
- **BcryptJS (v3.0.3)**: Password hashing with 10 salt rounds for secure credential storage.
- **Multer (v2.2.0)**: Multipart/form-data middleware configured with strict file extension filters (PDF/DOCX) and file size limits (10MB).
- **Cloudinary (v2.10.0)**: Optional cloud storage integration supported via environment variable configuration.
- **CORS (v2.8.6)**: Cross-Origin Resource Sharing handling dynamic localhost ports in development and configured production domains.
- **Dotenv (v17.4.2)**: Environment variable loader.

## Database
- **MongoDB**: NoSQL document-oriented database.
- **Mongoose (v9.8.1)**: Object Data Modeling (ODM) library for schema definition, validation, population, pre-save hooks, and compound indexes.

## Other Tools / Services
- **Nodemon (v3.1.14)**: Development utility for backend hot-reloading.
- **PowerShell / Node CLI Scripts**: Custom seeding (`seed.js`) and admin elevation (`make-admin.js`) scripts.

---

# 6. Project Structure

```
CareerSprint/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic via Mongoose
│   ├── controllers/
│   │   ├── adminController.js    # Global application review, status updates, stats, candidates
│   │   ├── applicationController.js # Candidate CRUD handlers for applications
│   │   ├── authController.js     # Register, login, me, profile update, password change
│   │   ├── notificationController.js # Candidate notification fetch, unread count, read markers
│   │   └── uploadController.js   # Local static disk & Cloudinary file upload handler
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT token verification (protect) & Admin role check (adminOnly)
│   ├── models/
│   │   ├── Application.js        # Mongoose schema for applications, checklist, & timeline
│   │   ├── Notification.js       # Mongoose schema for status & document notifications
│   │   └── User.js               # Mongoose schema for candidate & admin accounts
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin endpoints (protected, adminOnly)
│   │   ├── applicationRoutes.js  # /api/applications endpoints (protected)
│   │   ├── authRoutes.js         # /api/auth endpoints (public & protected)
│   │   ├── notificationRoutes.js # /api/notifications endpoints (protected)
│   │   └── uploadRoutes.js       # /api/upload endpoint (protected, Multer file filter)
│   ├── uploads/                  # Static disk storage for uploaded resumes and offer letters
│   ├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── make-admin.js             # Utility script to promote any user to admin role
│   ├── seed.js                   # Seeding script for Indian candidate demo data & resumes
│   └── server.js                 # Express server initialization, CORS, static routes & error handlers
└── frontend/
    ├── public/
    │   └── vite.svg               # Application favicon asset
    ├── src/
    │   ├── assets/                # Static image assets
    │   ├── components/
    │   │   ├── AdminNavbar.jsx    # Top navigation bar for administrative views
    │   │   ├── AdminRoute.jsx     # Route guard restricting access to authenticated admin users
    │   │   ├── ApplicationNotes.jsx# Rich notes editor component with auto-save & timestamp
    │   │   ├── AppNavbar.jsx      # Top navigation bar for candidate views with notification bell
    │   │   ├── ChangePasswordModal.jsx # Reusable modal for account password changes
    │   │   ├── ConfirmModal.jsx   # Deletion & action confirmation modal dialog
    │   │   ├── DashboardCard.jsx  # Metric stat card component
    │   │   ├── EmptyState.jsx     # Reusable empty data state component with CTA
    │   │   ├── FileUpload.jsx     # Drag-and-drop file upload component for PDF/DOCX files
    │   │   ├── Footer.jsx         # Global footer component
    │   │   ├── InterviewTimeline.jsx # Visual stage progression step component
    │   │   ├── LoadingSpinner.jsx # Central loading indicator
    │   │   ├── LocationAutocomplete.jsx # Autocomplete selector with pre-populated Indian tech hubs
    │   │   ├── Navbar.jsx         # Public landing page navigation bar
    │   │   ├── NotificationBell.jsx # Dropdown popover showing unread notifications & read triggers
    │   │   ├── ProtectedRoute.jsx # Route guard restricting access to authenticated candidates
    │   │   ├── SkeletonLoader.jsx # Skeleton layout loader components for dashboard & tables
    │   │   ├── StatusBadge.jsx    # Color-coded badge component for application statuses
    │   │   ├── Toast.jsx          # Custom toast notification styling
    │   │   └── UserAvatar.jsx     # User avatar component displaying user image or initials
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Global state for user token, rehydration, login, logout, profile
    │   │   └── ThemeContext.jsx   # Light/Dark mode state management & localStorage persistence
    │   ├── layouts/
    │   │   └── PublicLayout.jsx   # Shell layout for public pages (Landing, Login, Register)
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminApplicationDetailPage.jsx # Detailed app review, timeline sync, offer upload
    │   │   │   ├── AdminApplicationsPage.jsx     # Global search, filter, sort & batch review table
    │   │   │   ├── AdminCandidateDetailPage.jsx  # Candidate profile view & candidate apps
    │   │   │   ├── AdminCandidatesPage.jsx       # Candidate directory list with app counts
    │   │   │   └── AdminDashboardPage.jsx        # High-level recruiter analytics & metrics
    │   │   ├── AddApplicationPage.jsx # Candidate form to create new job application
    │   │   ├── ApplicationDetailPage.jsx # Detailed view with notes, checklist, resume & offer letter
    │   │   ├── ApplicationsPage.jsx    # Candidate applications table with search, filter, sort & pagination
    │   │   ├── DashboardPage.jsx       # Candidate overview dashboard with Recharts & quick metrics
    │   │   ├── EditApplicationPage.jsx    # Candidate form to update existing job application
    │   │   ├── LandingPage.jsx        # Public home page with hero section & feature highlights
    │   │   ├── LoginPage.jsx          # User login page with role-based routing
    │   │   ├── NotFoundPage.jsx       # 404 page for unmatched routes
    │   │   ├── ProfilePage.jsx        # Candidate profile manager & password change trigger
    │   │   └── RegisterPage.jsx       # Candidate registration page
    │   ├── services/
    │   │   ├── adminService.js        # Admin API endpoints wrapper
    │   │   ├── api.js                 # Axios instance configuration with JWT interceptors
    │   │   ├── applicationService.js  # Candidate application API endpoints wrapper
    │   │   └── notificationService.js # Notification API endpoints wrapper
    │   ├── utils/
    │   │   └── fileUtils.js           # Helper to convert relative upload paths to full backend URLs
    │   ├── App.css                    # App-specific custom CSS utility rules
    │   ├── App.jsx                    # Root router configuration & route protection mapping
    │   ├── index.css                  # Tailwind CSS imports & CSS root variables for themes
    │   └── main.jsx                   # React entry point mounting App inside ThemeProvider
    ├── package.json                   # Frontend dependencies & scripts
    └── vite.config.js                 # Vite build & plugin configuration
```

---

# 7. Application Architecture

```
+-----------------------------------------------------------------------+
|                           Browser Client                              |
|   (Candidate Views / Admin Views built with React.js & Tailwind CSS)  |
+----------------------------------+------------------------------------+
                                   |
                          HTTP / HTTPS (REST API)
                          Bearer JWT Authorization
                                   |
+----------------------------------v------------------------------------+
|                         Express.js Backend                            |
|                                                                       |
|  [CORS Middleware] -> [JSON Parser] -> [Static /uploads Serving]     |
|                                                                       |
|  [Auth Middleware: protect / adminOnly]                               |
|                                                                       |
|  [Routes]                                                             |
|   ├── /api/auth          (authController.js)                          |
|   ├── /api/applications  (applicationController.js)                   |
|   ├── /api/admin         (adminController.js)                         |
|   ├── /api/notifications (notificationController.js)                  |
|   └── /api/upload        (uploadController.js + Multer)               |
+----------------------------------+------------------------------------+
                                   |
                         Mongoose ODM Drivers
                                   |
+----------------------------------v------------------------------------+
|                         MongoDB Database                              |
|                                                                       |
|   Collections: users | applications | notifications                   |
+-----------------------------------------------------------------------+
```

### Request Lifecycle Flow:
1. **Client Action**: User submits a form or performs an action in the React UI (e.g. Admin changes status to `Offer`).
2. **API Request**: Axios sends a request (`PATCH /api/admin/applications/:id/status`) with token header `Authorization: Bearer <jwt_token>`.
3. **Authentication Guard**: `authMiddleware.protect` extracts and verifies the JWT, attaching `req.user = { id, role }`.
4. **Authorization Guard**: `authMiddleware.adminOnly` verifies `req.user.role === 'admin'`.
5. **Controller Logic**: `adminController.updateStatus`:
   - Fetches the application document from MongoDB via Mongoose.
   - Synchronizes the `timeline` array (marking target stage as completed and setting pending stages).
   - Updates document fields (`status`, `offerLetterUrl`, `offerLetterFilename`).
   - Saves the updated application.
   - Automatically creates a new document in the `notifications` collection targeted to `existing.user._id`.
6. **API Response**: Returns JSON payload `{ success: true, application }`.
7. **Client Re-render**: React updates local state, triggers a toast notification, and updates the timeline UI.

---

# 8. Authentication and Authorization

### Implementation Details:
- **Registration**: Endpoint `POST /api/auth/register` accepts `name`, `email`, and `password`. Emails are trimmed, lowercased, and validated against regex. Plaintext passwords must be $\ge 6$ characters and are automatically hashed using `bcryptjs` in Mongoose's `pre('save')` hook.
- **Login**: Endpoint `POST /api/auth/login` uses `.select('+password')` to fetch the hashed password and verifies it using `user.matchPassword(enteredPassword)`. Upon success, it issues a JWT signed with `JWT_SECRET` expiring in 7 days.
- **Token Format**: JWT payload contains `{ id: user._id, role: user.role }`.
- **Session Persistence**: Token is stored in `localStorage` (`cs_token`) and restored on application mount via `GET /api/auth/me`.
- **Session Expiry & Invalidation**: If any API request returns HTTP status `401 Unauthorized`, Axios interceptor automatically removes `cs_token` from `localStorage`, clearing user state.
- **Protected Routes**:
  - `ProtectedRoute.jsx`: Restricts candidate routes (`/dashboard`, `/applications`, `/profile`, etc.). Redirects unauthenticated users to `/login`.
  - `AdminRoute.jsx`: Restricts admin routes (`/admin/*`). Redirects non-admin users to `/dashboard` or `/login`.
- **Password Change**: Endpoint `PUT /api/auth/change-password` requires verification of `currentPassword`, matches `newPassword` against `confirmPassword`, and enforces length rules before re-hashing.

---

# 9. Candidate/User Features

## 9.1 Registration & Authentication
- **Purpose**: Allow new candidates to create an account and access the tracking system.
- **User Flow**: User navigates to `/register`, enters name, email, password, and submits. On success, receives JWT and navigates directly to `/dashboard`.
- **Main UI Elements**: Styled form cards, show/hide password toggle buttons, input validation messages, link to `/login`.
- **Data Stored**: Name, email, hashed password, role (`candidate`).
- **Backend/API Behaviour**: `POST /api/auth/register` validates input, checks for duplicate email, hashes password, saves User document, generates JWT.
- **Validation Rules**: Mandatory fields, valid email regex (`/^\S+@\S+\.\S+$/`), minimum password length of 6 characters.

## 9.2 Login & Session Management
- **Purpose**: Authenticate existing candidates and administrators.
- **User Flow**: User enters credentials at `/login`. System redirects candidates to `/dashboard` and admins to `/admin/dashboard`.
- **Main UI Elements**: Email/password inputs, role badge indicators, error alert box.
- **Backend/API Behaviour**: `POST /api/auth/login` verifies user existence and bcrypt password match.

## 9.3 Candidate Dashboard & Analytics
- **Purpose**: Provide a high-level overview of all job applications and recent activities.
- **User Flow**: Candidate lands on `/dashboard` after login. Displays 8 metric stat cards, Recharts status distribution charts, upcoming interviews, and recent applications.
- **Main UI Elements**: Stat cards (`Total`, `Applied`, `Under Review`, `Shortlisted`, `OA`, `Interview`, `Offer`, `Rejected`), Donut & Bar charts, Recent Applications list with quick action buttons.
- **Data Stored**: Read-only aggregate view computed from user's `Application` documents.
- **Backend/API Behaviour**: `GET /api/applications` fetches all user-isolated applications.

## 9.4 Application Creation (`/applications/new`)
- **Purpose**: Add a new job application to the system.
- **User Flow**: User clicks "+ Add Application", fills out company details, role, status, application date, location, job type, salary, job link, notes, and optional resume file.
- **Main UI Elements**: Location autocomplete dropdown (featuring pre-configured Indian tech hubs: Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, GIFT City, etc.), FileUpload drag-and-drop zone, job type selector pills.
- **Data Stored**: `Application` document with default 6-stage timeline array.
- **Validation Rules**: Company Name and Role are required. Applied date cannot be set in the future.

## 9.5 Application Details & Preparation Workbench (`/applications/:id`)
- **Purpose**: Serve as a detailed workspace for managing an application.
- **User Flow**: Candidate views application details, timeline status, interview schedule, uploads/views resume, downloads admin offer letter, updates preparation checklist, and writes rich notes.
- **Main UI Elements**: `InterviewTimeline` stage stepper, Preparation checklist with percentage completion progress bar, `ApplicationNotes` text area with character counter and auto-save indicator, Attached Documents box.
- **Backend/API Behaviour**: `GET /api/applications/:id` retrieves application. `PUT /api/applications/:id` saves updated notes, checklist toggles, or resume links.

## 9.6 Application Management Table (`/applications`)
- **Purpose**: Browse, search, filter, sort, and paginate through all personal applications.
- **User Flow**: User searches by company or role, filters by status dropdown (`All`, `Applied`, `Under Review`, `Shortlisted`, `OA`, `Interview`, `Offer`, `Rejected`), sorts by date or company name, and navigates pages (8 applications per page).
- **Main UI Elements**: Search bar, status dropdown, sort selector, responsive data table, delete confirmation modal, pagination control buttons.

## 9.7 Resume Upload & Management
- **Purpose**: Allow candidates to upload, view, download, or replace their candidate-specific resume.
- **User Flow**: Candidate uploads file via `FileUpload.jsx`. File is submitted to `POST /api/upload?type=resume`. Upon return of file URL, candidate updates application.
- **Main UI Elements**: Drag-and-drop upload container, file format label, view/download action links.
- **Validation Rules**: Strictly allowed extensions: `.pdf`, `.docx`. Maximum file size: 10MB.

## 9.8 Candidate Profile & Settings (`/profile`)
- **Purpose**: View and update candidate profile metadata and initiate password updates.
- **User Flow**: Candidate updates university, phone, LinkedIn, GitHub, portfolio link, avatar URL, or clicks "Change Password" to launch modal.
- **Backend/API Behaviour**: `PUT /api/auth/profile` updates user fields. `PUT /api/auth/change-password` verifies current password and saves new bcrypt hash.

## 9.9 Notifications Dropdown & Read State
- **Purpose**: Keep candidates informed of status changes and offer letter uploads.
- **User Flow**: Candidate clicks bell icon in navbar. Sees unread badge count, list of notifications with timestamps, and actions to "Mark as Read" or "Mark All as Read".
- **Backend/API Behaviour**: `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`.

## 9.10 Light / Dark Mode Toggle
- **Purpose**: Provide visual accessibility and theme choice.
- **User Flow**: User clicks theme toggle icon in top navbar. Page seamlessly transitions between dark and light color schemes.
- **UI Mechanism**: `ThemeContext` adds or removes `.dark` class from `document.documentElement` and stores choice in `localStorage` (`cs_theme`).

---

# 10. Application Data Model

### Mongoose Schema: `Application` (`backend/models/Application.js`)

| Field | Data Type | Required | Default Value | Purpose / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | N/A | Reference to `User` model; indexed for user-isolated queries |
| `companyName` | `String` | Yes | N/A | Name of employer; trimmed |
| `role` | `String` | Yes | N/A | Job position title; trimmed |
| `status` | `String` | Yes | `'Applied'` | Enum: `['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected']`; indexed |
| `applicationDate` | `Date` | No | `Date.now` | Date when applied; cannot be in the future |
| `interviewDate` | `Date` | No | `null` | Scheduled interview date & time |
| `location` | `String` | No | `''` | Job location (e.g. `'Bengaluru, Karnataka'`) |
| `jobType` | `String` | No | `''` | Enum: `['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid', 'Onsite', '']` |
| `salary` | `String` | No | `''` | Compensation / stipend details |
| `jobLink` | `String` | No | `''` | External job post URL |
| `notes` | `String` | No | `''` | Personal notes / interview log text |
| `notesLastEditedAt`| `Date` | No | `Date.now` | Timestamp of last note edit |
| `resumeUrl` | `String` | No | `''` | Path/URL to candidate resume file |
| `resumeFilename` | `String` | No | `''` | Original file name of uploaded resume |
| `offerLetterUrl` | `String` | No | `''` | Path/URL to admin-uploaded offer letter |
| `offerLetterFilename`| `String` | No | `''` | Original file name of uploaded offer letter |
| `checklist` | `Object` | No | `{...}` | Preparation checklist booleans (`resumeSubmitted`, `aptitudePrep`, `dsaRevision`, `hrPrep`, `technicalPrep`) |
| `timeline` | `Array` | No | `[...]` | Sub-document array of timeline stage objects |
| `createdAt` | `Date` | Auto | Timestamp | Schema timestamp |
| `updatedAt` | `Date` | Auto | Timestamp | Schema timestamp |

### Sub-document Schema: `timelineStageSchema`
- `stage` (`String`): Name of stage (e.g. `'Shortlisted'`).
- `date` (`Date`): Completion date or scheduled date.
- `notes` (`String`): Stage-specific notes.
- `completed` (`Boolean`): Stage completion status.

---

# 11. Recruitment Status Workflow

CareerSprint defines a strict 7-stage recruitment workflow:

$$\text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Shortlisted} \longrightarrow \text{OA} \longrightarrow \text{Interview} \longrightarrow \text{Offer}$$
$$\Big\downarrow$$
$$\text{Rejected}$$

### Logical Rules & Timeline Synchronization:
1. **Source of Truth**: The administrator (or placement officer) is the primary authority for recruitment status transitions.
2. **Sequential Progress Sync**: When an application status is moved to a target stage (e.g., `Shortlisted`), all preceding stages (`Applied`, `Under Review`, `Shortlisted`) are automatically marked as `completed: true`.
3. **Pending Future Stages**: Future stages beyond the current status (e.g., `OA`, `Interview`, `Offer`) remain `completed: false` with `date: null`. They are **not** automatically marked as completed.
4. **Rejection Handling**: Setting status to `Rejected` marks the `Rejected` stage as `completed: true` with a timestamp without incorrectly completing future technical rounds.
5. **Reversal / Re-activation**: If an application status is moved backwards from `Rejected` to an active stage (e.g. `Interview`), the `Rejected` stage completion flag is cleared.
6. **Offer Letter Restrictions**: Admin can attach an offer letter file **only** when the status is set to `Offer`. If the status is moved away from `Offer`, offer letter references are cleared.

---

# 12. Timeline and Interview Management

- **Milestone Tracking**: Every application maintains a `timeline` array storing stage completion states and dates.
- **Interview Scheduling**: When an interview date is set by either candidate or admin, `interviewDate` is populated. The `Interview` stage in the timeline captures this timestamp.
- **Calendar & Dashboard Integration**: Applications with upcoming interview dates ($\ge \text{today}$) are automatically grouped into the "Upcoming Interviews" section on both candidate and admin dashboards.

---

# 13. Preparation Checklist

Each application contains an embedded 5-item preparation checklist object:
1. `resumeSubmitted`: Candidate submitted tailored resume.
2. `aptitudePrep`: Completed quantitative / logic aptitude practice.
3. `dsaRevision`: Revised Data Structures & Algorithms concepts.
4. `hrPrep`: Prepared behavioral & HR interview responses.
5. `technicalPrep`: Completed system design / technical domain revision.

### Calculation & Persistence:
- **Progress Percentage**: Calculated dynamically as:
  $$\text{Progress \%} = \left( \frac{\text{Count of Completed Items}}{5} \right) \times 100$$
- **Dashboard Aggregation**: The Candidate Dashboard computes the average checklist completion percentage across all user applications.

---

# 14. Document Management

CareerSprint enforces strict role division regarding document handling:

```
[Candidate]  ---> Uploads / Updates  ---> Resume (PDF/DOCX)
[Admin]      ---> Uploads / Attaches ---> Offer Letter (PDF/DOCX)
[Candidate]  ---> Views / Downloads  ---> Admin-provided Offer Letter
```

### Technical Specs:
- **Storage Location**: Files are saved in `backend/uploads/` with unique timestamp prefixes (e.g. `file-1790943075777-575515091.pdf`) or saved to Cloudinary if configured.
- **Allowed Types**:
  - Resumes: Strictly `.pdf`, `.docx`.
  - General Documents / Offer Letters: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`.
- **Size Limit**: Enforced 10MB limit via Multer middleware.
- **File URLs**: Served statically via Express at `http://localhost:5000/uploads/<filename>`. Utility `fileUtils.getFileUrl()` transforms relative paths to absolute backend URLs.

---

# 15. Notification System

### Schema: `Notification` (`backend/models/Notification.js`)
- Stores `userId`, `applicationId`, `type` (`'status_update'` or `'document_update'`), `title`, `message`, `company`, `role`, `status`, and `isRead` boolean.

### Trigger Triggers:
1. **Status Changes**: When Admin updates an application status via `PATCH /api/admin/applications/:id/status`, a candidate notification is generated (e.g., *"Good news! You have been shortlisted for Software Engineering Intern at Google."*).
2. **Offer Letter Attachment**: When Admin uploads an offer letter, a notification titled *"Offer Letter Attached! 🎉"* is generated.
3. **No Duplicate Spam**: Notifications are created **only** when the status value actually changes (`oldStatus !== newStatus`).

---

# 16. Activity Feed

The candidate and admin dashboards derive an activity feed by sorting notifications and recent application updates by `createdAt: -1`. This displays key events such as:
- Application submissions
- Recruitment status changes
- Upcoming interview reminders
- Offer letter additions

---

# 17. Administrator Portal

## 17.1 Admin Dashboard (`/admin/dashboard`)
- **Metrics**: Total Applications, Total Candidates, Status Breakdown Counts, Recent Submissions (Last 7 days), Upcoming Interviews (Next 14 days).
- **Visual Charts**: Recharts bar chart showing status breakdown across all candidate applications.
- **Quick Links**: Direct navigation to Candidate Directory and Application Master Table.

## 17.2 Admin Master Applications Page (`/admin/applications`)
- **Features**: Master list of all candidate applications in the system.
- **Controls**: Live search (matches company name, role, candidate name, candidate email), status filter dropdown, job type filter, sorting, and pagination.
- **Actions**: Direct link to inspect or edit application details.

## 17.3 Admin Application Detail Page (`/admin/applications/:id`)
- **Features**: Full inspection of candidate details (name, email, university, phone, LinkedIn, GitHub, portfolio).
- **Status & Timeline Control**: Select new status from dropdown, set interview date, and click "Save Changes". Automatically updates timeline and sends notification.
- **Offer Letter Management**: Upload container allowing admin to attach an official offer letter PDF when status is set to `Offer`.

## 17.4 Admin Candidate Directory (`/admin/candidates`)
- **Features**: Searchable directory of all registered candidate accounts with total application counts, university name, email, and registration date.
- **Candidate Detail Page (`/admin/candidates/:id`)**: Shows candidate's full profile and list of all applications submitted by that specific candidate.

---

# 18. Admin ↔ Candidate Synchronization

The synchronization mechanism relies on a single shared document in MongoDB:

```
    [ Administrator Action ]
               |
  PATCH /api/admin/applications/:id/status
               |
  1. Update Application status & timeline in MongoDB
  2. Create Notification document for candidate
               |
       [ MongoDB Database ]
               |
  1. Candidate Application views automatically fetch updated document
  2. Candidate Notification bell receives unread notification count
```

---

# 19. Search, Filtering and Sorting

### Candidate Side (`/applications`):
- **Search**: Case-insensitive filtering across `companyName`, `role`, and `location`.
- **Status Filter**: Filter by `Applied`, `Under Review`, `Shortlisted`, `OA`, `Interview`, `Offer`, or `Rejected`.
- **Sort Options**: `newest` (createdAt DESC), `oldest` (createdAt ASC), `company` (companyName A-Z).

### Admin Side (`/admin/applications`):
- **Database Search**: Server-side MongoDB regex match on `companyName`, `role`, `location`, plus matching user names/emails via `$in` query.

---

# 20. Dashboard Analytics

### Calculated Metrics:
1. **Status Distribution**: Real MongoDB count of applications grouped by each of the 7 statuses.
2. **Interview Count**: Count of applications where status is `Interview` or `interviewDate` $\ge \text{today}$.
3. **Monthly / Weekly Velocity**: Count of applications submitted within the current calendar month and past 7 days.
4. **Checklist Average**: Mean percentage of preparation checklist tasks completed across all active applications.

---

# 21. UI/UX Design

- **Color Palette**: Modern slate & indigo theme with CSS variables (`--bg`, `--card`, `--text`, `--primary`, `--border`).
- **Status Colors**:
  - `Applied`: Blue (`#3b82f6`)
  - `Under Review`: Sky (`#0284c7`)
  - `Shortlisted`: Indigo (`#6366f1`)
  - `OA`: Purple (`#a855f7`)
  - `Interview`: Amber (`#f59e0b`)
  - `Offer`: Emerald (`#10b981`)
  - `Rejected`: Rose (`#f43f5e`)
- **Components**: Rounded cards (`rounded-xl`), crisp Lucide icons, smooth hover states, modal popups with backdrop blur.

---

# 22. Responsive Design

- **Mobile Navigation**: `AppNavbar` and `AdminNavbar` feature responsive hamburger menus for small screens ($\le 768\text{px}$).
- **Table Adaptability**: Tables use horizontal overflow containers (`overflow-x-auto`) and hide secondary columns on mobile devices.
- **Touch-Friendly Controls**: Buttons enforce minimum height guidelines (`min-h-[40px]`) for mobile touch targets.

---

# 23. Validation and Error Handling

- **Form Validation**: Strict client-side and server-side checks for required fields, valid email format, and future dates.
- **HTTP Error Codes**:
  - `400 Bad Request`: Missing fields, invalid format, future application date.
  - `401 Unauthorized`: Missing, invalid, or expired JWT.
  - `403 Forbidden`: Non-admin user attempting to access `/api/admin/*`.
  - `404 Not Found`: Invalid MongoDB ObjectId or resource missing.
  - `409 Conflict`: Registration attempt with existing email.
  - `500 Internal Server Error`: Database connection errors or unexpected exceptions.
- **UI Error Feedback**: Toast alerts display human-readable error messages returned by the API.

---

# 24. Database Design — MongoDB

### Collections Summary:

1. **`users` Collection**:
   - `_id`: `ObjectId`
   - `name`: `String` (required)
   - `email`: `String` (required, unique, lowercase)
   - `password`: `String` (required, select: false)
   - `university`, `phone`, `linkedin`, `github`, `portfolio`, `avatarUrl`: `String`
   - `role`: `String` (`'candidate'` | `'admin'`)
   - `createdAt`, `updatedAt`: `Date`

2. **`applications` Collection**:
   - `_id`: `ObjectId`
   - `user`: `ObjectId` (ref: `User`, required, indexed)
   - `companyName`, `role`: `String` (required)
   - `status`: `String` (enum, default `'Applied'`, indexed)
   - `applicationDate`, `interviewDate`: `Date`
   - `location`, `jobType`, `salary`, `jobLink`, `notes`: `String`
   - `resumeUrl`, `resumeFilename`, `offerLetterUrl`, `offerLetterFilename`: `String`
   - `checklist`: Embedded object
   - `timeline`: Embedded sub-document array
   - `createdAt`, `updatedAt`: `Date`
   - **Indexes**: Compound `{ user: 1, createdAt: -1 }`, `{ user: 1, status: 1 }`

3. **`notifications` Collection**:
   - `_id`: `ObjectId`
   - `userId`: `ObjectId` (ref: `User`, required, indexed)
   - `applicationId`: `ObjectId` (ref: `Application`, required)
   - `type`, `title`, `message`, `company`, `role`, `status`: `String`
   - `isRead`: `Boolean` (default `false`, indexed)
   - `createdAt`, `updatedAt`: `Date`
   - **Indexes**: Compound `{ userId: 1, createdAt: -1 }`, `{ userId: 1, isRead: 1 }`

---

# 25. API Documentation

| Method | Endpoint | Auth Required | Role Allowed | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Public | Register new candidate account |
| `POST` | `/api/auth/login` | No | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Yes | Any | Get current logged-in user profile |
| `PUT` | `/api/auth/profile` | Yes | Any | Update user profile information |
| `PUT` | `/api/auth/change-password` | Yes | Any | Change user password |
| `GET` | `/api/applications` | Yes | Candidate | Get all applications for logged-in user |
| `POST` | `/api/applications` | Yes | Candidate | Create a new application |
| `GET` | `/api/applications/:id` | Yes | Candidate | Get details of a specific application |
| `PUT` | `/api/applications/:id` | Yes | Candidate | Update an application |
| `DELETE`| `/api/applications/:id` | Yes | Candidate | Delete an application |
| `POST` | `/api/upload` | Yes | Any | Upload file (resume or document) |
| `GET` | `/api/notifications` | Yes | Candidate | Fetch candidate notifications |
| `GET` | `/api/notifications/unread-count`| Yes | Candidate | Get count of unread notifications |
| `PATCH`| `/api/notifications/:id/read` | Yes | Candidate | Mark single notification as read |
| `PATCH`| `/api/notifications/read-all` | Yes | Candidate | Mark all notifications as read |
| `GET` | `/api/admin/stats` | Yes | Admin | Get global system statistics |
| `GET` | `/api/admin/applications` | Yes | Admin | Get all candidate applications (with pagination/filters) |
| `GET` | `/api/admin/applications/:id` | Yes | Admin | Get specific application details with user profile |
| `PATCH`| `/api/admin/applications/:id/status` | Yes | Admin | Update status, interview date, or offer letter |
| `GET` | `/api/admin/candidates` | Yes | Admin | Get list of candidate accounts & application counts |
| `GET` | `/api/admin/candidates/:id/applications` | Yes | Admin | Get profile and applications of specific candidate |

---

# 26. Backend Architecture

- **Modular Directory Structure**: Controllers handle business logic, models define schemas, routes map endpoints, and middleware handles security/uploads.
- **Error Middleware**: Centralized error handler catches unhandled exceptions and formats consistent JSON error responses.
- **Database Connection**: Mongoose connects asynchronously to MongoDB using `process.env.MONGO_URI` with reconnection resilience.

---

# 27. Frontend Architecture

- **Context API State**: Global state managed via `AuthContext` (token, user, authentication functions) and `ThemeContext` (dark/light theme).
- **Service Layer Abstraction**: Component code delegates API calls to modular service files (`applicationService.js`, `adminService.js`, `notificationService.js`).
- **Reusable Component Pattern**: Common UI blocks (`StatusBadge`, `DashboardCard`, `ConfirmModal`, `EmptyState`, `FileUpload`, `LocationAutocomplete`) promote consistent layout and reduce code duplication.

---

# 28. Security

- **Password Hashing**: Bcrypt with 10 salt rounds ensures plaintext passwords are never stored in the database.
- **JWT Authorization**: All private REST endpoints verify signed JSON Web Tokens.
- **Role Isolation**: Middleware (`adminOnly`) explicitly guards administrative endpoints against non-admin token access.
- **SQL/NoSQL Injection Mitigation**: Mongoose schema sanitization protects against malformed payload injections.
- **File Upload Security**: Extension validation restricts uploaded files to safe document types (PDF/DOCX).

---

# 29. Testing and Debugging Performed

1. **Authentication Testing**: Verified candidate registration, admin login, password verification, invalid password rejection, and password change workflow.
2. **CRUD Operations Testing**: Verified application creation, retrieval, updates, and deletion.
3. **Timeline & Status Sync Testing**: Verified that updating status from `Under Review` to `Shortlisted` marks `Shortlisted` as completed while leaving `OA`, `Interview`, and `Offer` pending.
4. **Document Access Testing**: Confirmed candidate resumes are served independently and admin-uploaded offer letters are accessible to target candidates.
5. **Notification Testing**: Verified notifications are created on status transitions and unread counts decrease upon marking as read.
6. **Responsive Layout Testing**: Tested layout rendering across mobile, tablet, and desktop viewports.

---

# 30. Deployment / Running the Project

### Environment Variables (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careersprint
JWT_SECRET=your_jwt_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
```

### Development Server Startup:
```bash
# 1. Start Backend Express Server (Port 5000)
cd backend
npm install
npm run dev

# 2. Start Frontend Vite Server (Port 5173)
cd frontend
npm install
npm run dev
```

### Database Seeding:
```bash
cd backend
node seed.js
```

---

# 31. Known Limitations

- **Email Services**: Notifications are currently delivered within the web application interface; email notification dispatch is not configured.
- **Third-Party Calendar Sync**: Interview dates are tracked inside the platform calendar widget but do not automatically sync to external Google/Outlook calendars.

---

# 32. Future Scope

- **Automated Email Reminders**: Send automated email alerts 24 hours prior to scheduled interviews.
- **Calendar Export (.ics)**: Allow candidates to download iCal events for scheduled interviews.
- **AI Resume Matching**: Integrate AI services to provide candidate resume keyword suggestions based on job descriptions.
- **Company Interview Reviews**: Enable candidates to share interview questions and company reviews.

---

# 33. Final Feature Checklist

### Candidate Features
- [x] Account Registration & Authentication
- [x] Personal Dashboard with Recharts Analytics
- [x] Application Creation with Location Autocomplete
- [x] Application Editing & Deletion
- [x] Status Tracking across 7 Stages
- [x] Timeline Stepper Visualization
- [x] Preparation Checklist with Completion Bar
- [x] Notes Editor with Auto-save
- [x] Candidate Resume Upload & Replacement (PDF/DOCX)
- [x] Candidate Resume View & Download
- [x] Admin Offer Letter View & Download
- [x] Real-time In-App Notification Bell
- [x] Candidate Profile & Password Management
- [x] Light / Dark Theme Switching

### Administrator Features
- [x] Admin Dashboard with System-wide Analytics
- [x] Master Applications Directory
- [x] Global Application Search, Filter & Sort
- [x] Candidate Directory with Application Counts
- [x] Candidate Profile Inspection
- [x] Status Update & Automated Timeline Sync
- [x] Interview Date Scheduling
- [x] Offer Letter Upload & Attachment

### Backend & Database Features
- [x] Express REST API Structure
- [x] JWT Authentication & Middleware Guards
- [x] Bcrypt Password Hashing
- [x] Mongoose Schemas & Indexing
- [x] Multer Multipart File Upload Handling
- [x] Automatic Notification Generation
- [x] Seed Script with Realistic Indian Candidate Data

---

# 34. Development Notes

- **Admin Status Truth**: Admin status updates trigger automated timeline synchronization, ensuring timeline stages stay aligned with official recruitment status.
- **Document Association**: Candidate resumes are linked directly to `Application` schema fields (`resumeUrl`, `resumeFilename`), guaranteeing each candidate view opens their specific uploaded document.
- **Shared Data Layer**: Candidate and Admin views share the same underlying MongoDB `Application` model, ensuring immediate consistency across both portals.

---

# 35. Project Conclusion

**CareerSprint** is a robust, full-stack recruitment tracking platform. By combining user-friendly candidate tools with administrative oversight, automated timeline synchronization, document management, and real-time notifications, CareerSprint solves the real-world challenge of job application tracking. The codebase demonstrates clean architectural practices across the MERN stack, delivering a production-ready application suitable for both academic evaluation and practical deployment.

---

# CareerSprint — Final Project Snapshot

- **Project Type**: Full-Stack Web Application (MERN Stack)
- **Frontend**: React.js 18, React Router 7, Tailwind CSS, Lucide React, Recharts, Axios
- **Backend**: Node.js, Express.js, JSONWebToken, BcryptJS, Multer
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with localStorage persistence
- **Roles**: Candidate (`candidate`), Administrator (`admin`)
- **Core Modules**: Candidate Dashboard, Master Application Workbench, Preparation Checklist, Document Management, Notification System, Admin Portal, Search & Filter Engine
- **Unique Features**: Bi-directional timeline synchronization, role-restricted document workflows, live location autocompletion, responsive theme switcher
- **Current Status**: **Stable & Fully Implemented**
- **Future Scope**: Email notification dispatches, iCal calendar exports, AI resume keyword matching
