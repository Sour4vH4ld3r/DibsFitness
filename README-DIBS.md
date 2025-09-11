# 🎯 Dibs Fitness - Fitness Management Platform

## Overview
Dibs Fitness is a comprehensive fitness management platform for trainers to manage members, schedules, and payments with ease.

## ✨ Features
- 🔐 **Secure Authentication** with Clerk
- 👥 **Member Management** - Track all your members
- 📅 **Smart Scheduling** - Let members call dibs on time slots  
- 💰 **Payment Tracking** - Manage invoices and payments
- 📊 **Analytics & Reports** - Business insights
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Beautiful UI** - Modern design with Lucide React icons

## 🚀 Quick Start

### 1. Setup Clerk Authentication
1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your keys from the Clerk dashboard
4. Update `.env.local` with your keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
```

### 2. Install & Run
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# OR use the start script
./start-dibs.sh
```

### 3. Access the Application
- 🏠 **Landing Page**: http://localhost:3000
- 🔑 **Sign In**: http://localhost:3000/auth/sign-in
- 📝 **Sign Up**: http://localhost:3000/auth/sign-up
- 📊 **Dashboard**: http://localhost:3000/dashboard (after authentication)

## 📁 Project Structure
```
dibs-fitness-web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/               # Authentication pages
│   │   │   ├── sign-in/       # Sign in page
│   │   │   └── sign-up/       # Sign up page
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   └── page.tsx       # Main dashboard
│   │   ├── layout.tsx         # Root layout with ClerkProvider
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── dibs/              # Custom Dibs components
│   │   │   ├── DibsLogo.tsx  # Brand logo
│   │   │   ├── DibsCard.tsx  # Custom card component
│   │   │   └── DibsStats.tsx # Statistics component
│   │   └── ui/                # Shadcn UI components
│   ├── lib/                   # Utilities and helpers
│   └── middleware.ts          # Clerk authentication middleware
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this!)
├── tailwind.config.js         # Tailwind configuration
└── package.json              # Dependencies
```

## 🎨 Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React (SVG icons)
- **Authentication**: Clerk
- **State Management**: Zustand
- **Animations**: Framer Motion

## 🔧 Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Brand Colors
- **Dibs Blue**: #0066FF
- **Dibs Green**: #00D084
- **Dibs Orange**: #FF6B35
- **Dibs Navy**: #0A1628

## 📝 Environment Variables
Create a `.env.local` file with:
```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (Pre-configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# App Configuration
NEXT_PUBLIC_APP_NAME=Dibs Fitness
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚨 Troubleshooting

### Issue: 404 Error on routes
**Solution**: Make sure you're running `npm run dev` in the project directory and accessing http://localhost:3000

### Issue: Authentication not working
**Solution**: Ensure you've added your Clerk keys to `.env.local` and restarted the dev server

### Issue: Styles not loading
**Solution**: Clear the `.next` folder and restart:
```bash
rm -rf .next
npm run dev
```

## 🤝 Support
For issues or questions, please refer to the documentation files:
- `dibs-fitness-brand-guide.md` - Brand guidelines
- `fitness-trainer-nextjs-ui-plan.md` - UI/UX specifications
- `dibs-fitness-implementation-steps.md` - Development roadmap

## 📜 License
© 2024 Dibs Fitness. All rights reserved.
