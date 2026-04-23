FROM eclipse-temurin:23-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Ensure mvnw has unix line endings and is executable
RUN sed -i 's/\r$//' mvnw || true
RUN chmod +x mvnw
# Download dependencies
RUN ./mvnw dependency:go-offline || true
COPY src ./src
# Build the application
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:23-jre
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Spring Boot is configured to run on 8081
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
