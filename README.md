# DevTrack – Project Progress Tracker (MERN Stack)

DevTrack is a modern, clean, and fully functional MERN Stack web application designed for tracking project progress, developer phases, and task deliverables with automatic live progress calculations.

---

## 🌟 Key Features

- **Role-Based Workflows**:
  - **Admin**: Create & manage projects, assign/remove developers, and monitor overall and individual developer progress. (Admin cannot create or complete developer tasks).
  - **Developer**: Access assigned projects, create modular phases, add tasks, and complete them with interactive checkboxes. (Strict developer data isolation).
- **Instant Automatic Progress Recalculation**:
  - **Phase Progress**: `(Completed Tasks in Phase / Total Tasks in Phase) * 100`
  - **Developer Progress**: `(Completed Tasks by Developer in Project / Total Tasks by Developer in Project) * 100`
  - **Project Progress**: `(Completed Tasks by all Developers in Project / Total Tasks by all Developers in Project) * 100`
- **1-Click Demo Logins**: Test Admin and Developer workflows immediately from the login screen without manual account registration.
- **Plug-and-Play Database**: Automatic database seeding and seamless fallback with MongoDB Memory Server if local MongoDB is not running.
- **Modern UI / UX**: Tailwind CSS, glassmorphism, responsive sidebar, modal dialogs, status badges, animated progress bars, and toast notifications.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Alex Vance (Lead Admin) | `admin@devtrack.io` | `Admin@123` |
| **Developer** | Rahul Sharma | `rahul@devtrack.io` | `Dev@123` |
| **Developer** | Sarah Jenkins | `sarah@devtrack.io` | `Dev@123` |
| **Developer** | Marcus Chen | `marcus@devtrack.io` | `Dev@123` |

---

## 🛠️ Tech Stack

### Frontend
- **React.js 18** (Vite)
- **Tailwind CSS** (Custom theme, glassmorphism, animations)
- **React Router DOM v6** (Protected and role-based routes)
- **Axios** (JWT interceptors & centralized API client)
- **Lucide Icons**

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (With fallback support & seeder)
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcryptjs** for secure password hashing
- **CORS** & **Morgan** logger

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
*Backend server runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:3000`*

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (`admin` or `developer`)
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update name, email, or password

### Projects
- `GET /api/projects` - Get projects (Admin: all, Developer: assigned only)
- `POST /api/projects` - Create new project (Admin only)
- `GET /api/projects/:id` - Get project details with developer stats breakdown
- `PUT /api/projects/:id` - Update project details (Admin only)
- `DELETE /api/projects/:id` - Delete project, associated phases and tasks (Admin only)
- `POST /api/projects/:id/developers` - Assign developer to project (Admin only)
- `DELETE /api/projects/:id/developers/:developerId` - Remove developer from project (Admin only)
- `GET /api/projects/admin/dashboard-stats` - Get Admin dashboard metrics
- `GET /api/projects/developer/dashboard-stats` - Get Developer dashboard metrics

### Phases
- `GET /api/phases/project/:projectId` - Get phases for project (Developer: own phases; Admin: all)
- `POST /api/phases` - Create a phase (Developer only)
- `PUT /api/phases/:id` - Update phase title (Developer only)
- `DELETE /api/phases/:id` - Delete phase and all tasks inside it (Developer only)

### Tasks
- `GET /api/tasks` - Get tasks with filters (`projectId`, `phaseId`, `completed`)
- `POST /api/tasks` - Create a task in own phase (Developer only)
- `PUT /api/tasks/:id` - Update task title & description (Developer only)
- `PATCH /api/tasks/:id/toggle` - Check / uncheck task completion with immediate progress recalculation
- `DELETE /api/tasks/:id` - Delete task (Developer only)

### Users / Developers
- `GET /api/users/developers` - List all developers with performance stats (Admin only)
- `GET /api/users/:id` - Get single user info
