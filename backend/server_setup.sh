#!/bin/bash
set -e

# ================================
# Script: server_setup.sh
# Mục đích: Cài đặt Docker + Docker Compose và chạy backend + PostgreSQL
# Hệ điều hành: Ubuntu 20.04/22.04
# ================================

echo "=== Cập nhật hệ thống ==="
sudo apt update -y && sudo apt upgrade -y

echo "=== Cài đặt các gói cần thiết ==="
sudo apt install -y curl git apt-transport-https ca-certificates software-properties-common

echo "=== Cài đặt Docker ==="
if ! command -v docker &> /dev/null
then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
else
    echo "Docker đã được cài đặt."
fi

echo "=== Cài đặt Docker Compose ==="
if ! command -v docker-compose &> /dev/null
then
    sudo curl -L "https://github.com/docker/compose/releases/download/2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose đã được cài đặt."
fi

echo "=== Build và chạy container ==="
docker-compose down
docker-compose build
docker-compose up -d

echo "=== Server setup hoàn tất ==="
echo "Backend chạy tại: http://localhost:3000"
echo "Postgres chạy tại: localhost:5432 (user: postgres, password: postgres, db: roommate_db)"
