#!/bin/bash
echo "Testing Enhanced Workflow..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')
echo "Testing workflow progression with payment validation..."
