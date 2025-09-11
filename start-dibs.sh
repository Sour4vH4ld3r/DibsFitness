#!/bin/bash

# Dibs Fitness - Start Script
echo "🎯 Starting Dibs Fitness..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found!"
    echo "Please add your Clerk keys to .env.local"
    echo ""
    echo "Visit https://clerk.com to get your keys and add them to .env.local:"
    echo "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here"
    echo "  CLERK_SECRET_KEY=your_secret_here"
    echo ""
fi

# Start the development server
echo "🚀 Starting development server..."
echo "📱 Access the app at: http://localhost:3000"
echo ""
npm run dev
