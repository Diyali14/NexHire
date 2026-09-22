
# ================================
# Stage 1: Build
# ================================
FROM maven:3.9.11-eclipse-temurin-25 AS builder

WORKDIR /app

# Copy Maven project files
COPY pom.xml ./

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests


# ================================
# Stage 2: Run
# ================================
FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy generated JAR
COPY --from=builder /app/target/*.jar /app/app.jar

# Render provides PORT dynamically
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

