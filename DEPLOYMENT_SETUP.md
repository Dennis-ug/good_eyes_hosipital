# iSante Deployment Setup Guide

This guide explains how to set up automatic deployment to your production server using GitHub Actions.

## 🎯 Overview

The deployment workflow will automatically:
- Trigger when code is pushed to the `main` branch
- SSH into your server (161.35.46.156)
- Pull the latest code changes
- Rebuild and restart Docker containers
- Perform health checks
- Provide deployment status feedback

## 📋 Prerequisites

### Server Requirements
- Ubuntu/Debian server with IP: 161.35.46.156
- Docker and Docker Compose installed
- Git installed
- SSH access configured
- Sufficient disk space (at least 10GB free)

### GitHub Repository Requirements
- Repository with the iSante codebase
- GitHub Actions enabled
- Repository secrets configured
- Server user account: `workflow` (password enabled)

## 🔧 Server Setup

### Option 1: Automated Setup (Recommended)

The GitHub Actions workflow will automatically set up the server environment on the first deployment. However, you can also run the setup script manually:

```bash
# SSH to your server as root
ssh root@161.35.46.156

# Download and run the setup script
wget https://raw.githubusercontent.com/yourusername/isante/main/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### Option 2: Manual Setup

If you prefer to set up manually:

#### 1. Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
exit
# SSH back into the server
```

### 2. Clone the Repository

```bash
# Navigate to your projects directory
cd /home/workflow/projects

# Clone the repository
git clone https://github.com/yourusername/isante.git isante_project
cd isante_project

# Make sure you're on the main branch
git checkout main
```

### 3. Configure Workflow User Account

```bash
# Ensure the workflow user has the necessary permissions
sudo usermod -aG docker workflow
sudo usermod -aG sudo workflow

# Set up the project directory for the workflow user
sudo mkdir -p /home/workflow/projects
sudo chown workflow:workflow /home/workflow/projects

# Switch to workflow user to test setup
sudo su - workflow
cd /home/workflow/projects

# Test Docker access
docker --version
docker-compose --version
```

### 4. Test Docker Setup

```bash
# Test Docker installation
docker --version
docker-compose --version

# Clone the repository as workflow user
git clone https://github.com/yourusername/isante.git
cd isante

# Test running the application locally
./start-isante.sh start
```

## 🔐 GitHub Repository Setup

### 1. Enable GitHub Actions

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Click "Enable Actions"

### 2. Configure Repository Secrets

Go to your repository → Settings → Secrets and variables → Actions, then add these secrets:

#### Required Secrets:

**`SERVER_PASSWORD`**
- Value: The password for the `workflow` user account
- This allows GitHub Actions to SSH into your server using password authentication

**`PROJECT_PATH`**
- Value: Full path to your project directory on the server
- Example: `/home/workflow/projects/isante_project`

#### Optional Secrets:

**`DEPLOYMENT_ENVIRONMENT`**
- Value: `production` (or `staging` if you have multiple environments)

**`NOTIFICATION_WEBHOOK`**
- Value: Slack/Discord webhook URL for deployment notifications

### 3. Example Secret Configuration

```
SERVER_PASSWORD: your_workflow_user_password_here
PROJECT_PATH: /home/workflow/projects/isante_project
DEPLOYMENT_ENVIRONMENT: production
```

## 🧪 Testing Before Deployment

### 1. Local Test Suite

Before deploying, run the comprehensive test suite locally:

```bash
# Run all tests
./test-suite.sh

# Run specific test categories
./test-suite.sh --backend
./test-suite.sh --frontend
./test-suite.sh --docker
./test-suite.sh --security
./test-suite.sh --integration
```

The test suite includes:
- ✅ Backend compilation and unit tests
- ✅ Frontend build and linting
- ✅ Docker image builds
- ✅ Docker Compose validation
- ✅ Database schema validation
- ✅ Security checks
- ✅ Code quality analysis
- ✅ Documentation verification
- ✅ Integration tests
- ✅ Performance metrics

### 2. Manual Server Test

After local tests pass, test the deployment manually on the server:

```bash
# SSH into your server as workflow user
ssh workflow@161.35.46.156

# Navigate to project directory
cd /home/workflow/projects/isante_project

# Run the deployment script
./deploy.sh deploy
```

### 3. GitHub Actions Test

1. Make a small change to your code
2. Commit and push to the main branch:
   ```bash
   git add .
   git commit -m "Test deployment workflow"
   git push origin main
   ```
3. Go to GitHub → Actions tab to monitor the test and deployment process

The GitHub Actions workflow will:
1. **Run comprehensive tests** (backend, frontend, Docker, security, integration)
2. **Set up server environment** (Docker, Docker Compose, Git) if needed
3. **Clone repository** if not already present
4. **Validate all components** before deployment
5. **Deploy to production** only if all tests pass
6. **Provide detailed feedback** on test results and deployment status

## 📊 Monitoring Deployments

### GitHub Actions Dashboard
- Go to your repository → Actions
- View deployment history and logs
- Monitor deployment status

### Server Monitoring
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Health Check URLs
After deployment, verify these endpoints:
- Frontend: http://161.35.46.156:3000
- Backend API: http://161.35.46.156:5025/api/auth/test
- pgAdmin: http://161.35.46.156:5050

## 🔄 Deployment Process

The workflow performs these steps:

1. **Checkout Code**: Downloads the latest code from GitHub
2. **SSH Setup**: Configures SSH access to your server
3. **Deploy**: 
   - Pulls latest changes from git
   - Stops existing containers
   - Cleans up old Docker images
   - Builds and starts new containers
   - Waits for services to be healthy
4. **Health Check**: Verifies all services are responding
5. **Summary**: Provides deployment status and service URLs

## 🛠️ Troubleshooting

### Common Issues

**SSH Connection Failed**
```bash
# Check if workflow user can SSH
ssh workflow@161.35.46.156

# Verify password authentication is enabled
sudo grep -i "PasswordAuthentication" /etc/ssh/sshd_config

# Test SSH connection with password
sshpass -p "your_password" ssh workflow@161.35.46.156
```

**Docker Build Failed**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check disk space
df -h

# Clean up Docker
docker system prune -a
```

**Services Not Starting**
```bash
# Check logs
docker-compose logs

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :5025
netstat -tulpn | grep :5050
```

### Rollback Deployment

If a deployment fails, you can rollback:

```bash
# On the server
./deploy.sh rollback

# Or manually
git reset --hard HEAD~1
docker-compose up -d
```

## 🔒 Security Considerations

### SSH Password Security
- Use a strong password for the workflow user
- Consider using a dedicated deployment user account
- Regularly rotate the workflow user password
- Ensure password authentication is properly configured

### Environment Variables
- Never commit sensitive data to git
- Use GitHub secrets for all sensitive information
- Consider using environment-specific configurations

### Server Security
- Keep the server updated
- Configure firewall rules
- Use HTTPS for production
- Monitor access logs

## 📈 Advanced Configuration

### Multiple Environments
You can set up multiple deployment environments:

1. **Staging**: Test deployments before production
2. **Production**: Live application
3. **Development**: Local development environment

### Custom Domains
To use custom domains instead of IP addresses:

1. Configure DNS to point to your server IP
2. Update the docker-compose.yml with domain names
3. Set up SSL certificates (Let's Encrypt)

### Monitoring and Logging
Consider adding:
- Application monitoring (New Relic, DataDog)
- Log aggregation (ELK Stack, Fluentd)
- Performance monitoring (Prometheus, Grafana)

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify server connectivity and SSH configuration
3. Ensure all prerequisites are installed
4. Check Docker and Docker Compose versions
5. Review the troubleshooting section above

For additional help, refer to:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
