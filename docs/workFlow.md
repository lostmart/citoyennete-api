# Architecture: How the Pieces Fit Together

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Frontend (Netlify - Static PWA)                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ React App                                                │ │
│ │ - User authentication (Supabase client SDK)              │ │
│ │ - UI/UX for studying                                     │ │
│ │ - Progress tracking (localStorage + sync)                │ │
│ └──────────────────────────────────────────────────────────┘ │
│                          ↓ HTTP Requests                     │
│                    (with JWT auth token)                     │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ Backend API (Node.js + Express)                              │
│ Hosted on: Render/Railway/Fly.io                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ REST API Endpoints:                                      │ │
│ │ • GET /api/questions - Fetch questions (auth required)   │ │
│ │ • GET /api/themes - Get theme metadata                   │ │
│ │ • POST /api/progress/sync - Sync user progress           │ │
│ │ • POST /api/stripe/webhook - Handle subscriptions        │ │
│ │                                                          │ │
│ │ Middleware:                                              │ │
│ │ • JWT verification (decode Supabase token)               │ │
│ │ • Subscription tier check (free vs premium)              │ │
│ │ • Rate limiting (prevent abuse)                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│ Supabase (Database + Auth)                                   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ PostgreSQL Tables:                                       │ │
│ │ • auth.users (managed by Supabase)                       │ │
│ │ • user_profiles (subscription_tier, preferences)         │ │
│ │ • questions (id, level, theme, text_fr, text_en, ...)    │ │
│ │ • study_progress (user_id, progress_data, last_synced)   │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```
