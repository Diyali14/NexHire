
# ================================
# Stage 1: Build
# ================================
FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and project files first
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies first for better Docker layer caching
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests


# ================================
# Stage 2: Run
# ================================
FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy the generated JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Render provides the PORT environment variable.
# Spring Boot reads it from server.port=${PORT:8080}
EXPOSE 8080

# Start Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]

