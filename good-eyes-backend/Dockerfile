# # Multi-stage build for Spring Boot application - Optimized for speed
# FROM maven:3.9.6-eclipse-temurin-17 AS build

# # Set working directory
# WORKDIR /app

# # Copy pom.xml first for better layer caching
# COPY pom.xml .

# # Download dependencies with retry logic
# RUN mvn dependency:resolve -B -T 1C -DskipTests || \
#     mvn dependency:resolve -B -T 1C -DskipTests -U

# # Copy source code
# COPY src ./src

# # Build the application with retry logic
# RUN mvn clean package -B -T 1C -DskipTests -Dmaven.test.skip=true || \
#     mvn clean package -B -T 1C -DskipTests -Dmaven.test.skip=true -U

# # Runtime stage - Using smaller Alpine image
# FROM eclipse-temurin:17-jre-alpine

# # Install only essential packages
# RUN apk add --no-cache wget

# # Create app user
# RUN addgroup -g 1001 -S appgroup && \
#     adduser -u 1001 -S appuser -G appgroup

# # Set working directory
# WORKDIR /app

# # Copy the built jar from build stage
# COPY --from=build /app/target/*.jar app.jar

# # Change ownership to app user
# RUN chown -R appuser:appgroup /app

# # Switch to app user
# USER appuser

# # Expose port
# EXPOSE 5025

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:5025/api/auth/test || exit 1

# # Run the application with optimized JVM settings
# ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"] 
# Stage 1: Build the application using Maven - Optimized for speed
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies with optimized settings
RUN mvn dependency:go-offline -B -T 1C -DskipTests

# Copy source code
COPY src ./src

# Build the Spring Boot app with optimizations
RUN mvn clean package -B -T 1C -DskipTests -Dmaven.test.skip=true -Dmaven.javadoc.skip=true

# Stage 2: Run the built app with optimized JRE
FROM eclipse-temurin:17-jre-alpine

# Install only essential packages
RUN apk add --no-cache wget

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy the jar from the previous build stage
COPY --from=build /app/target/*.jar app.jar

# Copy optimization scripts
COPY scripts/ ./scripts/

# Change ownership to app user
RUN chown -R appuser:appgroup /app

# Switch to app user
USER appuser

# Expose port 5025
EXPOSE 5025

# Run the application with optimized JVM settings for faster startup
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=60.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-XX:+OptimizeStringConcat", \
    "-XX:+UseCompressedOops", \
    "-XX:+UseCompressedClassPointers", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=production", \
    "-jar", "app.jar"]
