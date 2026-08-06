# TaskFlow AI — Smart Task & Reminder App

A full-stack intelligent task management application with AI-powered features, built with React, Node.js, Express, and MongoDB.

---

## 🏗 Architecture (Repository Pattern / MVC)

```
smart-task-app/
├── backend/                        # Node.js + Express + MongoDB
│   ├── config/db.js                # MongoDB connection
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # User model (bcrypt hashing)
│   │   └── Task.js                 # Task model (all fields + indexes)
│   ├── repositories/               # Data Access Layer
│   │   ├── userRepository.js       # User CRUD operations
│   │   └── taskRepository.js       # Task CRUD + search/filter/stats
│   ├── services/                   # Business Logic Layer
│   │   ├── authService.js          # Authentication logic
│   │   ├── taskService.js          # Task business logic
│   │   ├── aiService.js            # Gemini AI integration
│   │   ├── emailService.js         # Nodemailer email sender
│   │   └── reminderService.js      # Cron-based reminders
│   ├── middleware/                  # Cross-cutting concerns
│   │   ├── auth.js                 # JWT verification
│   │   ├── validate.js             # Request validation
│   │   └── errorHandler.js         # Global error handler
│   ├── controllers/                # HTTP Request Handlers
│   │   ├── authController.js       # Auth endpoints
│   │   ├── taskController.js       # Task endpoints
│   │   └── aiController.js         # AI endpoints
│   ├── routes/                     # Route Definitions
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── aiRoutes.js
│   ├── index.js                    # Server entry point
│   └── .env.example                # Environment template
│
├── frontend/                       # React + Vite
│   └── src/
│       ├── context/AuthContext.jsx  # JWT auth state
│       ├── utils/api.js            # Axios client
│       ├── components/
│       │   ├── Layout/             # Sidebar + Layout CSS
│       │   └── TaskForm.jsx        # Create/Edit task modal
│       └── pages/
│           ├── Login.jsx           # Login page
│           ├── Signup.jsx          # Registration page
│           ├── ForgotPassword.jsx  # Password reset
│           ├── Dashboard.jsx       # Stats + Charts + AI quick-add
│           └── Tasks.jsx           # Task CRUD + Search/Filter/Sort
│
└── mobile/                         # React Native (Expo) — coming soon
```

### Tech Stack

| Layer      | Technology                                            |
|------------|-------------------------------------------------------|
| Backend    | Node.js, Express, MongoDB (Mongoose), JWT             |
| Frontend   | React 18, Vite, Recharts, React Icons, date-fns       |
| Database   | MongoDB Atlas (cloud)                                 |
| AI         | Google Gemini API (gemini-1.5-flash)                  |
| Email      | Nodemailer (Gmail SMTP)                               |
| Scheduler  | node-cron (reminder check every minute)               |
| Styling    | Vanilla CSS with custom properties, glassmorphism     |
| Auth       | bcrypt + JSON Web Tokens                              |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** cluster (free tier works)
- **Gemini API key** (optional, for AI features)

### 1. Clone & Install

```bash
git clone <repo-url>
cd smart-task-app

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Copy the example env and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster0.xxxxx.mongodb.net/smart-task-app
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key    # Optional
EMAIL_USER=your_email@gmail.com   # Optional
EMAIL_PASS=your_app_password      # Optional
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

---

## 📊 Features

### 🔐 Authentication
- **Signup** — Create account with name, email, password
- **Login** — JWT-based authentication (7-day token expiry)
- **Forgot Password** — Email-based password reset flow
- Beautiful animated auth pages with glassmorphism

### 📋 Dashboard
- **Stats Cards** — Total, Pending, Completed, Overdue tasks (animated)
- **Completion Rate** — Progress bar with percentage
- **Priority Distribution** — Donut chart (Recharts)
- **Category Breakdown** — Horizontal bar chart
- **Completion Trend** — 7-day area chart
- **Upcoming Reminders** — Countdown list
- **Recently Completed** — Latest done tasks
- **AI Quick Add** — Natural language task creation

### ✅ Task Management
- **CRUD** — Create, Read, Update, Delete tasks
- **Fields** — Title, Description, Due Date, Priority, Category, Reminder
- **Grid/List View** — Toggle between card and list layouts
- **Search** — Real-time search across title & description
- **Filters** — Priority, Category, Status (chips-based)
- **Sort** — By date, priority, title, due date (asc/desc)
- **Pagination** — 12 tasks per page
- **Completion Toggle** — One-click mark complete/pending
- **Priority Bar** — Color-coded top border on task cards

### 🤖 AI Features (Gemini)
- **Smart Suggestions** — AI improves title, suggests priority/category
- **Natural Language Input** — "Submit report by Friday 5pm" → auto-fills all fields
- **Fallback Logic** — Keyword-based suggestions when AI is unavailable

### 🔔 Reminders
- **Set Reminder** — Pick date/time when creating task
- **Email Notifications** — Beautiful HTML email templates
- **Cron Check** — Every minute, checks for due reminders
- **Status Tracking** — Marks sent reminders to avoid duplicates

### 📱 Responsive Design
- **Desktop** — Full sidebar + spacious grid
- **Tablet** — Adapted grid, collapsible sidebar
- **Mobile** — Drawer sidebar, single column, touch-friendly

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | `/auth/signup`        | Register new user        | ❌   |
| POST   | `/auth/login`         | Login (returns JWT)      | ❌   |
| POST   | `/auth/forgot-password` | Send reset email       | ❌   |
| POST   | `/auth/reset-password`  | Reset with token       | ❌   |
| GET    | `/auth/me`            | Get current user         | ✅   |

### Tasks
| Method | Endpoint              | Description                          | Auth |
|--------|-----------------------|--------------------------------------|------|
| GET    | `/tasks`              | List tasks (search, filter, sort)    | ✅   |
| POST   | `/tasks`              | Create task                          | ✅   |
| GET    | `/tasks/stats`        | Dashboard statistics                 | ✅   |
| GET    | `/tasks/recent`       | Recent tasks                         | ✅   |
| GET    | `/tasks/:id`          | Get single task                      | ✅   |
| PUT    | `/tasks/:id`          | Update task                          | ✅   |
| DELETE | `/tasks/:id`          | Delete task                          | ✅   |
| PATCH  | `/tasks/:id/complete` | Toggle completion                    | ✅   |

### AI
| Method | Endpoint       | Description                    | Auth |
|--------|----------------|--------------------------------|------|
| POST   | `/ai/suggest`  | Get smart task suggestions     | ✅   |
| POST   | `/ai/parse`    | Parse natural language to task | ✅   |

---

## 🎯 Design Decisions

1. **Repository Pattern** — Clean separation: Models → Repositories → Services → Controllers → Routes. Makes testing and swapping data sources easy.

2. **Vanilla CSS over Tailwind** — Full control over the design system with CSS custom properties. Enables deep glassmorphism and gradient effects without utility class bloat.

3. **Gemini with Fallback** — AI features work with or without API key. Keyword-based fallback ensures the app is fully functional even without AI.

4. **Cron-based Reminders** — Uses `node-cron` to check every minute. Simple, reliable, no external queue needed for this scale.

5. **Dark Theme Default** — Modern look that's easier on the eyes. Full color system with semantic tokens.

---

## 👤 Author

**Subrat Palei** — [github.com/Codewith68](https://github.com/Codewith68)
