CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  title varchar(60) NOT NULL,
  category text NOT NULL,
  creator_name text NOT NULL,
  summary varchar(300) NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  story_intro text NOT NULL DEFAULT '',
  story_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ad_headline varchar(60) NOT NULL DEFAULT '',
  ad_description varchar(180) NOT NULL DEFAULT '',
  cta varchar(40) NOT NULL DEFAULT 'Learn more',
  audience_location text NOT NULL DEFAULT 'India',
  audience_interests text[] NOT NULL DEFAULT '{}',
  channels text[] NOT NULL DEFAULT '{}',
  duration_days integer NOT NULL DEFAULT 14,
  funding_goal numeric(12,2) NOT NULL DEFAULT 10000,
  raised numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  estimated_reach bigint NOT NULL DEFAULT 0,
  ad_budget numeric(12,2) NOT NULL DEFAULT 0,
  ad_spend numeric(12,2) NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  measured_reach bigint,
  backers integer NOT NULL DEFAULT 0,
  deadline timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_campaign_status CHECK (status IN (
    'draft','submitted_for_review','changes_requested','rejected','approved',
    'available_for_funding','funding_goal_reached','funding_period_ended',
    'distribution_preparation','promoting','completed','cancelled','refund_pending','failed'
  ))
);

CREATE TABLE IF NOT EXISTS contributions (
  id text PRIMARY KEY,
  campaign_id text NOT NULL REFERENCES campaigns(id),
  user_id text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 50),
  platform_fee numeric(12,2) NOT NULL DEFAULT 0,
  transaction_fee numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  payment_status text NOT NULL,
  private_backer boolean NOT NULL DEFAULT true,
  receipt_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id text PRIMARY KEY,
  user_id text,
  campaign_id text REFERENCES campaigns(id),
  title text NOT NULL,
  body text NOT NULL,
  event_type text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_decisions (
  id text PRIMARY KEY,
  campaign_id text NOT NULL REFERENCES campaigns(id),
  reviewer_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approve','changes','reject')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaigns_status_created_idx ON campaigns(status, created_at DESC);
CREATE INDEX IF NOT EXISTS contributions_campaign_idx ON contributions(campaign_id, created_at DESC);
