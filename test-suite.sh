#!/bin/bash

# iSante Healthcare System - Comprehensive Test Suite
# This script runs all tests to validate the application before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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
    echo -e "${BLUE}  iSante Test Suite${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Running test: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_status "Java version: $JAVA_VERSION"
    else
        print_error "Java is not installed"
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker version: $DOCKER_VERSION"
    else
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker Compose version: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check Maven
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn --version | head -n 1 | cut -d' ' -f3)
        print_status "Maven version: $MVN_VERSION"
    else
        print_error "Maven is not installed"
        exit 1
    fi
}

# Function to test backend
test_backend() {
    print_status "Testing backend application..."
    
    cd eyesante-backend
    
    # Test Maven build
    run_test "Maven Clean" "mvn clean"
    run_test "Maven Compile" "mvn compile"
    run_test "Maven Test" "mvn test -DskipTests=false"
    run_test "Maven Package" "mvn package -DskipTests"
    
    # Test Docker build
    run_test "Backend Docker Build" "docker build -t test-backend ."
    
    # Clean up
    docker rmi test-backend 2>/dev/null || true
    
    cd ..
}

# Function to test frontend
test_frontend() {
    print_status "Testing frontend application..."
    
    cd isante-front-end
    
    # Install dependencies
    run_test "NPM Install" "npm ci"
    
    # Test linting
    run_test "ESLint" "npm run lint"
    
    # Test build
    run_test "Next.js Build" "npm run build"
    
    # Test Docker build
    run_test "Frontend Docker Build" "docker build -t test-frontend ."
    
    # Clean up
    docker rmi test-frontend 2>/dev/null || true
    
    cd ..
}

# Function to test Docker Compose
test_docker_compose() {
    print_status "Testing Docker Compose configuration..."
    
    # Validate docker-compose.yml
    run_test "Docker Compose Config" "docker-compose config"
    
    # Test service definitions
    run_test "PostgreSQL Service" "grep -q 'postgres:' docker-compose.yml"
    run_test "Backend Service" "grep -q 'backend:' docker-compose.yml"
    run_test "Frontend Service" "grep -q 'frontend:' docker-compose.yml"
    run_test "pgAdmin Service" "grep -q 'pgadmin:' docker-compose.yml"
}

# Function to test database
test_database() {
    print_status "Testing database configuration..."
    
    cd eyesante-backend
    
    # Check migration files
    run_test "Migration Files Exist" "ls src/main/resources/db/migration/*.sql > /dev/null 2>&1"
    
    # Check init.sql
    run_test "Init SQL Exists" "test -f init.sql"
    
    cd ..
}

# Function to test security
test_security() {
    print_status "Running security checks..."
    
    # Check for hardcoded secrets
    if grep -r "password.*=" . --include="*.java" --include="*.ts" --include="*.js" --include="*.yml" --include="*.yaml" | grep -v "test\|example\|TODO" > /dev/null 2>&1; then
        print_warning "Potential hardcoded passwords found"
    else
        run_test "No Hardcoded Passwords" "true"
    fi
    
    # Check for exposed ports
    if grep -r "0.0.0.0:" . --include="*.yml" --include="*.yaml" | grep -v "127.0.0.1" > /dev/null 2>&1; then
        print_warning "Services might be exposed to all interfaces"
    else
        run_test "Port Security" "true"
    fi
    
    # Check JWT secret
    if grep -q "your-super-secret-jwt-key" docker-compose.yml; then
        print_warning "Default JWT secret detected - should be changed in production"
    else
        run_test "JWT Secret Configuration" "true"
    fi
}

# Function to test code quality
test_code_quality() {
    print_status "Running code quality checks..."
    
    # Count TODO/FIXME comments
    TODO_COUNT=$(grep -r "TODO\|FIXME" . --include="*.java" --include="*.ts" --include="*.js" --include="*.tsx" | wc -l)
    echo "Found $TODO_COUNT TODO/FIXME comments"
    
    # Check for console.log in production code
    CONSOLE_COUNT=$(grep -r "console.log" isante-front-end/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
    if [ $CONSOLE_COUNT -gt 0 ]; then
        print_warning "Found $CONSOLE_COUNT console.log statements in frontend code"
    else
        run_test "No Console Logs in Production" "true"
    fi
    
    # Check file structure
    run_test "Backend Structure" "test -d eyesante-backend/src/main/java"
    run_test "Frontend Structure" "test -d isante-front-end/app"
    run_test "Docker Files" "test -f docker-compose.yml"
}

# Function to test documentation
test_documentation() {
    print_status "Checking documentation..."
    
    # Check API documentation
    if [ -f "eyesante-backend/API_DOCUMENTATION.md" ]; then
        run_test "API Documentation" "true"
    else
        print_warning "API documentation not found"
    fi
    
    # Check README files
    run_test "Main README" "test -f README.md"
    run_test "Docker README" "test -f DOCKER_README.md"
    run_test "Deployment README" "test -f DEPLOYMENT_SETUP.md"
    
    # Check environment example
    if [ -f "env.example" ]; then
        run_test "Environment Example" "true"
    else
        print_warning "Environment example file not found"
    fi
}

# Function to test integration
test_integration() {
    print_status "Running integration tests..."
    
    # Start services
    print_status "Starting test services..."
    docker-compose up -d postgres
    
    # Wait for database
    print_status "Waiting for database to be ready..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U eyesante_admin -d eyesante_db; do sleep 2; done'
    
    # Test database connection
    run_test "Database Connection" "docker-compose exec -T postgres psql -U eyesante_admin -d eyesante_db -c 'SELECT 1;' > /dev/null 2>&1"
    
    # Start backend
    docker-compose up -d backend
    
    # Wait for backend
    print_status "Waiting for backend to be ready..."
    timeout 120 bash -c 'until curl -f http://localhost:5025/api/auth/test > /dev/null 2>&1; do sleep 5; done'
    
    # Test API
    run_test "Backend API" "curl -f http://localhost:5025/api/auth/test > /dev/null 2>&1"
    
    # Cleanup
    docker-compose down -v
}

# Function to test performance
test_performance() {
    print_status "Running performance checks..."
    
    # Test frontend build size
    cd isante-front-end
    npm run build > /dev/null 2>&1
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "Frontend build size: $BUILD_SIZE"
    
    # Test backend JAR size
    cd ../eyesante-backend
    mvn clean package -DskipTests > /dev/null 2>&1
    JAR_SIZE=$(find target -name "*.jar" -exec du -h {} \; 2>/dev/null | head -1)
    echo "Backend JAR size: $JAR_SIZE"
    
    cd ..
}

# Function to show test summary
show_summary() {
    print_header
    echo "🎯 Test Summary"
    echo "=============="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Application is ready for deployment.${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please fix the issues before deployment.${NC}"
        exit 1
    fi
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend     Test only backend"
    echo "  --frontend    Test only frontend"
    echo "  --docker      Test only Docker configuration"
    echo "  --security    Test only security checks"
    echo "  --integration Test only integration tests"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 --backend          # Test only backend"
    echo "  $0 --frontend --docker # Test frontend and Docker"
    echo ""
}

# Main test function
main_tests() {
    print_header
    
    check_prerequisites
    
    # Parse command line arguments
    if [ $# -eq 0 ]; then
        # Run all tests
        test_backend
        test_frontend
        test_docker_compose
        test_database
        test_security
        test_code_quality
        test_documentation
        test_integration
        test_performance
    else
        # Run specific tests based on arguments
        for arg in "$@"; do
            case $arg in
                --backend)
                    test_backend
                    ;;
                --frontend)
                    test_frontend
                    ;;
                --docker)
                    test_docker_compose
                    ;;
                --security)
                    test_security
                    ;;
                --integration)
                    test_integration
                    ;;
                --help|-h)
                    show_help
                    exit 0
                    ;;
                *)
                    print_error "Unknown option: $arg"
                    show_help
                    exit 1
                    ;;
            esac
        done
    fi
    
    show_summary
}

# Run main function with all arguments
main_tests "$@"
