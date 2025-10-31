#!/bin/bash

# Load environment variables from .env file
export $(cat .env | grep -v '^#' | xargs)

# Navigate to backend directory and start the application
cd eyesante-backend
./mvnw spring-boot:run