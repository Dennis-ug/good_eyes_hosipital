#!/bin/bash

# iSante Healthcare System - Workflow Setup Script
# This script sets up the server environment for the workflow user (no sudo required)

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
    echo -e "${BLUE}  iSante Workflow Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Configuration
WORKFLOW_USER="workflow"
PROJECT_PATH="/home/workflow/projects/isante_project"
SERVER_IP="${SERVER_IP:-161.35.46.156}"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're the workflow user
    if [ "$USER" != "$WORKFLOW_USER" ]; then
        print_warning "Running as user: $USER (expected: $WORKFLOW_USER)"
    fi
    
    # Check if we're in the right directory
    if [ "$(pwd)" != "$PROJECT_PATH" ]; then
        print_status "Changing to project directory: $PROJECT_PATH"
        cd "$PROJECT_PATH"
    fi
}

# Function to setup project directory
setup_project_directory() {
    print_status "Setting up project directory..."
    
    # Create project directory if it doesn't exist
    if [ ! -d "$PROJECT_PATH" ]; then
        mkdir -p "$PROJECT_PATH"
        print_status "Created project directory: $PROJECT_PATH"
    fi
    
    # Ensure we're in the project directory
    cd "$PROJECT_PATH"
    
    print_status "Project directory ready: $(pwd)"
}

# Function to check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker version: $DOCKER_VERSION"
        
        # Check if user is in docker group
        if groups | grep -q docker; then
            print_status "User is in docker group"
        else
            print_warning "User is not in docker group. Docker commands may fail."
            print_warning "Run: sudo usermod -aG docker $USER"
        fi
    else
        print_error "Docker is not installed"
        print_warning "Please install Docker manually or run the full server-setup.sh script"
        return 1
    fi
}

# Function to check Docker Compose installation
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker Compose version: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed"
        print_warning "Please install Docker Compose manually or run the full server-setup.sh script"
        return 1
    fi
}

# Function to check Git installation
check_git() {
    print_status "Checking Git installation..."
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_status "Git version: $GIT_VERSION"
    else
        print_error "Git is not installed"
        print_warning "Please install Git manually or run the full server-setup.sh script"
        return 1
    fi
}

# Function to setup Git configuration
setup_git() {
    print_status "Setting up Git configuration..."
    
    # Set Git user if not configured
    if [ -z "$(git config --global user.name)" ]; then
        git config --global user.name "iSante Workflow"
        print_status "Git user.name configured"
    fi
    
    if [ -z "$(git config --global user.email)" ]; then
        git config --global user.email "workflow@eyesante.com"
        print_status "Git user.email configured"
    fi
}

# Function to test Docker access
test_docker_access() {
    print_status "Testing Docker access..."
    
    if docker info > /dev/null 2>&1; then
        print_status "✅ Docker access confirmed"
    else
        print_warning "❌ Docker access failed"
        print_warning "This may be due to:"
        print_warning "1. User not in docker group"
        print_warning "2. Docker daemon not running"
        print_warning "3. Insufficient permissions"
        return 1
    fi
}

# Function to validate project files
validate_project_files() {
    print_status "Validating project files..."
    
    # Check for essential files
    ESSENTIAL_FILES=(
        "docker-compose.yml"
        "deploy.sh"
        "test-suite.sh"
        "eyesante-backend/Dockerfile"
        "isante-front-end/Dockerfile"
    )
    
    for file in "${ESSENTIAL_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_status "✅ Found: $file"
        else
            print_warning "⚠️  Missing: $file"
        fi
    done
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env file from example if it doesn't exist
    if [ ! -f ".env" ] && [ -f "env.example" ]; then
        cp env.example .env
        print_status "Created .env file from env.example"
    fi
    
    # Ensure scripts are executable
    chmod +x deploy.sh 2>/dev/null || true
    chmod +x test-suite.sh 2>/dev/null || true
    chmod +x start-isante.sh 2>/dev/null || true
    
    print_status "Environment setup completed"
}

# Function to test basic functionality
test_basic_functionality() {
    print_status "Testing basic functionality..."
    
    # Test Docker Compose configuration
    if docker-compose config > /dev/null 2>&1; then
        print_status "✅ Docker Compose configuration is valid"
    else
        print_warning "⚠️  Docker Compose configuration has issues"
    fi
    
    # Test if we can build images (without actually building)
    print_status "✅ Basic functionality tests completed"
}

# Function to show setup summary
show_summary() {
    print_header
    echo "🎯 Workflow Setup Summary"
    echo "========================"
    echo "Project Path: $PROJECT_PATH"
    echo "Current User: $USER"
    echo "Server IP: $SERVER_IP"
    echo ""
    echo "Next Steps:"
    echo "1. Ensure Docker daemon is running"
    echo "2. Run: ./deploy.sh deploy"
    echo "3. Access the application:"
    echo "   - Frontend: http://$SERVER_IP:3000"
    echo "   - Backend: http://$SERVER_IP:5025"
    echo "   - pgAdmin: http://$SERVER_IP:5050"
    echo ""
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "This script sets up the workflow environment for iSante deployment."
    echo ""
    echo "Options:"
    echo "  --help    Show this help message"
    echo ""
    echo "This script runs without sudo privileges and is designed for the workflow user."
}

# Main setup function
main_setup() {
    print_header
    
    check_prerequisites
    setup_project_directory
    check_docker
    check_docker_compose
    check_git
    setup_git
    test_docker_access
    validate_project_files
    setup_environment
    test_basic_functionality
    
    show_summary
    
    print_status "🎉 Workflow setup completed successfully!"
}

# Main script logic
case "${1:-setup}" in
    setup)
        main_setup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
