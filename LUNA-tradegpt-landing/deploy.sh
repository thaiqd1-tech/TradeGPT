#!/bin/bash

# Deploy script for TradeGPT Landing Page
# Server IP: 36.50.55.209

set -e

echo "🚀 Starting deployment process..."

# Configuration
SERVER_IP="36.50.55.209"
SERVER_USER="root"  # Change this to your server username
APP_NAME="tradegpt-landing"
DEPLOY_DIR="/var/www/$APP_NAME"

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

# Check if Docker is installed locally
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed locally
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Building Docker image..."
docker-compose build

print_status "Saving Docker image..."
docker save tradegpt-landing_tradegpt-landing:latest | gzip > tradegpt-landing.tar.gz

print_status "Uploading files to server..."
scp tradegpt-landing.tar.gz docker-compose.yml nginx/default.conf $SERVER_USER@$SERVER_IP:/tmp/

print_status "Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    set -e
    
    # Create deployment directory
    sudo mkdir -p /var/www/tradegpt-landing
    cd /var/www/tradegpt-landing
    
    # Copy files from temp
    sudo cp /tmp/docker-compose.yml .
    sudo cp /tmp/nginx/default.conf ./nginx/default.conf
    sudo mkdir -p nginx
    
    # Load Docker image
    sudo docker load < /tmp/tradegpt-landing.tar.gz
    
    # Stop existing containers
    sudo docker-compose down || true
    
    # Start new containers
    sudo docker-compose up -d
    
    # Clean up temp files
    sudo rm -f /tmp/tradegpt-landing.tar.gz
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Application is running at: http://36.50.55.209"
EOF

# Clean up local files
rm -f tradegpt-landing.tar.gz

print_status "Deployment completed successfully!"
print_status "Your application is now running at: http://36.50.55.209"
