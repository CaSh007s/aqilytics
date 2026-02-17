-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscribers table (users)
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriber_cities table (preferences)
CREATE TABLE IF NOT EXISTS subscriber_cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscriber_id, city)
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_verified ON subscribers(is_verified);
CREATE INDEX IF NOT EXISTS idx_cities_subscriber ON subscriber_cities(subscriber_id);

-- Migration (if needed, manual execution recommended for production data)
-- INSERT INTO subscribers (email, is_verified, verification_token, created_at, updated_at)
-- SELECT DISTINCT email, is_verified, verification_token, created_at, updated_at FROM subscriptions
-- ON CONFLICT (email) DO NOTHING;

-- INSERT INTO subscriber_cities (subscriber_id, city)
-- SELECT s.id, old.city FROM subscribers s
-- JOIN subscriptions old ON s.email = old.email;

-- DROP TABLE IF EXISTS subscriptions;
