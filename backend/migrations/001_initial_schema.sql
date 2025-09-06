-- Tạo extension cho UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng sessions (cho session storage)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Tạo index cho sessions
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    password_hash VARCHAR, -- Thêm password_hash để lưu mật khẩu
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng expenses (chi tiêu)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    payer_id VARCHAR NOT NULL REFERENCES users(id),
    is_shared BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng settlements (thanh toán)
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id VARCHAR NOT NULL REFERENCES users(id),
    payee_id VARCHAR NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_expenses_payer_id ON expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_payer_id ON settlements(payer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payee_id ON settlements(payee_id);
CREATE INDEX IF NOT EXISTS idx_settlements_created_at ON settlements(created_at DESC);

-- Tạo user mặc định cho testing (optional)
INSERT INTO users (email, password_hash, first_name, last_name) 
VALUES ('admin@chitieudung.com', '$2a$10$XYZ...', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;
