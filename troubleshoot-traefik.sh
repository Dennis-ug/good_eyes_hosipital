#!/bin/bash

# Troubleshooting script for Traefik 404 issues

echo "=== Traefik Troubleshooting Script ==="
echo ""

echo "1. Checking if containers are running..."
docker ps --filter "name=good-eyes" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2. Checking container health..."
docker ps --filter "name=good-eyes" --format "table {{.Names}}\t{{.Status}}"
echo ""

echo "3. Checking frontend container logs (last 20 lines)..."
docker logs --tail 20 good-eyes-frontend 2>&1 | tail -20
echo ""

echo "4. Testing frontend health endpoint from inside container..."
docker exec good-eyes-frontend wget -qO- http://localhost:3000/api/health || echo "Health check failed"
echo ""

echo "5. Checking Traefik configuration (from Traefik container)..."
# Assuming Traefik is in a container named traefik
if docker ps --format "{{.Names}}" | grep -q traefik; then
    echo "Traefik container found. Checking configuration..."
    docker exec traefik cat /etc/traefik/traefik.yml 2>/dev/null || echo "Cannot access Traefik config"
else
    echo "Traefik container not found. Make sure Traefik is running."
fi
echo ""

echo "6. Testing frontend service on Docker network..."
docker exec good-eyes-frontend wget -qO- http://good-eyes-frontend:3000/api/health 2>&1 || echo "Network test failed"
echo ""

echo "7. Checking network connectivity..."
docker network inspect main_host --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null | grep good-eyes || echo "Network not found or containers not connected"
echo ""

echo "=== Troubleshooting Complete ==="
echo ""
echo "If frontend container shows 'unhealthy', check logs:"
echo "  docker logs good-eyes-frontend"
echo ""
echo "If Traefik isn't detecting the service, restart it:"
echo "  docker restart traefik"
echo ""
echo "To restart frontend service:"
echo "  docker compose restart frontend"
echo "  # or"
echo "  docker compose up -d --force-recreate frontend"

