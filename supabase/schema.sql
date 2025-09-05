-- Know My Rights AI Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro');
CREATE TYPE storage_type AS ENUM ('local', 'ipfs');
CREATE TYPE record_status AS ENUM ('recording', 'complete', 'uploaded');
CREATE TYPE language AS ENUM ('en', 'es');

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state_preference VARCHAR(100),
    
    -- Indexes
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Rights cards table
CREATE TABLE rights_cards (
    card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- JSON string containing the full rights card data
    language language DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    UNIQUE(state, language)
);

-- Incident records table
CREATE TABLE incident_records (
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path VARCHAR(500) NOT NULL,
    storage_type storage_type DEFAULT 'local',
    status record_status DEFAULT 'complete',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    file_size BIGINT,
    duration_seconds INTEGER,
    recording_type VARCHAR(20), -- 'audio' or 'video'
    ipfs_hash VARCHAR(100),
    metadata JSONB
);

-- Legal scripts table (for caching generated scripts)
CREATE TABLE legal_scripts (
    script_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(100) NOT NULL,
    scenario VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    script_content TEXT NOT NULL,
    language language DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    UNIQUE(state, scenario, language)
);

-- User sessions table (for tracking user activity)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Subscription events table (for tracking subscription changes)
CREATE TABLE subscription_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'renew'
    from_tier subscription_tier,
    to_tier subscription_tier,
    stripe_event_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage analytics table (for tracking feature usage)
CREATE TABLE usage_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'rights_card_generated', 'recording_started', etc.
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_rights_cards_state ON rights_cards(state);
CREATE INDEX idx_rights_cards_language ON rights_cards(language);
CREATE INDEX idx_incident_records_user_id ON incident_records(user_id);
CREATE INDEX idx_incident_records_created_at ON incident_records(created_at DESC);
CREATE INDEX idx_legal_scripts_state_scenario ON legal_scripts(state, scenario);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rights_cards_updated_at BEFORE UPDATE ON rights_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_scripts_updated_at BEFORE UPDATE ON legal_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

-- Incident records policies
CREATE POLICY "Users can view own incident records" ON incident_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incident records" ON incident_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incident records" ON incident_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incident records" ON incident_records
    FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription events policies
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT USING (auth.uid() = user_id);

-- Rights cards and legal scripts are publicly readable
CREATE POLICY "Rights cards are publicly readable" ON rights_cards
    FOR SELECT USING (true);

CREATE POLICY "Legal scripts are publicly readable" ON legal_scripts
    FOR SELECT USING (true);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_subscription_tier(user_uuid UUID)
RETURNS subscription_tier AS $$
DECLARE
    tier subscription_tier;
BEGIN
    SELECT subscription_tier INTO tier FROM users WHERE user_id = user_uuid;
    RETURN COALESCE(tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_subscription(
    user_uuid UUID,
    new_tier subscription_tier,
    stripe_event_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_tier subscription_tier;
BEGIN
    -- Get current tier
    SELECT subscription_tier INTO old_tier FROM users WHERE user_id = user_uuid;
    
    -- Update user subscription
    UPDATE users 
    SET subscription_tier = new_tier, updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Log the subscription event
    INSERT INTO subscription_events (user_id, event_type, from_tier, to_tier, stripe_event_id)
    VALUES (
        user_uuid,
        CASE 
            WHEN old_tier = 'free' AND new_tier = 'pro' THEN 'upgrade'
            WHEN old_tier = 'pro' AND new_tier = 'free' THEN 'downgrade'
            ELSE 'change'
        END,
        old_tier,
        new_tier,
        stripe_event_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log usage analytics
CREATE OR REPLACE FUNCTION log_usage_event(
    user_uuid UUID DEFAULT NULL,
    event_type_param VARCHAR DEFAULT NULL,
    event_data_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO usage_analytics (user_id, event_type, event_data)
    VALUES (user_uuid, event_type_param, event_data_param);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some initial data
INSERT INTO rights_cards (state, title, content, language) VALUES
('California', 'Know Your Rights - California', '{"summary": "Sample rights card for California", "whatToDo": [], "whatNotToDo": [], "keyLaws": []}', 'en'),
('Texas', 'Know Your Rights - Texas', '{"summary": "Sample rights card for Texas", "whatToDo": [], "whatNotToDo": [], "keyLaws": []}', 'en'),
('New York', 'Know Your Rights - New York', '{"summary": "Sample rights card for New York", "whatToDo": [], "whatNotToDo": [], "keyLaws": []}', 'en');

-- Create a view for user statistics
CREATE VIEW user_stats AS
SELECT 
    u.user_id,
    u.email,
    u.subscription_tier,
    u.created_at as user_created_at,
    COUNT(ir.record_id) as total_recordings,
    COUNT(CASE WHEN ir.storage_type = 'ipfs' THEN 1 END) as ipfs_recordings,
    MAX(ir.created_at) as last_recording_date
FROM users u
LEFT JOIN incident_records ir ON u.user_id = ir.user_id
GROUP BY u.user_id, u.email, u.subscription_tier, u.created_at;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts and subscription information';
COMMENT ON TABLE rights_cards IS 'Generated rights cards for different states and languages';
COMMENT ON TABLE incident_records IS 'User recordings and incident documentation';
COMMENT ON TABLE legal_scripts IS 'Cached legal scripts for different scenarios';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';
COMMENT ON TABLE subscription_events IS 'Subscription change history';
COMMENT ON TABLE usage_analytics IS 'Feature usage tracking for analytics';

COMMENT ON FUNCTION get_user_subscription_tier IS 'Get the subscription tier for a user';
COMMENT ON FUNCTION update_user_subscription IS 'Update user subscription tier and log the event';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Remove expired user sessions';
COMMENT ON FUNCTION log_usage_event IS 'Log usage analytics events';
