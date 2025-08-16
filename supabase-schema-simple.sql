-- OpenSAM AI Database Schema for Supabase (Simple Version)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Company Profiles Table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capabilities TEXT[] DEFAULT '{}',
    naics_codes TEXT[] DEFAULT '{}',
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    synopsis TEXT,
    naics_code VARCHAR(10),
    state VARCHAR(2),
    city VARCHAR(100),
    set_aside VARCHAR(100),
    response_deadline TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    ui_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working Lists Table
CREATE TABLE IF NOT EXISTS working_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working List Items Table
CREATE TABLE IF NOT EXISTS working_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES working_lists(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_naics_codes ON company_profiles USING GIN(naics_codes);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON opportunities(active);
CREATE INDEX IF NOT EXISTS idx_opportunities_naics_code ON opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_state ON opportunities(state);
CREATE INDEX IF NOT EXISTS idx_working_lists_user_id ON working_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_working_list_items_list_id ON working_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_profiles_updated_at') THEN
        CREATE TRIGGER update_company_profiles_updated_at 
            BEFORE UPDATE ON company_profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_opportunities_updated_at') THEN
        CREATE TRIGGER update_opportunities_updated_at 
            BEFORE UPDATE ON opportunities 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_working_lists_updated_at') THEN
        CREATE TRIGGER update_working_lists_updated_at 
            BEFORE UPDATE ON working_lists 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_working_list_items_updated_at') THEN
        CREATE TRIGGER update_working_list_items_updated_at 
            BEFORE UPDATE ON working_list_items 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_sessions_updated_at') THEN
        CREATE TRIGGER update_chat_sessions_updated_at 
            BEFORE UPDATE ON chat_sessions 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
    -- Company profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_profiles' AND policyname = 'Users can view their own company profiles') THEN
        CREATE POLICY "Users can view their own company profiles" ON company_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_profiles' AND policyname = 'Users can insert their own company profiles') THEN
        CREATE POLICY "Users can insert their own company profiles" ON company_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_profiles' AND policyname = 'Users can update their own company profiles') THEN
        CREATE POLICY "Users can update their own company profiles" ON company_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_profiles' AND policyname = 'Users can delete their own company profiles') THEN
        CREATE POLICY "Users can delete their own company profiles" ON company_profiles
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Opportunities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'opportunities' AND policyname = 'Anyone can view opportunities') THEN
        CREATE POLICY "Anyone can view opportunities" ON opportunities
            FOR SELECT USING (true);
    END IF;
    
    -- Working lists policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'working_lists' AND policyname = 'Users can view their own working lists') THEN
        CREATE POLICY "Users can view their own working lists" ON working_lists
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'working_lists' AND policyname = 'Users can insert their own working lists') THEN
        CREATE POLICY "Users can insert their own working lists" ON working_lists
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'working_lists' AND policyname = 'Users can update their own working lists') THEN
        CREATE POLICY "Users can update their own working lists" ON working_lists
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'working_lists' AND policyname = 'Users can delete their own working lists') THEN
        CREATE POLICY "Users can delete their own working lists" ON working_lists
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Chat sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can view their own chat sessions') THEN
        CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can insert their own chat sessions') THEN
        CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can update their own chat sessions') THEN
        CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can delete their own chat sessions') THEN
        CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Insert some sample data for testing
INSERT INTO opportunities (title, synopsis, naics_code, state, city, set_aside, response_deadline, active, ui_link) VALUES
('Sample IT Services Contract', 'Information technology services for government agency', '541511', 'CA', 'Los Angeles', 'Small Business', NOW() + INTERVAL '30 days', true, 'https://sam.gov/opp/sample1'),
('Construction Project Management', 'Construction project management services', '236220', 'TX', 'Houston', '8(a)', NOW() + INTERVAL '45 days', true, 'https://sam.gov/opp/sample2'),
('Cybersecurity Assessment', 'Cybersecurity assessment and consulting services', '541519', 'VA', 'Arlington', 'Woman-Owned', NOW() + INTERVAL '60 days', true, 'https://sam.gov/opp/sample3')
ON CONFLICT DO NOTHING; 