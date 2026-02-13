# Architecture

REST API + Node.js + Supabase

✅ Enables freemium (granular access control)
✅ Cost-effective (starts at $0, scales gracefully)
✅ Familiar stack (Node.js + Express is standard)
✅ GDPR-compliant (European data residency via Supabase)
✅ Fast to build (use existing JSON, migrate incrementally)

Deployment Timeline:

- Week 1: Set up Supabase schema + migrate questions
- Week 2: Build Node.js API (auth + questions endpoint)
- Week 3: Deploy to Render + integrate frontend
- Week 4: Add Stripe + premium content gates
- Week 5: Add study progress tracking
- Week 6: Add theme metadata
- Week 7: Add user preferences

## Media Architecture:

Self-hosted (in-app):

- Core exam content (must work offline)
- Audio drills, quiz questions, flashcards
- Educational diagrams and infographics
- Hosted on Supabase Storage

- External (marketing/supplementary):

- YouTube channel with testimonials, process explainers
- Blog articles with embedded YouTube videos
- Long-form "culture" content that's nice-to-have but not exam-critical

## Why this works:

The app delivers reliable offline exam prep (competitive advantage)
The marketing content benefits from YouTube SEO and discovery (acquisition channel)
It's not dependent on external services for core functionality

## Audio Optimization:

Format: MP3
Bitrate: 96 kbps (speech-optimized)
File size: ~700KB per minute
Quality: Perfectly clear for learning
Savings: 93% smaller files

### Specific Implementation:

Now (MVP):

Self-host ALL audio/images on Supabase Storage (free tier)
Implement Service Worker for offline caching
No video yet (add later if user research shows need)

### Month 3-6 (Post-launch):

Upgrade to Supabase Pro ($25/month) if you hit limits
Start YouTube channel for marketing (separate from app)
Add short self-hosted video clips IF user feedback requests them

### Year 2+ (Scale):

Migrate to Cloudflare R2 if bandwidth costs become significant
Keep core exam content self-hosted
Use YouTube for supplementary/community content

## Database Schema Design

1. themes (educational content)

Stores the learning material from your principes-valeurs-en.json files
Each theme has multiple subtopics

2. subtopics (detailed educational sections)

The individual learning units (like "Liberty", "Secularism")
Linked to a theme

3. questions (MCQ exam questions)

The actual quiz questions from your exercise file
Multiple choice with one correct answer

4. user_subscriptions (access control)

Tracks which tier each user has (free/premium)
Used by RLS policies to grant/deny access

## Database Schema (4 tables)

### Table 1: themes

Stores the main educational categories (5 official exam themes)

**Columns:**

- id (uuid, primary key)
- slug (text, unique) - e.g., "principes-valeurs"
- title (jsonb) - {"fr": "Principes et valeurs", "en": "Principles and Values"}
- description (jsonb) - multilingual
- color_scheme (text) - "sky", "blue", "pink"
- display_order (integer) - for sorting
- created_at (timestamp)

### Table 2: subtopics

The detailed learning sections within each theme

**Columns:**

- id (uuid, primary key)
- theme_id (uuid, foreign key → themes)
- slug (text)
- title (jsonb)
- subtitle (jsonb)
- description (jsonb)
- key_points (jsonb) - array of strings per language
- exam_tip (jsonb)
- image (text) - identifier
- display_order (integer)
- created_at (timestamp)

### Table 3: questions

The MCQ exam questions

**Columns:**

- id (uuid, primary key)
- question_text (jsonb) - {"fr": "...", "en": "..."}
- options (jsonb) - array of 4 options per language
- correct_answer_index (integer) - 0-3
- explanation (jsonb) - why this answer is correct
- category (text) - "Droits et devoirs", etc.
- exam_level (text) - "CSP", "CR", or "NAT"
- question_type (text) - "knowledge" or "situational"
- created_at (timestamp)

**Key point: exam_level determines access via RLS**

## Table 4: user_subscriptions

Tracks user access tiers

**Columns:**

- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users)
- tier (text) - "free" or "premium"
- status (text) - "active", "cancelled", "expired"
- starts_at (timestamp)
- expires_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Access rules:

- tier = 'free' → can access questions where exam_level = 'CSP'
- tier = 'premium' → can access ALL questions
