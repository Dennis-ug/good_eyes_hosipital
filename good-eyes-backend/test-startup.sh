#!/bin/bash

echo "Testing application startup..."

# Clean and compile
echo "Cleaning and compiling..."
./mvnw clean compile

# Test if the application can start
echo "Testing application startup..."
timeout 30s ./mvnw spring-boot:run > startup.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Application started successfully!"
    echo "The dependency issue has been resolved."
    echo ""
    echo "Next steps:"
    echo "1. Run the database migrations: ./mvnw flyway:migrate"
    echo "2. Uncomment the drug-specific queries in InventoryItemRepository"
    echo "3. Uncomment the methods in InventoryDrugService"
    echo "4. Restart the application"
else
    echo "❌ Application failed to start. Check startup.log for details."
    echo ""
    echo "Common issues:"
    echo "1. Database connection issues"
    echo "2. Missing database migrations"
    echo "3. Other dependency issues"
fi 