# MongoDB Integration Guide

## ✅ What's Been Done

I've successfully integrated MongoDB into your Smart Health System! Here's what changed:

### 📦 New Files Created:

1. **`.env`** - Environment configuration
2. **`config/db.js`** - MongoDB connection setup
3. **`models/User.js`** - User schema and model
4. **`models/Report.js`** - Report schema and model
5. **`models/Alert.js`** - Alert schema and model
6. **`index.js`** - Updated server with MongoDB (old version backed up as `index.backup.js`)

### 🔧 Dependencies Installed:

- ✅ `mongoose` - MongoDB ODM
- ✅ `dotenv` - Environment variables

---

## 🚀 Setup Instructions

### Step 1: Install MongoDB

You need MongoDB installed on your system. Choose one option:

#### Option A: MongoDB Community Edition (Recommended)
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically as a service

#### Option B: MongoDB Atlas (Cloud - Free Tier)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `.env` file with your Atlas connection string

### Step 2: Verify MongoDB is Running

Open a new terminal and run:
```bash
mongosh
```

If it connects, MongoDB is running! ✅

If not, start MongoDB:
```bash
# Windows (if not running as service)
net start MongoDB
```

### Step 3: Update Environment Variables (Optional)

Edit `server/.env` if needed:
```env
MONGODB_URI=mongodb://localhost:27017/smart-health
JWT_SECRET=smarthealth_ne_secret_key_2024
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-health
```

### Step 4: Restart the Server

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd server
node index.js
```

You should see:
```
MongoDB Connected: localhost
Database: smart-health
Server running on http://localhost:5000
```

---

## 🎯 What Changed

### Before (JSON File):
- Data stored in `data.json`
- Manual file read/write operations
- No data validation
- Limited query capabilities

### After (MongoDB):
- Data stored in MongoDB database
- Automatic CRUD operations
- Built-in validation
- Powerful queries and aggregations
- Scalable and production-ready

---

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'community' | 'health_worker' | 'admin',
  createdAt: Date,
  lastLogin: Date
}
```

### Reports Collection
```javascript
{
  userId: ObjectId (ref: User),
  state: String,
  location: String,
  symptoms: [String],
  waterSource: String,
  severity: 'Low' | 'Medium' | 'High',
  notes: String,
  registeredCases: Number,
  status: 'pending' | 'investigating' | 'resolved',
  timestamp: Date
}
```

### Alerts Collection
```javascript
{
  location: String,
  level: 'Yellow' | 'Orange' | 'Red',
  message: String,
  reportCount: Number,
  createdBy: ObjectId (ref: User),
  isActive: Boolean,
  resolvedAt: Date,
  createdAt: Date
}
```

---

## 🔄 Data Migration (Optional)

If you have existing data in `data.json`, I can create a migration script to import it into MongoDB.

Would you like me to create a migration script?

---

## ✨ New Features Available

With MongoDB, you now have:

1. **Better Performance** - Indexed queries for faster searches
2. **Data Validation** - Automatic validation of all fields
3. **Relationships** - User data linked to reports and alerts
4. **Aggregations** - Complex analytics and statistics
5. **Scalability** - Can handle millions of records
6. **Backup & Recovery** - Easy database backups
7. **Cloud Ready** - Can deploy to MongoDB Atlas

---

## 🧪 Testing

### Test the API:

1. **Register a new user:**
```bash
POST http://localhost:5000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "community"
}
```

2. **Login:**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Create a report:**
```bash
POST http://localhost:5000/api/reports
Headers: Authorization: Bearer <your-token>
{
  "location": "Guwahati",
  "symptoms": ["Fever", "Diarrhea"],
  "waterSource": "River",
  "severity": "High"
}
```

---

## 🐛 Troubleshooting

### Error: "MongooseServerSelectionError"
- MongoDB is not running
- Solution: Start MongoDB service

### Error: "ECONNREFUSED"
- Wrong connection string
- Solution: Check `.env` file

### Error: "Authentication failed"
- Old tokens in localStorage
- Solution: Logout and login again

---

## 📝 Next Steps

1. ✅ Install MongoDB
2. ✅ Restart the server
3. ✅ Test the API
4. 🔄 Migrate existing data (if needed)
5. 🚀 Deploy to production

---

**Status**: ✅ MongoDB integration complete!
**Backup**: Old server saved as `index.backup.js`
