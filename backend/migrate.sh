#!/bin/bash

# Đọc DATABASE_URL từ .env file
source .env

echo "🚀 Running database migrations..."
echo "Database: $DATABASE_URL"

# Chạy migration file
psql "$DATABASE_URL" -f migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
