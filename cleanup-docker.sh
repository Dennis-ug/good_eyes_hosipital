#!/bin/bash

# Docker Cleanup Script for Good Eyes Hospital
# This script cleans up Docker resources to free disk space

echo "Cleaning up Docker resources..."

# Prune build cache (frees up ~8.5GB)
echo "1. Cleaning Docker build cache..."
docker builder prune -af --volumes

# Remove unused images
echo "2. Removing unused Docker images..."
docker image prune -af

# Remove unused containers
echo "3. Removing stopped containers..."
docker container prune -af

# Remove unused volumes (be careful with this)
echo "4. Removing unused volumes..."
docker volume prune -af

# Optional: System prune (removes everything unused)
echo "5. Running full system prune..."
docker system prune -af --volumes

echo ""
echo "Docker cleanup complete!"
echo "Checking current disk usage:"
docker system df

