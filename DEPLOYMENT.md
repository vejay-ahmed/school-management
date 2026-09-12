# Deployment Guide - School Management System

This guide will help you deploy the School Management System to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Render or Railway account (for backend)
- MongoDB Atlas account (for production database)

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Save this connection string for deployment

---

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `school-management-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A long random string
6. Click "Create Web Service"
7. Note the URL (e.g., `https://school-management-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://school-management-api.onrender.com/api`)
6. Click "Deploy"

---

## Step 4: Verify Deployment

1. Open your Vercel frontend URL
2. Test: Register → Login → Add data → Verify all features work

---

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| PORT | Server port (5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT |

### Frontend
| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |

---

## Troubleshooting

- **CORS Errors**: Check backend URL in frontend env vars
- **DB Connection Failed**: Verify MongoDB string, whitelist IPs
- **Build Failed**: Check for syntax errors, ensure dependencies in package.json

---

## Cost Estimation

| Service | Free Tier |
|---------|-----------|
| Vercel | Unlimited static sites |
| Render | 750 hours/mo |
| MongoDB Atlas | 512MB storage |

**Total estimated cost for small school: $0-15/month**
