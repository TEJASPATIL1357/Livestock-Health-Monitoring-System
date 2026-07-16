# =========================================================================
# STAGE 1: BUILD ENVIRONMENT
# =========================================================================
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Compile and package the application into a JAR file, skipping tests for speed
RUN mvn clean package -DskipTests

# =========================================================================
# STAGE 2: PRODUCTION RUNTIME
# =========================================================================
FROM openjdk:17-slim
WORKDIR /app

# Copy the compiled JAR file from the build stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot default port
EXPOSE 8080

# Environment variables for production overrides
ENV SPRING_PROFILES_ACTIVE=prod

# Run the Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
