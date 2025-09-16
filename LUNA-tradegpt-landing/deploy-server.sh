#!/bin/bash

# Simple deploy script for TradeGPT Landing Page (run on server)
# Server IP: 36.50.55.209

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

print_status "Building Docker image..."
if command -v docker-compose &> /dev/null; then
    sudo docker-compose build
else
    sudo docker compose build
fi

print_status "Stopping existing containers..."
if command -v docker-compose &> /dev/null; then
    sudo docker-compose down || true
else
    sudo docker compose down || true
fi

print_status "Starting new containers..."
if command -v docker-compose &> /dev/null; then
    sudo docker-compose up -d
else
    sudo docker compose up -d
fi

print_status "Checking container status..."
sudo docker ps

print_status "Deployment completed successfully!"
print_status "Your application is now running at: http://36.50.55.209"
print_status "To view logs: sudo docker-compose logs -f"
print_status "To stop: sudo docker-compose down"
