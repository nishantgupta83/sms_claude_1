# sms_claude_1

# 📱 SMS Mirror App - Complete Setup Guide

> **iOS-Only SMS Monitoring Solution with PWA Installation**

## 🎯 Quick Overview
This app allows secure monitoring of SMS messages from a child's iPhone through a web dashboard. The child's phone uses a PWA (Progressive Web App) that needs to be installed only once.

## 🚀 Quick Start (5 Minutes Setup)

### Step 1: Backend Server Setup
```bash
# Create project directory
mkdir sms-mirror-app
cd sms-mirror-app

# Create backend directory
mkdir backend
cd backend

# Initialize npm and install dependencies
npm init -y
npm install express socket.io cors dotenv body-parser

# Create server files (copy from artifacts above)
# - server.js
# - .env
```

### Step 2: Frontend Setup
```bash
# Go back to project root
cd ..

# Create web directory for PWA
mkdir web
cd web

# Create PWA files (copy from artifacts above)
# - index.html (PWA for kid's phone)
# - manifest.json
# - dashboard.html (parent monitoring)
```

### Step 3: Start the Server
```bash
cd backend
node server.js
```
✅ Server runs on `http://localhost:3001`

### Step 4: Install PWA on Kid's iPhone
1. Open Safari on kid's iPhone
2. Go to `http://YOUR_SERVER_IP:3001`
3. Tap the **Share** button
4. Tap **"Add to Home Screen"**
5. Name it "SMS Bridge" and tap **Add**
6. App icon appears on home screen

### Step 5: Access Parent Dashboard
1. Open web browser on your computer
2. Go to `http://YOUR_SERVER_IP:3001/dashboard.html`
3. Monitor messages in real-time

---

## 📁 Complete File Structure

```
sms-mirror-app/
├── backend/
│   ├── server.js              ← Main server (Module 1)
│   ├── package.json           ← Dependencies (Module 2)
│   ├── .env                   ← Config (Module 2)
│   └── public/
│       ├── index.html         ← PWA for kid's phone (Module 3)
│       ├── manifest.json      ← PWA manifest (Module 4)
│       └── dashboard.html     ← Parent dashboard (Module 5)
├── docs/
│   └── README.md              ← This file (Module 6)
└── deployment/
    ├── docker-compose.yml     ← Docker setup (Module 7)
    └── nginx.conf             ← Production config (Module 8)
```

---

## 🔧 Detailed Installation Steps

### Backend Server Setup
```bash
# 1. Create and setup backend
mkdir -p sms-mirror-app/backend
cd sms-mirror-app/backend

# 2. Copy server.js file (from Module 1 artifact)
# 3. Copy package.json file (from Module 2 artifact)  
# 4. Copy .env file (from Module 2 artifact)

# 5. Install dependencies
npm install

# 6. Start server
npm start
```

### PWA Frontend Setup
```bash
# 1. Create public directory for frontend files
mkdir -p backend/public

# 2. Copy files to public directory:
# - index.html (Module 3) → backend/public/index.html
# - manifest.json (Module 4) → backend/public/manifest.json
# - dashboard.html (Module 5) → backend/public/dashboard.html

# 3. Create icons directory
mkdir -p backend/public/icons

# 4. Add PWA icons (192x192, 512x512 PNG files)
# You can generate icons at: https://realfavicongenerator.net/
```

### Production Deployment (Optional)
```bash
# Using PM2 for production
npm install -g pm2
pm2 start server.js --name "sms-mirror"
pm2 startup
pm2 save

# Or using Docker (see Module 7)
docker-compose up -d
```

---

## 📱 Kid's iPhone Installation

### Method 1: Direct Installation
1. **Connect iPhone to same WiFi** as your server
2. **Open Safari** (must use Safari, not Chrome)
3. **Navigate to**: `http://[YOUR_SERVER_IP]:3001`
   - Find your server IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3001`
4. **Add to Home Screen**:
   - Tap the **Share button** (square with arrow up)
   - Scroll down and tap **"Add to Home Screen"**
   - Change name to "SMS Bridge" 
   - Tap **"Add"**
5. **App appears** on iPhone home screen like a native app

### Method 2: QR Code Installation
1. Generate QR code for your server URL
2. Kid scans QR code with iPhone camera
3. Opens in Safari automatically
4. Follow "Add to Home Screen" steps above

### ⚠️ Important Notes for iPhone:
- **Must use Safari** - Chrome/Firefox won't work for PWA installation
- **HTTPS required** for production (development HTTP is OK)
- **Same network** - Both devices need same WiFi initially
- **No App Store** - This installs directly, no App Store needed

---

## 💻 Parent Dashboard Access

### Local Network Access
```
http://[SERVER_IP]:3001/dashboard.html
```

### Features Available:
- ✅ **Real-time SMS monitoring**
- ✅ **Send messages remotely** 
- ✅ **Device connection status**
- ✅ **Message history**
- ✅ **Multiple device support**
- ✅ **Mobile-responsive design**

### Dashboard Screenshots:
- Device connection status
- Live message feed
- Send message interface
- Statistics overview

---

## 🔒 Security & Privacy

### Data Handling
- **No cloud storage** - all data stays on your server
- **Local network only** - doesn't send data to third parties
- **WebSocket encryption** - secure real-time communication
- **No personal data collection** - only SMS content

### Access Control
- Server runs on local network only
- No internet access required after setup
