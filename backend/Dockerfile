# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and package JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production JRE runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR artifact
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081
ENV PORT=8081

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

