-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: themes (educational content categories)
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    color_scheme TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: subtopics (detailed learning sections)
CREATE TABLE subtopics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title JSONB NOT NULL,
    subtitle JSONB,
    description JSONB NOT NULL,
    key_points JSONB NOT NULL,
    exam_tip JSONB,
    image TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: questions (MCQ exam questions)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text JSONB NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index BETWEEN 0 AND 3),
    explanation JSONB,
    category TEXT NOT NULL,
    exam_level TEXT NOT NULL CHECK (exam_level IN ('CSP', 'CR', 'NAT')),
    question_type TEXT DEFAULT 'knowledge' CHECK (question_type IN ('knowledge', 'situational')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: user_subscriptions (access control)
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_subtopics_theme_id ON subtopics(theme_id);
CREATE INDEX idx_questions_exam_level ON questions(exam_level);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();