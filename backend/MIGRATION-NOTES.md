# Migration scope and compatibility

Source: https://github.com/akhilreddy6g/Eventseasy/tree/0218231ee0415964ac9c1cf7d74a852923050c5d/backend

This is a Java 17 / Spring Boot 3.5.16 replacement for `backend` only. It includes
Spring MVC, the MongoDB driver through Spring Data MongoDB, Spring Data Redis,
Kafka's Java client, Spring Security's Argon2 encoder with Bouncy Castle,
Java JWT, JavaMail, and the existing Mailjet HTTP API.

The web API callers, Redux consumers, cookie-setting route and separate Go
Kafka/WebSocket/message-persistence service were reviewed for compatibility.
No repository commits, web edits, Go edits, database migrations, deployment
changes or new product endpoints were made. The original backend README is
included unchanged; Java run instructions are in `RUNNING.md`.

## Endpoint inventory

All paths have the existing `/api` prefix. Trailing-slash forms are also accepted.

| Method | Path                       | Normal HTTP status              |
| ------ | -------------------------- | ------------------------------- |
| POST   | /auth/signin               | 200; authentication failure 401 |
| POST   | /auth/signup               | 200; authentication failure 401 |
| POST   | /auth/refresh-access-token | 200; refresh failure 401        |
| DELETE | /auth/logout               | 200                             |
| POST   | /events/host               | 201                             |
| POST   | /events/join               | 201                             |
| GET    | /events/data               | 200                             |
| GET    | /events/guests             | 200                             |
| GET    | /events/managers           | 200                             |
| DELETE | /events/attendee           | 200                             |
| POST   | /events/reinvite           | 201                             |
| GET    | /events/users              | 200                             |
| POST   | /chats/create              | 201                             |
| GET    | /chats/data                | 200                             |
| POST   | /chats/start               | 201                             |
| POST   | /chats/new-ws-conn         | 201                             |
| GET    | /chats/active-subs         | 200                             |
| POST   | /chats/push-msg            | 201                             |
| GET    | /chats/fetch-msgs          | 200                             |
| POST   | /invite/send               | 201                             |
| POST   | /awake                     | 201; missing/wrong API key 403  |

Service-level `success:false` results keep their original normal status unless
the original controller explicitly selected another status. DTO failures use
the Nest-style 400 envelope. Protected routes accept the raw JWT in the
`Authorization` header, without a `Bearer ` prefix.

## Data and integration contracts

- Existing collection names: `users`, `events`, `attendants`, `viewers`, `chats`,
  `chat_restricted_users`, `chat_servers`, `chat_messages`.
- MongoDB document IDs serialize as hexadecimal strings, and dates as UTC ISO
  strings with milliseconds. Foreign `eventId` and `chatId` values remain strings.
- Sparse document fields and the differing `data`/`response` keys are retained.
  Raw BSON documents avoid introducing Java `_class` metadata or renaming fields.
- Existing Argon2id password hashes are verified directly. New hashes use the
  source node-argon2 defaults: version 19, memory 65536 KiB, time 3, parallelism 4,
  16-byte salt and 32-byte result.
- JWTs retain the `user` claim, configured issuers, 2-hour access lifetime and
  30-day refresh lifetime. Keep the existing signing secrets.
- Cookies retain JSON payloads, URL encoding, names, accessibility flags and
  2-hour/1-day cookie lifetimes. `NODE_ENV` controls Secure/SameSite; the separate
  `ENV` setting controls the existing `.onrender.com` domain condition.
- Kafka messages retain the existing fields and a generated UUID `messageId`.
  Partition calculation remains the first 8 hex digits of SHA-256 of
  `eventId-chatId`, modulo the configured partition count.
- WebSocket addresses still come from `chat_servers`, using Kafka consumer
  assignments. The Java backend does not replace the Go WebSocket server.
- Invitation HTML, subject wording and controller response wording are retained,
  including the existing `</3>` tag and `manager` comparison. Production uses
  Mailjet asynchronously; development uses Gmail SMTP over TLS on port 465.

## Existing behavior deliberately retained

These are observations from the pinned source, not corrections included here:

- Refresh reads the cookie named `auth`, although sign-in writes `refreshToken`.
  Its successful branch also nests the parsed refresh object in the new cookie.
- Redis stores `ttl:900` inside the cached value; it does not set key expiry.
  Event mutations do not invalidate this cache.
- The event listing uses `status` for cache matching, not database filtering.
- Event hosting ignores a failed viewer insertion when forming its success result.
- Signup can report success after a swallowed account-insertion error.
- Attendee deletion needs both deletes to report a removed document.
- The text `Succeessfully deleted the user from the event` retains its spelling.
- Source authorization checks are retained; no new role or ownership rules were
  introduced on endpoints that previously lacked them.
- The production middleware's existing protocol comparison is retained.
- Mailjet scheduling success is returned before delivery completes.

## Verification and limits

The package has JUnit 5, Mockito and MockMvc tests. See `VERIFICATION.md` for the
completed checks. Recorded validation and partition fixtures were generated by
running the original repository's installed Node dependencies at the pinned
commit, rather than inferred from the Java implementation.

This is a source migration, not a proof of exhaustive behavioral equivalence.
Framework/driver-generated exception details, malformed-JSON parser messages,
HTTP container edge cases and logs can differ between the JVM and Node.js.
The stable application response strings and normal web request contracts
are the compatibility target; deployment-specific TLS, external email delivery
and live Kafka/Go end-to-end behavior still require staging verification.

No production secrets were accessed or packaged. Automated tests neither send
email nor connect to your live services. No security fixes or cache/refresh
behavior changes are bundled into this migration.
