#!/bin/bash

# Docker management scripts for Eyesante Frontend

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
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build and run production
production() {
    print_header "Starting Production Environment"
    check_docker
    
    print_status "Building and starting production containers..."
    docker-compose up --build -d
    
    print_status "Production environment is starting..."
    print_status "Access the application at: http://localhost:3000"
    print_status "View logs with: docker-compose logs -f"
}

# Function to build and run development
development() {
    print_header "Starting Development Environment"
    check_docker
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_status "Development environment is starting..."
    print_status "Access the application at: http://localhost:3000"
    print_status "View logs with: docker-compose -f docker-compose.dev.yml logs -f"
}

# Function to stop all containers
stop() {
    print_header "Stopping All Containers"
    check_docker
    
    print_status "Stopping production containers..."
    docker-compose down
    
    print_status "Stopping development containers..."
    docker-compose -f docker-compose.dev.yml down
    
    print_status "All containers stopped."
}

# Function to clean up everything
cleanup() {
    print_header "Cleaning Up Docker Environment"
    check_docker
    
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Stopping and removing all containers..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        
        print_status "Removing unused Docker resources..."
        docker system prune -f
        
        print_status "Cleanup completed."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to view logs
logs() {
    print_header "Viewing Logs"
    check_docker
    
    if [ "$1" = "dev" ]; then
        print_status "Showing development logs..."
        docker-compose -f docker-compose.dev.yml logs -f
    else
        print_status "Showing production logs..."
        docker-compose logs -f
    fi
}

# Function to rebuild containers
rebuild() {
    print_header "Rebuilding Containers"
    check_docker
    
    if [ "$1" = "dev" ]; then
        print_status "Rebuilding development containers..."
        docker-compose -f docker-compose.dev.yml up --build --force-recreate -d
    else
        print_status "Rebuilding production containers..."
        docker-compose up --build --force-recreate -d
    fi
}

# Function to show status
status() {
    print_header "Container Status"
    check_docker
    
    print_status "Production containers:"
    docker-compose ps
    
    echo ""
    print_status "Development containers:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to show help
help() {
    print_header "Docker Management Script"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod, production    Start production environment"
    echo "  dev, development    Start development environment"
    echo "  stop                Stop all containers"
    echo "  cleanup             Clean up all Docker resources"
    echo "  logs [dev]          View logs (dev for development)"
    echo "  rebuild [dev]       Rebuild containers (dev for development)"
    echo "  status              Show container status"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 prod             # Start production"
    echo "  $0 dev              # Start development"
    echo "  $0 logs dev         # View development logs"
    echo "  $0 rebuild          # Rebuild production containers"
}

# Main script logic
case "${1:-help}" in
    "prod"|"production")
        production
        ;;
    "dev"|"development")
        development
        ;;
    "stop")
        stop
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        logs "$2"
        ;;
    "rebuild")
        rebuild "$2"
        ;;
    "status")
        status
        ;;
    "help"|*)
        help
        ;;
esac 