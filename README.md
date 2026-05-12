# TaskFlow — Full Stack Task Manager

A full-stack task management application built with **React**, **Node.js/Express**, and **MongoDB**, featuring complete JWT-based authentication and a RESTful API.

> Built to demonstrate full-stack skills: REST API design, JWT auth flows, protected routes, and React state management.

---

## Features

- **JWT Authentication** — register, login, token-based session, auto-logout on expiry
- **Protected Routes** — React Router guards, backend middleware on every task endpoint
- **Full CRUD** — create, read, update, and delete tasks
- **Kanban Board** — tasks organized by status (To Do / In Progress / Done)
- **Priority & Filtering** — filter tasks by priority level
- **Input Validation** — server-side with `express-validator`, client-side with React
- **Pagination** — query-parameter based pagination on the tasks endpoint

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Vite |
| Backend | Node.js, Express 4, express-validator |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Database | MongoDB, Mongoose ODM |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # Register, login, getMe
│   │   │   └── task.controller.js # Full CRUD for tasks
│   │   ├── middleware/
│   │   │   └── auth.middleware.js # JWT verify — protect()
│   │   ├── models/
│   │   │   ├── User.js            # User schema + bcrypt hooks
│   │   │   └── Task.js            # Task schema with user ref
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/auth/*
│   │   │   └── task.routes.js     # /api/tasks/* (all protected)
│   │   └── index.js               # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js           # Axios instance + JWT interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── components/
    │   │   └── ProtectedRoute.jsx # Route guard component
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── DashboardPage.jsx  # Kanban board + task CRUD
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and a strong JWT_SECRET
npm run dev
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API Reference

### Auth Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Task Endpoints

All task routes require `Authorization: Bearer <token>` header.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | Get all tasks (supports `?status=`, `?priority=`, `?page=`, `?limit=`) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example — Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Jane", "email": "jane@example.com" }
}
```

### Example — Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Build portfolio project","priority":"high","status":"in-progress"}'
```

---

## Key Implementation Details

### JWT Flow
1. User registers or logs in → server signs a JWT with `userId` as payload
2. Frontend stores token in `localStorage`, Axios interceptor attaches it to every request header
3. Express `protect` middleware verifies the token on every `/api/tasks/*` route
4. If token is invalid or expired, returns `401` → Axios interceptor auto-redirects to login

### Password Security
- Passwords are hashed using `bcryptjs` with 12 salt rounds via a Mongoose `pre-save` hook
- The `password` field is excluded from all queries by default (`select: false`)
- Comparison happens via a model instance method `user.comparePassword()`

### Data Ownership
- Every task stores a `user` reference (MongoDB ObjectId)
- All task queries filter by `{ user: req.user._id }` — users can only see and modify their own tasks

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## License

MIT
