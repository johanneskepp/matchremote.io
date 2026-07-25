-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  stripe_customer_id TEXT,
  last_login TIMESTAMP,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Quiz Responses Table
CREATE TABLE quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL,
  async_need INTEGER NOT NULL CHECK (async_need >= 1 AND async_need <= 10),
  meeting_tolerance INTEGER NOT NULL CHECK (meeting_tolerance >= 1 AND meeting_tolerance <= 10),
  is_parent BOOLEAN DEFAULT false,
  is_neurodiv TEXT,
  salary_min INTEGER NOT NULL,
  salary_max INTEGER NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_level INTEGER NOT NULL CHECK (experience_level >= 1 AND experience_level <= 5),
  company_size_pref TEXT[] DEFAULT '{}',
  work_schedule TEXT DEFAULT 'flexible',
  industry_pref TEXT[] DEFAULT '{}',
  remote_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT salary_range CHECK (salary_min <= salary_max)
);

-- Jobs Table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  timezone TEXT,
  async_score INTEGER CHECK (async_score >= 1 AND async_score <= 10),
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'contract', 'part-time', 'freelance')),
  location TEXT,
  source TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  posted_date TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  scraped_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  company_size TEXT,
  industries TEXT[] DEFAULT '{}',
  CONSTRAINT salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- Matches Table
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Email Logs Table
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  resend_id TEXT,
  error_message TEXT
);

-- Saved Jobs Table
CREATE TABLE saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT now(),
  archived BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(user_id, job_id)
);

-- Email Alerts Table
CREATE TABLE email_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'never')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_quiz_responses_user_id ON quiz_responses(user_id);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_job_id ON matches(job_id);
CREATE INDEX idx_matches_score ON matches(match_score DESC);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_email_alerts_user_id ON email_alerts(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic example - update based on your needs)
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read their own quiz responses" ON quiz_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own saved jobs" ON saved_jobs
  FOR SELECT USING (auth.uid() = user_id);
