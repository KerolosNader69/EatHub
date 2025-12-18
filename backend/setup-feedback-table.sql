-- Feedback Table Setup for Supabase
-- Run this in Supabase SQL Editor

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Anonymous',
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (public insert)
CREATE POLICY "Allow public to create feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to read all feedback
CREATE POLICY "Allow authenticated users to read feedback" ON feedback
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

-- Grant permissions
GRANT INSERT ON feedback TO anon;
GRANT SELECT ON feedback TO authenticated;
