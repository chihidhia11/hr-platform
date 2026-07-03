# HR Platform — PFE Project

A full-stack HR Platform that automates and streamlines the recruitment process, from job posting to candidate selection.

**Student:** Mohammed Dhia Chihi  
**Stack:** React JS · Node JS · Express JS · MongoDB Atlas · Python/Flask

---

## Architecture
Three independent services communicating over HTTP — a real microservice pattern.

---
React (port 5173)  →  Express API (port 3000)  →  MongoDB Atlas
↓
Python/Flask AI service (port 5001)

## Features

### Candidate
- Register/Login with JWT authentication
- Browse and search job offers (by title, company, location, skill)
- Apply to jobs with CV text input
- See AI-calculated skill match percentage for each application
- Track application status (pending / accepted / rejected)

### Recruiter
- Post job offers with required skills
- View all applicants per job with AI match scores
- Accept or reject applications with live UI updates

### AI Microservice (Python/Flask)
- Keyword-based skill matching with word-boundary regex
- Negation detection ("I have not worked with Docker" → Docker is missing)
- Returns match percentage, matched skills, and missing skills
- Designed defensively: if the AI service is down, applications still work normally

### Security
- Passwords hashed with bcrypt (never stored in plain text)
- JWT tokens with 1-day expiry
- Role-based middleware: candidates cannot post jobs, recruiters cannot apply
- CORS configured for frontend-backend communication

---

## How to Run

### 1. Backend
```bash
cd backend
node server.js
```

### 2. AI Service
```bash
cd ai-service
source venv/bin/activate
python3 app.py
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173`

---

## Project Structure
hr-platform/
├── backend/
│   ├── controllers/    # Business logic (auth, jobs, applications)
│   ├── models/         # MongoDB schemas (User, Job, Application)
│   ├── routes/         # API endpoint definitions
│   ├── middleware/     # JWT protection + role authorization
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/      # Register, Login, Jobs, PostJob, MyApplicants, MyApplications
│       ├── api/        # Axios configuration
│       └── index.css   # Global design system
└── ai-service/
└── app.py          # Flask CV matching microservice

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Candidate | dhia@test.com | 123456 |
| Recruiter | recruiter@test.com | 123456 |