#!/bin/bash

echo "🔍 MindMemos Project Status Check"
echo "=================================="
echo ""

# Check Backend Server
echo "📡 Backend Server (Port 3000):"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Running - http://localhost:3000"
    curl -s http://localhost:3000/api/health | head -1
else
    echo "❌ Not running or not accessible"
    echo "   Start with: cd server && npm run dev"
fi
echo ""

# Check Frontend Server
echo "🌐 Frontend Server (Port 4200):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 2>&1 | grep -q "200"; then
    echo "✅ Running - http://localhost:4200"
    echo "   Open in browser: http://localhost:4200"
else
    echo "❌ Not running or not accessible"
    echo "   Start with: cd client && npm start"
fi
echo ""

# Check MongoDB Connection
echo "🗄️  MongoDB Atlas Connection:"
cd server && node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected to:', mongoose.connection.db.databaseName); mongoose.connection.close(); }).catch(err => console.error('❌ Error:', err.message));" 2>&1 | grep -v "ExperimentalWarning" || echo "❌ Connection failed"
cd ..
echo ""

# Check Database Collections
echo "📊 Database Collections:"
cd server && node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const db = mongoose.connection.db; const cols = await db.listCollections().toArray(); cols.forEach(c => console.log('  -', c.name)); mongoose.connection.close(); }).catch(err => console.error('❌ Error:', err.message));" 2>&1 | grep -v "ExperimentalWarning" || echo "❌ Could not list collections"
cd ..
echo ""

# Check Running Processes
echo "⚙️  Running Processes:"
if ps aux | grep -E "ts-node-dev.*index.ts" | grep -v grep > /dev/null; then
    echo "✅ Backend process running"
else
    echo "❌ Backend process not found"
fi

if ps aux | grep "ng serve" | grep -v grep > /dev/null; then
    echo "✅ Frontend process running"
else
    echo "❌ Frontend process not found"
fi
echo ""

echo "=================================="
echo "✅ All checks complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:4200 in your browser"
echo "2. Register a new account"
echo "3. Login and test the features"

