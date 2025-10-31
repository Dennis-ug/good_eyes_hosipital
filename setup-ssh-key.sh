#!/bin/bash

# SSH Key Setup Script for GitHub Actions
# Run this on your server to set up SSH key authentication

echo "🔑 SSH Key Setup for GitHub Actions"
echo "=================================="

# Check if we're running as the workflow user
if [ "$USER" != "workflow" ]; then
    echo "⚠️  Warning: This script should be run as the 'workflow' user"
    echo "   Current user: $USER"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create SSH directory if it doesn't exist
echo "📁 Creating SSH directory..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Check if authorized_keys exists
if [ ! -f ~/.ssh/authorized_keys ]; then
    echo "📝 Creating authorized_keys file..."
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

echo "🔍 Current SSH configuration:"
echo "SSH directory permissions:"
ls -la ~/.ssh/
echo ""
echo "Current authorized_keys content:"
if [ -s ~/.ssh/authorized_keys ]; then
    cat ~/.ssh/authorized_keys
else
    echo "(empty)"
fi

echo ""
echo "📋 To complete the setup:"
echo "1. Generate a new SSH key pair (if you haven't already):"
echo "   ssh-keygen -t rsa -b 4096 -C 'github-actions@isante'"
echo ""
echo "2. Copy the public key to this server:"
echo "   ssh-copy-id workflow@161.35.46.156"
echo ""
echo "3. Or manually add the public key to ~/.ssh/authorized_keys:"
echo "   echo 'YOUR_PUBLIC_KEY_CONTENT' >> ~/.ssh/authorized_keys"
echo ""
echo "4. Add the private key to GitHub repository secrets as 'SSH_PRIVATE_KEY'"
echo ""
echo "5. Test the connection:"
echo "   ssh workflow@161.35.46.156 'echo \"SSH connection successful\"'"

echo ""
echo "🔧 Server SSH configuration check:"
echo "SSH daemon configuration:"
sudo grep -E "(PubkeyAuthentication|PasswordAuthentication|AuthorizedKeysFile)" /etc/ssh/sshd_config | grep -v "^#" || echo "No specific SSH config found"

echo ""
echo "✅ Setup script completed!"
