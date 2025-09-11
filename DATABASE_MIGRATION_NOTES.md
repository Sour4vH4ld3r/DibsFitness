# 🗄️ Database Migration Notes - Dibs Fitness

## Current Database Status

### ✅ Existing Tables (Confirmed)
- `profiles` - User profiles and trainer information
- `members` - Member management
- `payments` - Payment tracking
- `expenses` - Expense tracking
- `sessions` - Session scheduling
- `invoices` - Invoice management

### 🔍 Missing Column (Identified during deployment)
- `invoices.discount_amount` column is referenced in code but missing from database

## Required Migrations for Production

### 1. Add Missing Invoice Column

```sql
-- Add discount_amount column to invoices table
ALTER TABLE invoices 
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- Update RLS policy if needed
UPDATE invoices SET discount_amount = 0.00 WHERE discount_amount IS NULL;
```

### 2. Verify RLS Policies

Ensure all tables have proper Row Level Security policies:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'members', 'payments', 'expenses', 'invoices', 'sessions');

-- Enable RLS if not already enabled
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 3. Verify Table Policies

```sql
-- Trainer access policies (adjust as needed)
CREATE POLICY IF NOT EXISTS "Trainers can access own data" ON members 
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Trainers can access own data" ON payments 
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Trainers can access own data" ON expenses 
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Trainers can access own data" ON invoices 
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Trainers can access own data" ON sessions 
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can access own profile" ON profiles 
  FOR ALL USING (id = auth.uid());
```

## Pre-Deployment Database Checklist

### Required Actions Before Going Live:

- [ ] **Add discount_amount column to invoices table**
  ```sql
  ALTER TABLE invoices ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
  ```

- [ ] **Verify all RLS policies are active and correct**
  ```sql
  -- Run the verification queries above
  ```

- [ ] **Test database connectivity with production credentials**
  ```bash
  # Test from your application
  curl https://your-domain.com/api/health
  ```

- [ ] **Backup existing data (if any)**
  ```bash
  # From Supabase dashboard or CLI
  npx supabase db dump > backup-$(date +%Y%m%d).sql
  ```

- [ ] **Verify service role key configuration**
  - Ensure SUPABASE_SERVICE_ROLE_KEY is set in production environment
  - Key should be the secret service_role key, not the publishable anon key

### Database Performance Optimizations (Optional)

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_members_trainer_id ON members(trainer_id);
CREATE INDEX IF NOT EXISTS idx_payments_trainer_id ON payments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trainer_id ON expenses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_trainer_id ON invoices(trainer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_trainer_id ON sessions(trainer_id);

-- Add composite indexes for date range queries
CREATE INDEX IF NOT EXISTS idx_payments_trainer_date ON payments(trainer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_trainer_date ON expenses(trainer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_trainer_status ON invoices(trainer_id, status);
```

## Post-Deployment Database Tasks

### 1. Monitor Database Performance
- Check query performance in Supabase dashboard
- Monitor connection pool usage
- Watch for slow queries

### 2. Regular Maintenance
- Weekly backup schedule
- Monthly performance review
- Quarterly security audit

### 3. Data Cleanup (if needed)
- Remove test data
- Archive old records (older than 2 years)
- Optimize table storage

## Troubleshooting Common Issues

### Issue: "Could not find 'discount_amount' column"
**Solution:** Run the discount_amount migration above

### Issue: "Unauthorized" errors
**Solution:** Check RLS policies and ensure trainer_id is properly set

### Issue: Slow queries
**Solution:** Add appropriate indexes and review query patterns

### Issue: Connection timeouts
**Solution:** Check Supabase connection limits and optimize connection pooling

---

## Emergency Database Recovery

### If Database Connection Fails:
1. Check Supabase service status
2. Verify environment variables
3. Test with anon key vs service role key
4. Check RLS policies blocking access

### If Data Loss Occurs:
1. Restore from latest backup
2. Check Supabase automatic backups (Pro plan)
3. Contact Supabase support immediately

---

**Status:** Ready for production deployment after running the required migrations above.

**Next Steps:** Execute the missing column migration, verify RLS policies, then deploy to Excloud.

---

*Generated for Dibs Fitness deployment by Claude Code*