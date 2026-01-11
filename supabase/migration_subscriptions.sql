-- Migration: Subscriptions and Payments
-- Description: Adds tables to track user subscriptions and payment history

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'canceled'
  event_limit INTEGER DEFAULT 1,
  events_used INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_id VARCHAR(255), -- Xendit Invoice ID
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'failed'
  plan_type VARCHAR(50),
  payment_method VARCHAR(50),
  checkout_link TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create a function to initialize free subscription
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_type, event_limit)
  VALUES (new.id, 'free', 1);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 5. Backfill existing users (if any)
-- This is safe to run multiple times due to ON CONFLICT
INSERT INTO public.user_subscriptions (user_id, plan_type, event_limit)
SELECT id, 'free', 1 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Subscription policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Payment records policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payment_records;
CREATE POLICY "Users can view their own payments" ON payment_records
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Function to update events_used
CREATE OR REPLACE FUNCTION update_events_used()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_subscriptions SET events_used = (
      SELECT count(*) FROM events WHERE user_id = NEW.user_id
    ) WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_subscriptions SET events_used = (
      SELECT count(*) FROM events WHERE user_id = OLD.user_id
    ) WHERE user_id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger for events table
DROP TRIGGER IF EXISTS on_event_count_change ON events;
CREATE TRIGGER on_event_count_change
  AFTER INSERT OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION update_events_used();

-- 10. Update events_used for all existing users
UPDATE user_subscriptions us
SET events_used = (SELECT count(*) FROM events e WHERE e.user_id = us.user_id);
