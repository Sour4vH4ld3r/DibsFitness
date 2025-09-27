#!/bin/bash

# DibsFitness Docker Deployment Script
# This script deploys the DibsFitness Next.js application to production using Docker
# Usage: ./deploy-dibsfitness.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="dibsfitness"
APP_DIR="/var/www/projects.orbitdynamix.in/DibsFitness"
BACKUP_DIR="/var/backups/dibsfitness"
ENV_FILE=".env.production"
DOCKER_REGISTRY="" # Add your Docker registry if using one

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if running as appropriate user
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Consider running as a non-root user with docker permissions."
    fi
    
    print_status "Prerequisites check completed"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamp for backup
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    
    # Check if app directory exists and create backup
    if [ -d "$APP_DIR" ]; then
        tar -czf "$BACKUP_FILE" -C "$APP_DIR" . 2>/dev/null || true
        print_status "Backup created: $BACKUP_FILE"
    else
        print_warning "No existing installation found to backup"
    fi
}

# Function to prepare deployment directory
prepare_directory() {
    print_status "Preparing deployment directory..."
    
    # Create directory if it doesn't exist
    sudo mkdir -p "$APP_DIR"
    
    # Change to app directory
    cd "$APP_DIR"
    
    print_status "Directory prepared: $APP_DIR"
}

# Function to copy deployment files
copy_files() {
    print_status "Copying deployment files..."
    
    # Copy necessary files (adjust source path as needed)
    # This assumes you're copying from current directory or a git repo
    
    # If copying from current directory
    if [ -f "./Dockerfile" ]; then
        sudo cp Dockerfile "$APP_DIR/"
        sudo cp docker-compose.yml "$APP_DIR/"
        sudo cp .dockerignore "$APP_DIR/" 2>/dev/null || true
        sudo cp -r ./src "$APP_DIR/" 2>/dev/null || true
        sudo cp -r ./public "$APP_DIR/" 2>/dev/null || true
        sudo cp -r ./app "$APP_DIR/" 2>/dev/null || true
        sudo cp package*.json "$APP_DIR/"
        sudo cp next.config.* "$APP_DIR/" 2>/dev/null || true
        sudo cp tsconfig.json "$APP_DIR/" 2>/dev/null || true
    else
        print_error "Source files not found. Please run from project directory or clone from git."
        exit 1
    fi
    
    print_status "Files copied successfully"
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if .env.production exists in current directory
    if [ -f "$ENV_FILE" ]; then
        sudo cp "$ENV_FILE" "$APP_DIR/.env"
        print_status "Environment file copied"
    else
        # Check if .env.example exists and copy it
        if [ -f ".env.example" ]; then
            sudo cp .env.example "$APP_DIR/.env"
            print_warning ".env.production not found. Copied .env.example - Please update with production values!"
            print_warning "Edit the file at: $APP_DIR/.env"
            read -p "Press Enter to continue after updating .env file..."
        else
            print_error "No environment file found. Please create .env.production"
            exit 1
        fi
    fi
    
    # Set proper permissions
    sudo chmod 600 "$APP_DIR/.env"
}

# Function to build Docker image
build_docker_image() {
    print_status "Building Docker image..."
    
    cd "$APP_DIR"
    
    # Build with docker-compose
    sudo docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully"
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Function to stop old containers
stop_old_containers() {
    print_status "Stopping old containers..."
    
    cd "$APP_DIR"
    
    # Stop and remove old containers
    sudo docker-compose down 2>/dev/null || true
    
    # Remove old containers with the same name
    sudo docker rm -f ${APP_NAME}-app 2>/dev/null || true
    sudo docker rm -f ${APP_NAME}-redis 2>/dev/null || true
    sudo docker rm -f ${APP_NAME}-db 2>/dev/null || true
    
    print_status "Old containers stopped"
}

# Function to start new containers
start_containers() {
    print_status "Starting new containers..."
    
    cd "$APP_DIR"
    
    # Start containers in detached mode
    sudo docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_status "Containers started successfully"
    else
        print_error "Failed to start containers"
        exit 1
    fi
}

# Function to setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create Nginx config for subdirectory
    sudo tee /etc/nginx/sites-available/dibsfitness > /dev/null <<EOF
# DibsFitness - Subdirectory configuration
# This should be included in the projects.orbitdynamix.in server block

location /DibsFitness {
    # Remove /DibsFitness from the request before passing to app
    rewrite ^/DibsFitness(.*)$ \$1 break;
    
    # Proxy to Docker container
    proxy_pass http://localhost:3010;
    
    # Proxy headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-Prefix /DibsFitness;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffers
    proxy_buffers 8 16k;
    proxy_buffer_size 32k;
}

# Static assets with /DibsFitness prefix
location ~ ^/DibsFitness/(_next/static|_next/image|favicon.ico) {
    proxy_pass http://localhost:3010;
    proxy_cache_valid 200 60m;
    proxy_cache_bypass \$http_pragma \$http_authorization;
    add_header Cache-Control "public, max-age=3600, immutable";
}
EOF
    
    print_warning "Nginx configuration created. Add the following to your projects.orbitdynamix.in server block:"
    print_warning "include /etc/nginx/sites-available/dibsfitness;"
    
    # Test Nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "Nginx configuration applied"
    else
        print_error "Nginx configuration test failed"
    fi
}

# Function to check deployment health
check_health() {
    print_status "Checking deployment health..."
    
    # Wait for container to be ready
    sleep 10
    
    # Check if containers are running
    if sudo docker ps | grep -q ${APP_NAME}-app; then
        print_status "Container is running"
    else
        print_error "Container is not running"
        sudo docker-compose logs --tail=50
        exit 1
    fi
    
    # Check health endpoint
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/api/health || echo "000")
    
    if [ "$HEALTH_CHECK" = "200" ]; then
        print_status "Health check passed"
    else
        print_warning "Health check returned: $HEALTH_CHECK"
    fi
    
    # Check main URL
    MAIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://projects.orbitdynamix.in/DibsFitness || echo "000")
    
    if [ "$MAIN_CHECK" = "200" ] || [ "$MAIN_CHECK" = "301" ] || [ "$MAIN_CHECK" = "302" ]; then
        print_status "Main URL is accessible"
    else
        print_warning "Main URL returned: $MAIN_CHECK"
    fi
}

# Function to cleanup old images
cleanup() {
    print_status "Cleaning up old Docker images..."
    
    # Remove unused images
    sudo docker image prune -f
    
    # Remove unused volumes
    sudo docker volume prune -f
    
    print_status "Cleanup completed"
}

# Function to show logs
show_logs() {
    print_status "Showing recent logs..."
    
    cd "$APP_DIR"
    sudo docker-compose logs --tail=50
}

# Function to rollback deployment
rollback() {
    print_error "Rolling back deployment..."
    
    # Find the latest backup
    if [ -d "$BACKUP_DIR" ]; then
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | head -1)
        
        if [ -n "$LATEST_BACKUP" ]; then
            print_status "Restoring from backup: $LATEST_BACKUP"
            
            # Stop containers
            cd "$APP_DIR"
            sudo docker-compose down
            
            # Restore backup
            sudo rm -rf "$APP_DIR"/*
            sudo tar -xzf "$LATEST_BACKUP" -C "$APP_DIR"
            
            # Start containers
            sudo docker-compose up -d
            
            print_status "Rollback completed"
        else
            print_error "No backup found for rollback"
        fi
    else
        print_error "Backup directory not found"
    fi
}

# Main deployment flow
main() {
    echo "======================================"
    echo "DibsFitness Docker Deployment Script"
    echo "======================================"
    echo ""
    
    # Parse command line arguments
    case "${1:-deploy}" in
        deploy)
            check_prerequisites
            create_backup
            prepare_directory
            copy_files
            setup_environment
            stop_old_containers
            build_docker_image
            start_containers
            setup_nginx
            check_health
            cleanup
            
            echo ""
            print_status "Deployment completed successfully!"
            echo ""
            echo "Access your application at: https://projects.orbitdynamix.in/DibsFitness"
            echo ""
            echo "Useful commands:"
            echo "  View logs: sudo docker-compose -f $APP_DIR/docker-compose.yml logs -f"
            echo "  Stop app: sudo docker-compose -f $APP_DIR/docker-compose.yml down"
            echo "  Start app: sudo docker-compose -f $APP_DIR/docker-compose.yml up -d"
            echo "  Restart app: sudo docker-compose -f $APP_DIR/docker-compose.yml restart"
            ;;
        
        rollback)
            rollback
            ;;
        
        logs)
            show_logs
            ;;
        
        stop)
            cd "$APP_DIR"
            sudo docker-compose down
            print_status "Application stopped"
            ;;
        
        start)
            cd "$APP_DIR"
            sudo docker-compose up -d
            print_status "Application started"
            ;;
        
        restart)
            cd "$APP_DIR"
            sudo docker-compose restart
            print_status "Application restarted"
            ;;
        
        status)
            cd "$APP_DIR"
            sudo docker-compose ps
            ;;
        
        *)
            echo "Usage: $0 {deploy|rollback|logs|stop|start|restart|status}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy the application"
            echo "  rollback - Rollback to previous deployment"
            echo "  logs     - Show application logs"
            echo "  stop     - Stop the application"
            echo "  start    - Start the application"
            echo "  restart  - Restart the application"
            echo "  status   - Show application status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"