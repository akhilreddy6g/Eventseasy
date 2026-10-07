# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:17-jdk-jammy AS base
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q -DskipTests dependency:go-offline

FROM base AS development
COPY src ./src
EXPOSE 4000
CMD ["./mvnw", "spring-boot:run"]

FROM base AS builder
COPY src ./src
RUN ./mvnw -B clean package && cp "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1)" target/app.jar

FROM eclipse-temurin:17-jre-jammy AS production
WORKDIR /app
COPY --from=builder /app/target/app.jar ./app.jar
EXPOSE 4000
ENTRYPOINT ["java", "-jar", "app.jar"]
