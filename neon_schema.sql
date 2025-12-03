-- Neon (Vercel Postgres) Schema for ViralThumb AI

CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 20,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster referral lookups
CREATE INDEX idx_referral_code ON profiles(referral_code);
