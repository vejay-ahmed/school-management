# Quick Start Guide

## Local Development

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/school-management.git
cd school-management
```

### 2. Setup Backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret

# Start development server
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install

# Create .env file (optional for local development)
cp .env.example .env

# Start development server
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Creating an Admin Account

1. Open http://localhost:3000/register
2. Register with role "Admin" (you'll need to modify the registration form or directly create in database)

**Note**: The registration form currently only allows "student" and "teacher" roles. To create an admin:

### Option 1: Direct Database Insert

```bash
# Connect to MongoDB and insert admin user
db.users.insertOne({
  name: "Admin",
  email: "admin@school.com",
  password: "$2a$10$...", // bcrypt hash of password
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

### Option 2: Use the API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## Deployment Summary

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Add env var: `REACT_APP_API_URL`
5. Deploy

### Backend (Render)
1. Push code to GitHub
2. Create Web Service in Render
3. Set root directory to `server`
4. Add env vars: `MONGODB_URI`, `JWT_SECRET`
5. Deploy

### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Add to backend env vars

---

## Default Test Accounts

After setting up, you can create test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |
| Student | student@school.com | student123 |
