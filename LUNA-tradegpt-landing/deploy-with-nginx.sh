#!/bin/bash

# Deploy TradeGPT Landing Page with Nginx reverse proxy
# This script configures Nginx server to proxy to Docker container

set -e

echo "🚀 Deploying TradeGPT Landing Page with Nginx reverse proxy..."

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

# Step 1: Stop existing containers
print_status "Stopping existing containers..."
sudo docker-compose down || true

# Step 2: Build Docker image
print_status "Building Docker image..."
sudo docker-compose build

# Step 3: Start Docker container
print_status "Starting Docker container on port 8082..."
sudo docker-compose up -d

# Step 4: Wait for container to start
print_status "Waiting for container to start..."
sleep 5

# Step 5: Configure Nginx server
print_status "Configuring Nginx server..."

# Backup existing default config
if [ -f /etc/nginx/sites-enabled/default ]; then
    print_status "Backing up existing Nginx config..."
    sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
fi

# Copy our config
sudo cp nginx-server.conf /etc/nginx/sites-available/tradegpt-landing

# Enable our site
sudo ln -sf /etc/nginx/sites-available/tradegpt-landing /etc/nginx/sites-enabled/tradegpt-landing

# Disable default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid!"
    
    # Reload Nginx
    print_status "Reloading Nginx..."
    sudo systemctl reload nginx
    
    print_status "✅ Deployment completed successfully!"
    print_status "🌐 Your application is now running at:"
    print_status "   https://tradegpt.live"
    print_status "   https://www.tradegpt.live"
    print_status ""
    print_status "📋 Container status:"
    sudo docker ps | grep tradegpt-landing-app
    print_status ""
    print_status "📋 Useful commands:"
    print_status "   View container logs: sudo docker-compose logs -f"
    print_status "   View Nginx logs: sudo tail -f /var/log/nginx/tradegpt-landing.access.log"
    print_status "   Stop application: sudo docker-compose down"
    print_status "   Restart Nginx: sudo systemctl restart nginx"
else
    print_error "Nginx configuration test failed!"
    print_status "Restoring backup configuration..."
    sudo cp /etc/nginx/sites-enabled/default.backup /etc/nginx/sites-enabled/default
    sudo systemctl reload nginx
    exit 1
fi
