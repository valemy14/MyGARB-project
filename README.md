# MYGARB Ecommerce Platform

Full-stack ecommerce application with React & Node.js

## 🚀 Tech Stack

**Frontend:**
- React 18
- Vite 7
- React Router
- Axios

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose

## 📁 Project Structure
```
MyGARB-project/
├── frontend/          # React Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js Express backend
│   ├── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Runs on:** http://localhost:5173

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
**Runs on:** http://localhost:5000

## 🔐 Environment Variables

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 📋 Features Roadmap

- [ ] User Authentication (Register/Login)
- [ ] Product Catalog & Search
- [ ] Shopping Cart
- [ ] Checkout & Payment Integration
- [ ] Order Management
- [ ] User Dashboard
- [ ] Admin Dashboard

## 👥 Team

- [Your Name] - Full Stack Developer
- [Team Member] - Role
- [Team Member] - Role

## 📅 Development Timeline

**Start Date:** February 19, 2026  
**Deadline:** March 5, 2026 (2 weeks)

### Week 1
- Days 1-2: Authentication & Database Setup
- Days 3-4: Product Catalog
- Days 5-7: Shopping Cart

### Week 2
- Days 8-9: Checkout & Payment
- Days 10-11: Order Management
- Days 12-14: Testing & Deployment

## 🚀 Deployment

- **Frontend:** Vercel
- **Backend:** Render.com
- **Database:** MongoDB Atlas

## 📝 Git Workflow
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature
```

## 🔗 Links

- **Repository:** https://github.com/valemy14/MyGARB-project
- **Live Demo:** [Coming Soon]
- **API Docs:** [Coming Soon]

---

Built with ❤️ by MYGARB Team
```

Press **Ctrl + S** to save.

---

## **STEP 3: Update .gitignore**

Click on `.gitignore` in the root folder.

**Replace with:**
```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
*.env.local
backend/.env
frontend/.env

# Build outputs
dist/
build/
*/dist/
*/build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
*.log

# Test coverage
coverage/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*