# Essential technical points

## 1. RLS is Not Optional ✅ CRITICALWhy this matters for Citoyenneté:Your questions table contains premium content. Without RLS:

Anyone with your SUPABASE_ANON_KEY can access all questions
Free users could use browser DevTools to bypass your API and query directly
Your entire business model collapses
The "Lock-by-Default" mindset:

```sql
-- Step 1: Enable RLS (locks everything down)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Step 2: Now NOTHING works until you write policies
-- This is GOOD - you're forced to think about security

-- Step 3: Explicitly allow what you want
CREATE POLICY "free_users_see_free_questions"
ON questions FOR SELECT
USING (is_premium = false);

CREATE POLICY "premium_users_see_all_questions"
ON questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND subscription_tier IN ('premium', 'lifetime')
  )
);
```

Common mistake: Developers enable RLS, write one policy, and wonder why their app breaks. You need separate policies for each operation (SELECT, INSERT, UPDATE, DELETE) and each user type.

## 2. Identity-Based Policies ✅ CRITICAL0

For your user_profiles table:

```sql
-- Users can READ their own profile
CREATE POLICY "users_read_own_profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Users CANNOT update their own subscription tier
-- (only your backend with service key can do this)
CREATE POLICY "users_cannot_update_tier"
ON user_profiles FOR UPDATE
USING (false);  -- Blocks ALL client updates
```

The trap: If you forget auth.uid() = user_id, any authenticated user can read/modify ANY other user's data. This is a GDPR violation and a security disaster.

## 3. Database Schema Integrity ⚠️ IMPORTANT

Real scenario for you:
Let's say you launch with just the questions table, then later add a difficulty column:

```sql
-- ❌ This FAILS if table has data
ALTER TABLE questions ADD COLUMN difficulty INTEGER NOT NULL;

-- ✅ This works
ALTER TABLE questions ADD COLUMN difficulty INTEGER DEFAULT 3;
-- or
ALTER TABLE questions ADD COLUMN difficulty INTEGER; -- nullable
```

Primary Keys:
Your schema already handles this well:

```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,  -- ✅ Good
  -- ...
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,  -- ✅ Good
  -- ...
);
```

## Secure File Storage Workflow 🤔 MEDIUM PRIORITY

When you'll need this:

User uploads profile photo (future feature)
User uploads documents for "dossier builder" (Phase 2)
Admin uploads audio files for B2 pronunciation practice

Not needed now: Your questions are text-based JSON, stored in the database (not as files).

When you implement it:

```typescript
// ❌ Bad: Original filename (users overwrite each other)
const { data } = await supabase.storage
	.from("avatars")
	.upload("avatar.jpg", file)

// ✅ Good: Unique filename
const fileName = `${auth.uid()}_${Date.now()}.jpg`
const { data } = await supabase.storage.from("avatars").upload(fileName, file)
```

RLS for storage buckets:

```sql
-- Step 1: Enable RLS (locks everything down)
-- In Supabase dashboard → Storage → Policies
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'avatars'
AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## API Key Hierarchy ✅ CRITICAL

```
|  ---  Key Type |  ---  Where Used  ---  |  --- Can Access   |
| SUPABASE_ANON_KEY | Frontend | Backend |
| SERVICE_ROLE_KEY | Backend | Backend |
```

## Critical security rules:

```javascript
// ✅ Frontend (.env.local or public)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...  // Safe to expose

// ✅ Backend (.env - NEVER commit)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  // NEVER expose this
```

## Frontend should NEVER use service key:

```typescript
// ❌ NEVER do this in frontend
const supabase = createClient(url, SERVICE_KEY)

// ✅ Always use anon key in frontend
const supabase = createClient(url, ANON_KEY)
```

## Setup

```sql
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
```

2. **Write policies for questions table**
   - Free users → `is_premium = false` only
   - Premium users → all questions

3. **Write policies for user_profiles**
   - Users can SELECT their own profile
   - Users CANNOT UPDATE subscription_tier

4. **Test with two users**
   - Create free user → verify can't see premium questions
   - Create premium user → verify can see all questions
