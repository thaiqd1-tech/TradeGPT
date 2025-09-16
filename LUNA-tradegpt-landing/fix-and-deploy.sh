#!/bin/bash

# Script to fix port 80 conflict and deploy TradeGPT Landing Page

set -e

echo "🔧 Fixing port conflicts and deploying..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check what's using port 80
print_status "Checking what's using port 80..."
if sudo netstat -tlnp | grep :80 > /dev/null; then
    print_warning "Port 80 is in use. Checking what service..."
    sudo netstat -tlnp | grep :80
    echo ""
    print_warning "Stopping services using port 80..."
    
    # Stop Apache if running
    if sudo systemctl is-active --quiet apache2; then
        print_status "Stopping Apache..."
        sudo systemctl stop apache2
        sudo systemctl disable apache2
    fi
    
    # Stop Nginx if running
    if sudo systemctl is-active --quiet nginx; then
        print_status "Stopping Nginx..."
        sudo systemctl stop nginx
        sudo systemctl disable nginx
    fi
    
    # Kill any process using port 80
    sudo fuser -k 80/tcp 2>/dev/null || true
fi

# Clean up existing containers
print_status "Cleaning up existing containers..."
sudo docker-compose down || true
sudo docker system prune -f || true

# Build and start
print_status "Building and starting application..."
sudo docker-compose build
sudo docker-compose up -d

# Wait a moment for container to start
sleep 5

# Check status
print_status "Checking container status..."
sudo docker ps

print_status "✅ Deployment completed!"
print_status "🌐 Your application is now running at:"
print_status "   http://36.50.55.209:8080"
print_status "   http://localhost:8080"
print_status ""
print_status "📋 Useful commands:"
print_status "   View logs: sudo docker-compose logs -f"
print_status "   Stop app: sudo docker-compose down"
print_status "   Restart: sudo docker-compose restart"
