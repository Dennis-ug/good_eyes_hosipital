#!/bin/bash

# iSante Healthcare System - Server Setup Script
# This script sets up the server environment for the workflow user

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
    echo -e "${BLUE}  iSante Server Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Configuration
WORKFLOW_USER="workflow"
PROJECT_PATH="/home/workflow/projects/isante_project"
SERVER_IP="${SERVER_IP:-161.35.46.156}"

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to create workflow user
create_workflow_user() {
    print_status "Setting up workflow user..."
    
    # Check if workflow user exists
    if id "$WORKFLOW_USER" &>/dev/null; then
        print_status "User $WORKFLOW_USER already exists"
    else
        print_status "Creating user $WORKFLOW_USER..."
        useradd -m -s /bin/bash "$WORKFLOW_USER"
        print_status "User $WORKFLOW_USER created successfully"
    fi
    
    # Set password for workflow user
    print_warning "Setting password for $WORKFLOW_USER..."
    passwd "$WORKFLOW_USER"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    apt update
    
    # Install required packages
    apt install -y \
        curl \
        git \
        wget \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    print_status "System dependencies installed"
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    print_status "Docker installed successfully"
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    # Download Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    chmod +x /usr/local/bin/docker-compose
    
    # Create symlink
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_status "Docker Compose installed successfully"
}

# Function to setup project directory
setup_project_directory() {
    print_status "Setting up project directory..."
    
    # Create project directory
    mkdir -p "$PROJECT_PATH"
    
    # Set ownership to workflow user
    chown -R "$WORKFLOW_USER:$WORKFLOW_USER" "$(dirname "$PROJECT_PATH")"
    
    # Set proper permissions
    chmod 755 "$(dirname "$PROJECT_PATH")"
    chmod 755 "$PROJECT_PATH"
    
    print_status "Project directory created: $PROJECT_PATH"
}

# Function to configure SSH
configure_ssh() {
    print_status "Configuring SSH for password authentication..."
    
    # Backup SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Enable password authentication
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
    sed -i 's/PasswordAuthentication no/#PasswordAuthentication no/' /etc/ssh/sshd_config
    
    # Restart SSH service
    systemctl restart ssh
    
    print_status "SSH configured for password authentication"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Allow SSH
    ufw allow ssh
    
    # Allow application ports
    ufw allow 3000  # Frontend
    ufw allow 5025  # Backend
    ufw allow 5050  # pgAdmin
    ufw allow 5432  # PostgreSQL
    
    # Enable firewall
    ufw --force enable
    
    print_status "Firewall configured"
}

# Function to add workflow user to groups
setup_user_groups() {
    print_status "Setting up user groups..."
    
    # Add workflow user to docker group
    usermod -aG docker "$WORKFLOW_USER"
    
    # Add workflow user to sudo group (optional, for debugging)
    usermod -aG sudo "$WORKFLOW_USER"
    
    print_status "User groups configured"
}

# Function to test setup
test_setup() {
    print_status "Testing setup..."
    
    # Switch to workflow user and test
    sudo -u "$WORKFLOW_USER" bash -c "
        echo 'Testing workflow user setup...'
        cd $PROJECT_PATH
        echo 'Current directory: \$(pwd)'
        echo 'Current user: \$(whoami)'
        docker --version
        docker-compose --version
        git --version
    "
    
    print_status "Setup test completed"
}

# Function to show next steps
show_next_steps() {
    print_header
    echo "🎯 Server Setup Complete!"
    echo "========================"
    echo ""
    echo "Next steps:"
    echo "1. Clone the repository:"
    echo "   sudo su - workflow"
    echo "   cd /home/workflow/projects"
    echo "   git clone https://github.com/yourusername/isante.git isante_project"
    echo ""
    echo "2. Configure GitHub secrets:"
    echo "   - SERVER_PASSWORD: [workflow user password]"
    echo "   - PROJECT_PATH: /home/workflow/projects/isante_project"
    echo ""
    echo "3. Test deployment:"
    echo "   cd isante_project"
    echo "   ./deploy.sh deploy"
    echo ""
    echo "4. Access the application:"
    echo "   - Frontend: http://$SERVER_IP:3000"
    echo "   - Backend: http://$SERVER_IP:5025"
    echo "   - pgAdmin: http://$SERVER_IP:5050"
    echo ""
    echo "Server IP: $SERVER_IP"
    echo "Project Path: $PROJECT_PATH"
    echo "Workflow User: $WORKFLOW_USER"
}

# Main setup function
main_setup() {
    print_header
    
    # Check if running as root
    check_root
    
    # Run setup steps
    create_workflow_user
    install_dependencies
    install_docker
    install_docker_compose
    setup_project_directory
    configure_ssh
    setup_firewall
    setup_user_groups
    test_setup
    
    # Show next steps
    show_next_steps
    
    print_status "🎉 Server setup completed successfully!"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "This script sets up the server environment for iSante deployment."
    echo ""
    echo "Options:"
    echo "  --help    Show this help message"
    echo ""
    echo "Requirements:"
    echo "  - Must be run as root (use sudo)"
    echo "  - Ubuntu/Debian system"
    echo "  - Internet connection"
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
