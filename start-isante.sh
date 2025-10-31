#!/bin/bash

# iSante Healthcare System - Docker Management Script

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
    echo -e "${BLUE}  iSante Healthcare System${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed or not in PATH."
        exit 1
    fi
}

# Function to start all services
start_services() {
    print_status "Starting iSante Healthcare System..."
    print_status "This may take a few minutes on first run..."
    
    docker-compose up -d
    
    print_status "Services started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:5025"
    print_status "pgAdmin (Database): http://localhost:5050"
    print_status "Database: localhost:5432"
    
    print_warning "Please wait a few minutes for all services to fully initialize."
}

# Function to stop all services
stop_services() {
    print_status "Stopping iSante Healthcare System..."
    docker-compose down
    print_status "Services stopped successfully!"
}

# Function to restart all services
restart_services() {
    print_status "Restarting iSante Healthcare System..."
    docker-compose down
    docker-compose up -d
    print_status "Services restarted successfully!"
}

# Function to show status
show_status() {
    print_status "Current service status:"
    docker-compose ps
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services (press Ctrl+C to exit):"
        docker-compose logs -f
    else
        print_status "Showing logs for $service (press Ctrl+C to exit):"
        docker-compose logs -f "$service"
    fi
}

# Function to rebuild services
rebuild_services() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Rebuilding all services..."
        docker-compose down
        docker-compose up -d --build
    else
        print_status "Rebuilding $service..."
        docker-compose up -d --build "$service"
    fi
    print_status "Rebuild completed!"
}

# Function to clean up everything
cleanup() {
    print_warning "This will stop all services and remove all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  logs      Show logs (all services)"
    echo "  logs [service] Show logs for specific service (backend/frontend/postgres)"
    echo "  rebuild   Rebuild all services"
    echo "  rebuild [service] Rebuild specific service"
    echo "  cleanup   Stop services and remove all data"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 rebuild frontend"
    echo ""
}

# Main script logic
main() {
    check_docker
    check_docker_compose
    
    case "${1:-help}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        rebuild)
            rebuild_services "$2"
            ;;
        cleanup)
            cleanup
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
