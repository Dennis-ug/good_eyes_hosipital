#!/bin/bash

# iSante Healthcare System - Deployment Script
# This script deploys the application to the production server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  iSante Deployment Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Configuration
SERVER_IP="${SERVER_IP:-161.35.46.156}"
SERVER_USER="workflow"
PROJECT_PATH="/home/workflow/projects/isante_project"

# Function to check if running on the target server
check_server() {
    if [ "$(hostname -I | grep -o $SERVER_IP)" != "$SERVER_IP" ]; then
        print_warning "This script is designed to run on the target server ($SERVER_IP)"
        print_warning "Current server IP: $(hostname -I)"
        print_warning "Current user: $USER (expected: $SERVER_USER)"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
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
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_status "All prerequisites are satisfied."
}

# Function to backup current deployment
backup_deployment() {
    print_status "Creating backup of current deployment..."
    
    BACKUP_DIR="/tmp/isante-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup docker-compose.yml
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$BACKUP_DIR/"
    fi
    
    # Backup environment files
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
    fi
    
    print_status "Backup created at: $BACKUP_DIR"
}

# Function to pull latest changes
pull_changes() {
    print_status "Pulling latest changes from git..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please clone the repository first."
        exit 1
    fi
    
    # Fetch latest changes
    git fetch origin
    
    # Check if there are new changes
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        print_warning "No new changes to deploy."
        return 0
    fi
    
    # Pull changes
    git pull origin main
    
    print_status "Latest changes pulled successfully."
}

# Function to stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down || true
        print_status "Containers stopped."
    else
        print_warning "No docker-compose.yml found. Skipping container stop."
    fi
}

# Function to clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Remove unused images
    docker image prune -f || true
    
    # Remove unused containers
    docker container prune -f || true
    
    # Remove unused networks
    docker network prune -f || true
    
    print_status "Docker cleanup completed."
}

# Function to build and start containers
deploy_containers() {
    print_status "Building and starting containers..."
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found. Cannot deploy."
        exit 1
    fi
    
    # Build and start containers
    docker-compose up -d --build
    
    print_status "Containers started successfully."
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for initial startup
    sleep 30
    
    # Check service status
    print_status "Checking service status..."
    docker-compose ps
    
    # Wait for services to be fully ready
    print_status "Waiting for services to be fully ready..."
    sleep 60
}

# Function to perform health checks
health_check() {
    print_status "Performing health checks..."
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some containers are not running."
        docker-compose logs
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "✅ Frontend health check passed"
    else
        print_warning "❌ Frontend health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:5025/api/auth/test > /dev/null 2>&1; then
        print_status "✅ Backend health check passed"
    else
        print_warning "❌ Backend health check failed"
    fi
    
    # Check pgAdmin
    if curl -f http://localhost:5050/misc/ping > /dev/null 2>&1; then
        print_status "✅ pgAdmin health check passed"
    else
        print_warning "❌ pgAdmin health check failed"
    fi
}

# Function to show deployment summary
show_summary() {
    print_header
    echo "🎯 Deployment Summary"
    echo "==================="
    echo "Server: $SERVER_IP"
    echo "Status: Completed"
    echo ""
    echo "Services Deployed:"
    echo "- Frontend (Next.js): http://$SERVER_IP:3000"
    echo "- Backend (Spring Boot): http://$SERVER_IP:5025"
    echo "- Database (PostgreSQL): $SERVER_IP:5432"
    echo "- Database Admin (pgAdmin): http://$SERVER_IP:5050"
    echo ""
    echo "Deployment completed at: $(date)"
    echo ""
    
    # Show current service status
    print_status "Current service status:"
    docker-compose ps
}

# Function to rollback deployment
rollback() {
    print_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down || true
    
    # Restore from backup if available
    BACKUP_DIRS=(/tmp/isante-backup-*)
    if [ ${#BACKUP_DIRS[@]} -gt 0 ]; then
        LATEST_BACKUP=$(ls -td /tmp/isante-backup-* | head -1)
        print_status "Restoring from backup: $LATEST_BACKUP"
        
        if [ -f "$LATEST_BACKUP/docker-compose.yml" ]; then
            cp "$LATEST_BACKUP/docker-compose.yml" .
        fi
        
        if [ -f "$LATEST_BACKUP/.env" ]; then
            cp "$LATEST_BACKUP/.env" .
        fi
        
        # Start containers
        docker-compose up -d
        print_status "Rollback completed."
    else
        print_error "No backup found for rollback."
    fi
}

# Main deployment function
main_deploy() {
    print_header
    
    # Check if running on target server
    check_server
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    backup_deployment
    
    # Pull latest changes
    pull_changes
    
    # Stop existing containers
    stop_containers
    
    # Clean up Docker resources
    cleanup_docker
    
    # Deploy containers
    deploy_containers
    
    # Wait for services
    wait_for_services
    
    # Health check
    health_check
    
    # Show summary
    show_summary
    
    print_status "🎉 Deployment completed successfully!"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  rollback  Rollback to previous deployment"
    echo "  status    Show current service status"
    echo "  logs      Show service logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 rollback"
    echo "  $0 status"
    echo ""
}

# Main script logic
main() {
    case "${1:-deploy}" in
        deploy)
            main_deploy
            ;;
        rollback)
            rollback
            ;;
        status)
            docker-compose ps
            ;;
        logs)
            docker-compose logs -f
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
