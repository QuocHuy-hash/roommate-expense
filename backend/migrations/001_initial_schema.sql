-- ========================================
-- COMPLETE MIGRATION SCRIPT
-- Chi Tiêu Dúng Application Database Setup
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. SESSIONS TABLE (for session storage)
-- ========================================
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for sessions
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- ========================================
-- 2. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 3. EXPENSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    payer_id VARCHAR NOT NULL REFERENCES users(id),
    is_shared BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Migration 002: Add is_settled column
    is_settled BOOLEAN NOT NULL DEFAULT false,
    -- Migration 003/004: Add payment tracking
    is_paid BOOLEAN NOT NULL DEFAULT false,
    payment_date TIMESTAMP NULL
);

-- ========================================
-- 4. SETTLEMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id VARCHAR NOT NULL REFERENCES users(id),
    payee_id VARCHAR NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 5. PAYMENT HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NULL REFERENCES settlements(id) ON DELETE CASCADE,
    payer_id VARCHAR NOT NULL REFERENCES users(id),
    payee_id VARCHAR NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    payment_proof_url TEXT,
    payment_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 6. PAID EXPENSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS paid_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_history_id UUID NOT NULL REFERENCES payment_history(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Ensure one expense can only be paid once per payment
    UNIQUE(payment_history_id, expense_id)
);

-- ========================================
-- CREATE ALL INDEXES
-- ========================================

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_payer_id ON expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_paid ON expenses(is_paid);

-- Settlements indexes
CREATE INDEX IF NOT EXISTS idx_settlements_payer_id ON settlements(payer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payee_id ON settlements(payee_id);
CREATE INDEX IF NOT EXISTS idx_settlements_created_at ON settlements(created_at DESC);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_payer ON payment_history(payer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payee ON payment_history(payee_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_settlement ON payment_history(settlement_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date);

-- Paid expenses indexes
CREATE INDEX IF NOT EXISTS idx_paid_expenses_payment ON paid_expenses(payment_history_id);
CREATE INDEX IF NOT EXISTS idx_paid_expenses_expense ON paid_expenses(expense_id);

-- ========================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE sessions IS 'Session storage for user authentication';
COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE expenses IS 'Individual expenses and shared costs';
COMMENT ON TABLE settlements IS 'Settlement records between users';
COMMENT ON TABLE payment_history IS 'Tracks all payment transactions between users';
COMMENT ON TABLE paid_expenses IS 'Links expenses that were covered by specific payments';

COMMENT ON COLUMN expenses.is_settled IS 'Indicates whether the shared expense has been settled by the other party';
COMMENT ON COLUMN expenses.is_paid IS 'Indicates whether this expense has been paid back by the debtor';
COMMENT ON COLUMN expenses.payment_date IS 'Date when this expense was paid back';

-- ========================================
-- INSERT TEST DATA (Optional)
-- ========================================
INSERT INTO users (email, password_hash, first_name, last_name) 
VALUES ('admin@chitieudung.com', '$2a$10$XYZ...', 'Admin', 'User') 
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- This script combines all migrations:
-- - 001_initial_schema.sql
-- - 002_add_is_settled_to_expenses.sql  
-- - 003_add_payment_history.sql
-- - 003_add_payment_system.sql (consolidated)
--
-- Run this script to set up the complete database schema
-- for the Chi Tiêu Dúng application.
-- ========================================