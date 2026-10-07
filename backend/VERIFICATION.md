# Verification record

Source commit: `0218231ee0415964ac9c1cf7d74a852923050c5d`.

Validation performed on 2026-10-04 using OpenJDK 17 and Maven 3.9.11.

## Build and automated tests

`mvn clean verify` completed successfully and produced the executable Spring Boot JAR.

| Suite                 | Tests | Failures | Errors |
| --------------------- | ----: | -------: | -----: |
| AuthServiceTest       |     4 |        0 |      0 |
| ChatServiceTest       |     5 |        0 |      0 |
| EventServiceTest      |     5 |        0 |      0 |
| HttpContractTest      |    10 |        0 |      0 |
| InviteServiceTest     |     4 |        0 |      0 |
| NestCompatibilityTest |   103 |        0 |      0 |
| RouteCoverageTest     |     4 |        0 |      0 |
| SessionServiceTest    |     2 |        0 |      0 |

**Total: 137 passing checks, zero failures/errors, zero skipped.**

The compatibility suite includes 48 original DTO fixtures, 38 email/date edge fixtures, 16 Node SHA-256 partition vectors and one node-argon2 interoperability check. These are parameterized basic checks, not 137 separate end-to-end scenarios.

## Isolated comparison against NestJS

Both implementations were run against separate identically seeded local MongoDB 8.0.16 databases and Redis 7.4.2 databases. Requests were compared for HTTP status and parsed JSON. JWT values were omitted from the signup/signin JSON comparison because issue times vary; claims and lifetimes are covered in the unit tests.

All 23 comparisons passed:

- missing token (HTTP 401).
- validation (HTTP 400).
- login with existing node-argon2 hash and cookies (HTTP 200).
- existing viewer aggregation / ObjectIds / dates (HTTP 200).
- redis cached viewer data (HTTP 200).
- guests (HTTP 200).
- managers (HTTP 200).
- users projection (HTTP 200).
- existing chats / restrictions lookup (HTTP 200).
- start chat (HTTP 201).
- persisted chat status (HTTP 200).
- Go message schema / timestamp serialization (HTTP 200).
- no messages (HTTP 200).
- join pending invitation (HTTP 201).
- join duplicate (HTTP 201).
- remove attendee (HTTP 200).
- host event (HTTP 201).
- create chat (HTTP 201).
- signup (HTTP 200).
- signin after signup (HTTP 200).
- duplicate signup (HTTP 401).
- refresh legacy mismatch (HTTP 401).
- logout (HTTP 200).

This exercised the packaged Java JAR, including real MongoDB aggregation pipelines, Redis cache round trips, BSON IDs/date serialization and newly inserted records. Original NestJS startup topic creation was disabled only in the local comparison harness; no repository source files were changed. Kafka was not running in this comparison.

## Not verified against live services

- Live Kafka brokers, consumer-group assignments, production mutual TLS and Go WebSocket broadcasting.
- Gmail SMTP/Mailjet delivery. Email tests mock the transport and verify the original content/routing.
- Your deployed web/browser cookies, reverse proxy and production configuration.
- Exhaustive malformed inputs, every database/driver exception or JVM/Node runtime error wording.

No live credentials were used. The original web, Go service and backend README were not edited. The ZIP excludes local dependencies, build output, temporary databases and secrets.
