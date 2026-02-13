# Citoyennete API - Technical Documentation

## Overview

REST API backend for the Citoyennete French civic exam preparation app. Provides secure access to multilingual exam questions with tiered access control for freemium business model.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 18.x+ | JavaScript runtime |
| Language | TypeScript | 5.x | Type-safe development |
| Framework | Express.js | 5.x | Web server framework |
| Database | PostgreSQL (Supabase) | 15.x | Relational database |
| Auth | Supabase Auth | Latest | OAuth 2.0 + JWT |
| ORM | Supabase JS Client | Latest | Database queries |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Client (PWA)                                            │
│ - React                                                 │
│ - Netlify hosted                                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS + JWT
                     ↓
┌─────────────────────────────────────────────────────────┐
│ API Layer (Node.js + Express)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Routes                                              │ │
│ │ • /api/health       - Health check                  │ │
│ │ • /api/questions    - Question retrieval (auth)     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Middleware                                          │ │
│ │ • authenticateUser  - JWT validation                │ │
│ │ • errorHandler      - Centralized error handling    │ │
│ │ • CORS              - Cross-origin security         │ │
│ └─────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Database (Supabase PostgreSQL)                          │
│ • questions          - Exam questions (multilingual)    │
│ • user_profiles      - Subscription tiers               │
│ • auth.users         - User accounts (managed)          │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts       # Supabase client
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── questions.ts       # Questions endpoints
│   │   └── health.ts          # Health check
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── main.ts                # Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Database Schema

### `questions` Table

```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,                    -- 'csp_values_001'
  level TEXT NOT NULL,                    -- 'CSP' | 'CR' | 'NAT'
  theme TEXT NOT NULL,                    -- 'values' | 'institutions' | etc.
  question_type TEXT NOT NULL,            -- 'knowledge' | 'situational'
  difficulty INTEGER,                     -- 1-5 scale (optional)
  content JSONB NOT NULL,                 -- Multilingual content
  correct_answer INTEGER NOT NULL,        -- Index of correct option
  is_premium BOOLEAN DEFAULT false,       -- Access control flag
  source_url TEXT,                        -- Official source reference
  last_verified DATE,                     -- Content accuracy tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_level_theme ON questions(level, theme);
CREATE INDEX idx_questions_premium ON questions(is_premium);
CREATE INDEX idx_questions_type ON questions(question_type);
```

### Content JSONB Structure

```json
{
  "fr": {
    "question": "Quelle est la devise de la Republique francaise?",
    "options": [
      "Liberte, Egalite, Fraternite",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "explanation": "La devise officielle de la France est..."
  },
  "en": {
    "question": "What is the motto of the French Republic?",
    "options": [
      "Liberty, Equality, Fraternity",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "explanation": "The official motto of France is..."
  },
  "es": {
    "question": "Cual es el lema de la Republica Francesa?",
    "options": [
      "Libertad, Igualdad, Fraternidad",
      "Opcion 2",
      "Opcion 3",
      "Opcion 4"
    ],
    "explanation": "El lema oficial de Francia es..."
  }
}
```

### `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free',  -- 'free' | 'premium' | 'lifetime'
  subscription_expires_at TIMESTAMP,
  preferred_language TEXT DEFAULT 'fr',
  target_exam_level TEXT,                 -- 'CSP' | 'CR' | 'NAT'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row-level security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);
```

## API Endpoints

### Public Endpoints

#### `GET /api/health`

Health check endpoint (no authentication required).

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-02-13T10:30:00.000Z",
  "service": "citoyennete-api"
}
```

---

### Authenticated Endpoints

#### `GET /api/questions`

Retrieve exam questions with access control.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| level | string | No | - | Filter by exam level: CSP, CR, NAT |
| theme | string | No | - | Filter by theme: values, institutions, etc. |
| language | string | No | fr | Response language: fr, en, es |
| limit | number | No | 10 | Max questions to return (1-50) |

**Response:**

```json
{
  "questions": [
    {
      "id": "csp_values_001",
      "level": "CSP",
      "theme": "values",
      "type": "knowledge",
      "question": "Quelle est la devise de la Republique francaise?",
      "options": ["Liberte, Egalite, Fraternite", "..."],
      "explanation": "La devise officielle...",
      "correctAnswer": 0,
      "isPremium": false
    }
  ],
  "count": 10,
  "userTier": "free"
}
```

**Access Control Logic:**

- Free users: `is_premium = false` questions only
- Premium users: All questions (including `is_premium = true`)

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Missing authentication token"
}

// 500 Internal Server Error
{
  "error": "Failed to fetch questions"
}
```

## Authentication Flow

### 1. User Authentication (Frontend)

```javascript
// Frontend: User signs in with Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Google OAuth sign-in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Get session after redirect
const { data: { session } } = await supabase.auth.getSession()
const jwtToken = session.access_token
```

### 2. API Request with JWT

```javascript
// Frontend: Call API with JWT token
const response = await fetch('https://api.citoyennete.app/api/questions', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
})
```

### 3. Backend JWT Verification

```typescript
// Backend: middleware/auth.ts
// 1. Extract JWT from Authorization header
// 2. Verify JWT with Supabase auth.getUser(token)
// 3. Fetch user's subscription_tier from user_profiles
// 4. Attach user object to req.user
// 5. Call next() to proceed to route handler
```

## Environment Variables

Create `.env` file (never commit this):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-key

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://citoyennete.app,https://www.citoyennete.app
```

**Security Notes:**

- `SUPABASE_SERVICE_KEY` has elevated permissions (backend only)
- Never expose service key to frontend
- Frontend uses `SUPABASE_ANON_KEY` (different key)

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- PostgreSQL knowledge (basic)

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run development server
npm run dev

# Server starts at http://localhost:3000
```

### Build for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Output: dist/ directory

# Run production server
npm start
```

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint on codebase |
