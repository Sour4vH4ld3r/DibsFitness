# Production Deployment Guide for Dibs Fitness

## Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] Supabase project created
- [x] Database schema deployed
- [x] Authentication configured
- [ ] Domain name ready
- [ ] Deployment platform account (Vercel/Netlify/etc.)

## 1. Database Setup (Supabase)

### Run the Schema
1. Go to Supabase SQL Editor
2. Run the schema from `/supabase/schema.sql`
3. Verify all tables are created

### Configure Authentication
1. **Email Auth**: Enable in Supabase Dashboard > Authentication > Providers
2. **Google OAuth**: Already configured ✓
3. **Email Templates**: Customize in Authentication > Email Templates
4. **URL Configuration**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### Security Checklist
- [x] Row Level Security (RLS) enabled on all tables
- [x] Policies configured for each table
- [ ] Service role key kept secret (never expose in client)
- [ ] API rate limiting configured

## 2. Environment Configuration

### Production Environment Variables
```bash
# Copy the example file
cp .env.production.example .env.production.local

# Update with your production values:
NEXT_PUBLIC_SUPABASE_URL=https://ylslhgrdtescqwtmpyqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 3. Code Preparation

### Build Optimization
```bash
# Install dependencies
npm ci

# Run production build
npm run build

# Test production build locally
npm run start
```

### Pre-deployment Checklist
- [ ] Remove all console.log statements
- [ ] Update meta tags in layout.tsx
- [ ] Update favicon and app icons
- [ ] Test all critical user flows
- [ ] Verify mobile responsiveness

## 4. Deployment Options

### Option A: Deploy to Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Configure in Vercel Dashboard**
   - Add environment variables
   - Set Node.js version to 18.x
   - Configure domain

3. **Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ylslhgrdtescqwtmpyqg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
   ```

### Option B: Deploy to Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (if needed)

2. **Environment Variables**
   - Add same variables as above in Netlify dashboard

### Option C: Deploy to AWS/Digital Ocean

1. **Using Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

## 5. Post-Deployment Tasks

### Domain Configuration
1. **Add custom domain** in deployment platform
2. **Update Supabase**:
   - Add production URL to allowed URLs
   - Update redirect URLs
3. **Update Google OAuth**:
   - Add `https://your-domain.com/api/auth/callback` to authorized redirects

### Monitoring Setup
1. **Error Tracking** (Optional)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

2. **Analytics** (Optional)
   ```bash
   npm install @vercel/analytics
   ```

### Performance Optimization
- Enable image optimization
- Set up CDN for static assets
- Configure caching headers
- Enable gzip compression

## 6. Testing Production

### Critical User Flows to Test
1. **Authentication**
   - [ ] Sign up with email
   - [ ] Sign in with email
   - [ ] Sign in with Google
   - [ ] Password reset
   - [ ] Sign out

2. **Members Management**
   - [ ] View members list
   - [ ] Add new member
   - [ ] Edit member
   - [ ] Delete member
   - [ ] Search and filter

3. **Schedule**
   - [ ] View calendar
   - [ ] Create session
   - [ ] Update session
   - [ ] Cancel session

4. **Payments**
   - [ ] View payments
   - [ ] Create invoice
   - [ ] Record payment

## 7. Backup & Recovery

### Database Backup
1. Enable automatic backups in Supabase (Pro plan)
2. Manual backup script:
   ```sql
   pg_dump -h db.ylslhgrdtescqwtmpyqg.supabase.co -U postgres -d postgres > backup.sql
   ```

### Application Backup
- Keep Git repository up to date
- Tag releases: `git tag -a v1.0.0 -m "Initial release"`

## 8. Maintenance Mode

Create a maintenance page at `/src/app/maintenance/page.tsx`:
```typescript
export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>We'll be back soon!</h1>
    </div>
  )
}
```

## 9. Security Best Practices

1. **API Security**
   - [x] Use Supabase RLS
   - [x] Validate all inputs
   - [ ] Implement rate limiting
   - [ ] Add CORS configuration

2. **Authentication**
   - [x] Secure session management
   - [x] HTTPS only
   - [ ] 2FA (optional)

3. **Data Protection**
   - [x] Encrypt sensitive data
   - [x] Regular backups
   - [ ] GDPR compliance (if applicable)

## 10. Launch Checklist

### Pre-Launch
- [ ] Production build successful
- [ ] All environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Database migrated
- [ ] Test data removed
- [ ] Admin account created

### Launch Day
- [ ] Deploy to production
- [ ] Verify all features working
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Announce launch!

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track analytics
- [ ] Plan updates
- [ ] Regular backups

## Support & Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and keys
   - Verify network connectivity
   - Check RLS policies

2. **Authentication Issues**
   - Verify redirect URLs
   - Check OAuth configuration
   - Clear browser cookies

3. **Performance Issues**
   - Enable caching
   - Optimize images
   - Check database queries

### Getting Help
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord
- GitHub Issues: [Your repo]/issues

## Version History
- v1.0.0 - Initial release (Current)

---

**Ready to Deploy? 🚀**

Follow this guide step by step, and your Dibs Fitness app will be live in production!
