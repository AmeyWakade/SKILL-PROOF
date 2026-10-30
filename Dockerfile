FROM node:22-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /workspace/backend
COPY backend/pom.xml ./
RUN mvn -B -ntp dependency:go-offline
COPY backend/src ./src
COPY --from=frontend-build /workspace/frontend/dist ./src/main/resources/static
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/skillproof-api-0.1.0-SNAPSHOT.jar /app/skillproof.jar
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
CMD ["sh", "-c", "java -jar /app/skillproof.jar"]
