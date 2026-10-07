# Run the Spring Boot backend

This directory replaces the NestJS `backend` directory only. It is based on
`akhilreddy6g/Eventseasy`, branch `main`, commit
`0218231ee0415964ac9c1cf7d74a852923050c5d`.

The original `README.md` is retained verbatim. Its NestJS/npm instructions apply
to the old implementation; use this file for the Java replacement.

## Requirements

- JDK 17 or 21. Check `java -version` and `javac -version`.
- Internet access on the first build to download Maven and Java dependencies.
- Your existing MongoDB, Redis and Kafka services.
- Your existing separate Go `chat_backend` service for live chat.
- Your existing Gmail credentials for development invitations, or Mailjet keys
  when `NODE_ENV=production`.

Maven is provided by the wrapper. Node.js is not required for this backend.
The web and Go service keep their current runtimes and commands.

## Replace and configure

1. Stop the NestJS backend. Keep a backup of its directory and `.env`.
2. Extract the ZIP. Place its `backend` directory alongside the unchanged
   `Frontend` and `chat_backend` directories in your project.
3. Copy the old backend's `.env` into the new `backend` directory. Keep the
   existing values, especially `PORT`, `MONGO_URI`, JWT secrets/issuers and Kafka
   settings. Alternatively copy `.env.example` to `.env` and fill in those same
   values. The example contains placeholders, not usable credentials.
4. Run commands below from inside `backend`. The application reads `.env` from
   its working directory; exported environment variables take precedence.

No database migration or reseeding is required. The application accesses the
existing MongoDB collections directly and does not create a new Java-specific
schema or `_class` fields. Keep the database name in `MONGO_URI` unchanged.
The current Go service writes messages to database `test`; that existing
configuration must still agree with the API's database for message retrieval.

## macOS / Linux / Git Bash

```bash
cd backend
chmod +x mvnw
./mvnw test
./mvnw spring-boot:run
```

## Windows PowerShell / Command Prompt

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

The server listens on the existing `PORT`, under `/api`. For example, if your
existing `PORT=3000`, the base URL is `http://localhost:3000/api`. Keep the same
port and address so the web's `NEXT_PUBLIC_API_URL` does not need to change.
Development CORS remains `http://localhost:3001`; production uses `CLIENT_URL`.
Stop the process with Ctrl+C. Logs appear in the same terminal.

A plain `GET /` is not a health endpoint in the original backend. To check the
existing awake endpoint, use your configured key:

```bash
curl -i -X POST http://localhost:3000/api/awake -H 'api-key: YOUR_EXISTING_CRON_JOB_API_KEY'
```

Expected status: `201`; body: `{"message":"Server activated successfully"}`.
Replace port 3000 with your existing `PORT` if different.

## Build and run the JAR

```bash
./mvnw clean verify
java -jar target/backend-0.0.1.jar
```

On Windows use `.\mvnw.cmd clean verify`, then the same `java -jar` command.
Run the JAR from the directory containing `.env`, or supply environment variables
through your deployment platform. No Spring profile switch is needed: the
original `NODE_ENV` and `ENV` variables control the existing environment behavior.

## Tests and future CI

JUnit Jupiter (JUnit 5), Mockito and Spring MockMvc are included through
`spring-boot-starter-test`. Tests use mocks and recorded NestJS fixtures; they do
not need credentials or running MongoDB, Redis, Kafka, Gmail or Mailjet. Mockito
uses its subclass mock maker, so tests do not need JVM self-attach privileges.

For your future GitHub Actions job, select Java 17 or 21 and run:

```bash
./mvnw --batch-mode clean verify
```

Set the job's working directory to `backend`. Test reports are written to
`target/surefire-reports/`; the deployable JAR is `target/backend-0.0.1.jar`.
No GitHub Actions workflow or deployment changes are included.

## Compatibility notes

See `MIGRATION-NOTES.md` for the endpoint inventory, preserved source quirks and
verification limits. Basic tests are not a guarantee that every deployment or
external-service failure behaves identically. Before replacing a live deployment,
exercise the unchanged web against a copy of the existing database and your
staging Redis/Kafka/chat/email setup.
