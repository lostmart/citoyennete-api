-- Enable Row Level Security on all tables
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- THEMES: Anyone can read (educational content is public)
CREATE POLICY "Anyone can read themes"
    ON themes FOR SELECT
    USING (true);

-- SUBTOPICS: Anyone can read
CREATE POLICY "Anyone can read subtopics"
    ON subtopics FOR SELECT
    USING (true);

-- QUESTIONS: Access based on subscription tier
CREATE POLICY "Free users can read CSP questions"
    ON questions FOR SELECT
    USING (
        exam_level = 'CSP'
        AND auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM user_subscriptions
            WHERE user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Premium users can read all questions"
    ON questions FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM user_subscriptions
            WHERE user_id = auth.uid()
            AND tier = 'premium'
            AND status = 'active'
        )
    );

-- USER_SUBSCRIPTIONS: Users can only read their own subscription
CREATE POLICY "Users can read own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Function to auto-create free subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'free', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();