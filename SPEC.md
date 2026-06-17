SPEC.md

# MatchWiz - Software Specification

## 1. Vision

MatchWiz is a responsive web application for predicting soccer match results within private groups.

Users join groups associated with a specific competition and earn points based on the accuracy of their predictions. Rankings are calculated within each group.

The application consists of:

* Angular frontend
* Quarkus backend
* PostgreSQL database

Designed for simplicity, maintainability, and self-hosting.

## 2. UI Design

There is a design prototype on Google Stitch "Soccer Matchday Predictor". The Angular app's design is responsive and mobile-first.

---

# 3. Roles

## Global Roles

Stored as a single `global_role` column on the user record.

### USER

Default role for all registered users.

### ADMIN

Global administrator.

Permissions:

* Create and manage competitions
* Create and manage groups
* Manage teams, matchdays, matches, and results
* Approve user registrations (activate accounts)
* Approve group membership requests

---

## Group Roles

Stored per group membership record.

### MEMBER

Default group role after membership is approved.

Permissions:

* Submit predictions (before kickoff)
* View matchdays and match results
* View group rankings
* View other members' predictions on finished matches

### GROUP_ADMIN

Elevated role within a group. The first member approved in a group is automatically promoted to GROUP_ADMIN. No explicit promote endpoint is needed.

Permissions (in addition to MEMBER):

* Approve group membership requests
* Remove members from the group

---

# 4. Competition Model

A competition represents exactly one season.

Examples:

* Bundesliga 2026/27
* World Cup 2026

A competition can contain multiple groups. A group belongs to exactly one competition.

Groups can only be created while the competition is in ACTIVE status.

---

# 5. Competition Lifecycle

Competition statuses:

* DRAFT
* ACTIVE
* CLOSED
* ARCHIVED

## DRAFT

Setup phase. No predictions allowed.

## ACTIVE

Predictions allowed. Groups can be created and joined.

## CLOSED

Competition finished. No further predictions.

## ARCHIVED

Read-only historical data. No status transitions out of ARCHIVED.

Transitions: DRAFT → ACTIVE → CLOSED → ARCHIVED (one-way only).

---

# 6. User Registration & Approval

## Registration

Required:

* Username (unique)
* Password (bcrypt-hashed)

Optional:

* Email address

New users are created with `active = false`. They cannot log in until activated.

## Account Activation

Only ADMIN can activate a user account (`POST /api/users/{id}/approve`). This sets `active = true`.

## Group Membership Approval

After login, users browse available groups and request to join. Membership requests start as pending (`approved = false`). GROUP_ADMIN (or ADMIN) approves membership requests for their group.

The first member approved in a group is automatically promoted to GROUP_ADMIN.

## Approval Flow Summary

1. User registers → account inactive
2. ADMIN approves account → user can log in
3. User requests group membership → pending
4. GROUP_ADMIN (or ADMIN) approves membership → user can submit predictions

## Password Reset

Users can reset their password without logging in:

1. Request a reset code via `POST /api/auth/password-reset/request` (email required)
2. An 8-character alphanumeric code is sent by email (no-link, code-only)
3. Submit code + new password via `POST /api/auth/password-reset/confirm`
4. Code expires after 30 minutes and is single-use
5. Requesting a new code invalidates any previous code

To prevent email enumeration, the request endpoint always returns 204 regardless of whether the email exists.

## Email Verification

Planned, not yet implemented. The `email_verified` flag is stored on the user record.

## Two-Factor Authentication

Planned, not yet implemented. The `two_factor_enabled` flag is stored on the user record. The intended method is EMAIL_OTP.

---

# 7. Group Membership

Users may belong to multiple groups across one or more competitions.

After account activation, users can browse all available groups and request to join any of them. Each join request must be approved by a GROUP_ADMIN (or ADMIN).

Invitations via email are also supported. An invitation creates a pending membership upon acceptance.

---

# 8. Prediction Rules

Default scoring:

| Condition                        | Points |
| -------------------------------- | ------ |
| Exact result                     | 5      |
| Correct goal difference          | 3      |
| Correct tendency (win/loss/draw) | 2      |
| Wrong prediction                 | 0      |

Scoring rules are configurable per competition.

Additional rules:

* Predictions are scoped to (user, group, match) — the same user can predict independently in each group
* Predictions can be updated (upsert) any number of times before match kickoff
* Predictions submitted after kickoff are rejected
* Points are awarded automatically when a match result is entered (status FINISHED or LIVE with goals set)
* Rescoring is idempotent — updating a match result recalculates all predictions for that match

Bonus questions are out of scope.

---

# 9. Rankings

Rankings exist at group level.

Sorting:

1. Total points descending
2. Exact predictions descending
3. Username ascending

Ranking entries include:

* Rank
* Username
* Total points
* Exact prediction count
* Goal-difference prediction count
* Tendency-only prediction count

Only approved group members appear in rankings. Only finished and live matches contribute points.

Rankings remain accessible as long as the competition exists.

---

# 10. Notifications

In-app notifications are stored per user and displayed in the UI.

Notification types:

* MATCHDAY_STARTS
* MISSING_PREDICTIONS
* REGISTRATION_APPROVED
* INVITATION_ACCEPTED

Users can mark notifications as read. Notifications are returned ordered by creation time descending.

Email delivery is not yet implemented. The `email_notifications` and `matchday_reminders` preference flags are stored but email sending for these events is pending.

---

# 11. User Preferences

Supported preferences:

* Preferred language
* Timezone
* Theme (LIGHT / DARK / SYSTEM)
* Email address
* Two-factor authentication (flag only, not yet active)
* Email notifications (flag only, sending not yet active)
* Matchday reminders (flag only, sending not yet active)

---

# 12. API Overview

Base path: `/api`. All endpoints except auth require a JWT Bearer token.

| Resource              | Path                                 | Notes                              |
| --------------------- | ------------------------------------ | ---------------------------------- |
| Auth                  | `/api/auth`                          | login, register, password reset    |
| Users                 | `/api/users`                         | profile, preferences, approval     |
| Competitions          | `/api/competitions`                  | CRUD, scoring rules                |
| Groups                | `/api/groups`                        | CRUD, join request                 |
| Group Members         | `/api/groups/{id}/members`           | list, approve, remove              |
| Teams                 | `/api/teams`                         | CRUD                               |
| Matchdays             | `/api/matchdays`                     | CRUD, filter by competition        |
| Matchday Matches      | `/api/matchdays/{id}/matches`        | list and create matches            |
| Matches               | `/api/matches/{id}`                  | update match / enter result        |
| Predictions           | `/api/matchdays/{id}/predictions`    | submit batch, list own or others'  |
| Rankings              | `/api/groups/{id}/rankings`          | group ranking table                |
| Notifications         | `/api/notifications`                 | list, mark read                    |

---

# 13. Database Model

## AppUser

Table: `app_user`

* id
* username (unique)
* password_hash
* email
* email_verified (default: false)
* preferred_language
* timezone
* theme (LIGHT / DARK / SYSTEM, default: SYSTEM)
* two_factor_enabled (default: false)
* email_notifications (default: false)
* matchday_reminders (default: false)
* global_role (USER / ADMIN, default: USER)
* active (default: false)
* created_at

## Competition

Table: `competition`

* id
* name
* season
* status (DRAFT / ACTIVE / CLOSED / ARCHIVED, default: DRAFT)
* start_date
* end_date

## ScoringRule

Table: `scoring_rule`

* id
* competition_id (FK → competition, unique)
* exact_result_points (default: 5)
* goal_difference_points (default: 3)
* tendency_points (default: 2)

## Group

Table: `app_group`

* id
* competition_id (FK → competition)
* name
* description

## GroupMembership

Table: `group_membership`

* id
* group_id (FK → app_group)
* user_id (FK → app_user)
* role (MEMBER / GROUP_ADMIN, default: MEMBER)
* approved (default: false)
* joined_at

Unique constraint: (group_id, user_id)

## Invitation

Table: `invitation`

* id
* group_id (FK → app_group)
* email
* token (unique UUID)
* expires_at (14 days from creation)
* accepted_at

## Team

Table: `team`

* id
* name
* short_name
* logo_url

## Matchday

Table: `matchday`

* id
* competition_id (FK → competition)
* number

Unique constraint: (competition_id, number)

## Match

Table: `match`

* id
* matchday_id (FK → matchday)
* home_team_id (FK → team)
* away_team_id (FK → team)
* kickoff_time
* home_goals (nullable until result entered)
* away_goals (nullable until result entered)
* status (SCHEDULED / LIVE / FINISHED / CANCELLED, default: SCHEDULED)
* stage (nullable — see MatchStage below)

### MatchStage

Used for tournament-style competitions. Values:

Group stages: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`

Knockout rounds: `ROUND_32`, `ROUND_16`, `ROUND_8`, `SEMI_FINAL`, `FINAL`, `THIRD_PLACE`

## Prediction

Table: `prediction`

* id
* user_id (FK → app_user)
* group_id (FK → app_group)
* match_id (FK → match)
* predicted_home_goals
* predicted_away_goals
* awarded_points (nullable until match result entered)
* submitted_at

Unique constraint: (user_id, group_id, match_id)

## Notification

Table: `notification`

* id
* user_id (FK → app_user)
* type (MATCHDAY_STARTS / MISSING_PREDICTIONS / REGISTRATION_APPROVED / INVITATION_ACCEPTED)
* title
* message
* read (default: false)
* created_at

## VerificationToken

Table: `verification_token`

* id
* user_id (FK → app_user)
* token_hash (SHA-256 of the plaintext code, unique — plaintext never stored)
* type (PASSWORD_RESET — LOGIN_OTP planned)
* expires_at
* used_at (nullable — set on redemption)
* created_at

---

# 14. Frontend Architecture

## Technology Stack

* Angular 21
* Standalone Components
* Angular Signals
* Angular Material 3
* OpenAPI Generator
* RxJS only when required
* MSW (Mock Service Worker) for frontend development

---

## Project Structure

```
src/app
├── core
│   ├── auth
│   ├── api
│   ├── guards
│   ├── interceptors
│   └── services
├── shared
│   ├── components
│   ├── pipes
│   ├── directives
│   └── models
├── features
│   ├── auth
│   ├── dashboard
│   ├── competitions
│   ├── groups
│   ├── predictions
│   ├── rankings
│   ├── notifications
│   ├── administration
│   └── preferences
├── layouts
└── app.routes.ts
```

---

## State Management

Prefer Angular Signals for local component state.

Use Signal Store only for shared application state.

Initial stores:

* AuthStore
* NotificationStore

All other features use generated OpenAPI services and local component signals.

---

# 15. Backend Architecture

## Technology Stack

* Quarkus 3.36
* Java 21
* PostgreSQL
* Hibernate ORM + Panache
* Flyway (5 migrations, runs at startup)
* SmallRye JWT (RSA-signed, 24h duration)
* Quarkus Mailer (SMTP in production, mock in dev/test)
* Bucket4j rate limiting
* Jakarta Bean Validation
* SmallRye OpenAPI
* Testcontainers (dev services + integration tests)

## Project Package Structure

```
de.mwmrs
├── bootstrap/      (AdminSeeder, TestDataSeeder, WorldCup2026Seeder)
├── dto/            (request/response DTOs)
├── entity/         (JPA/Panache entities + enums)
├── exception/      (BusinessException, ExceptionMappers)
├── resource/       (JAX-RS REST resources)
├── security/       (TokenService, CurrentUser, GroupAuthz, PasswordService, RateLimitFilter, VerificationCodes)
└── service/        (business logic)
```

## Security

* JWT Bearer token, RSA keys, 24h expiry
* Rate limiting: `/api/auth/login` — 10 requests/min per IP; `/api/auth/password-reset/*` — 5 requests/15min per IP
* JWT `groups` claim carries only global role (USER/ADMIN)
* Group role (MEMBER/GROUP_ADMIN) resolved per-request from DB via `GroupAuthz` service
* Bcrypt password hashing

## Email

Production delivery via SMTP, configured through environment variables. In development and tests, email is mocked (captured via `MockMailbox`).

## Environment Variables

| Variable | Description |
| --- | --- |
| `MATCHWIZ_DB_URL` | PostgreSQL JDBC URL |
| `MATCHWIZ_DB_USER` | Database user |
| `MATCHWIZ_DB_PASSWORD` | Database password |
| `MATCHWIZ_JWT_PRIVATE_KEY_LOCATION` | Path to RSA private key PEM |
| `MATCHWIZ_JWT_PUBLIC_KEY_LOCATION` | Path to RSA public key PEM |
| `MATCHWIZ_CORS_ORIGINS` | Allowed CORS origins |
| `MATCHWIZ_ADMIN_USERNAME` | Bootstrap admin username |
| `MATCHWIZ_ADMIN_PASSWORD` | Bootstrap admin password |
| `MATCHWIZ_SMTP_HOST` | SMTP server host |
| `MATCHWIZ_SMTP_PORT` | SMTP server port |
| `MATCHWIZ_SMTP_USER` | SMTP username |
| `MATCHWIZ_SMTP_PASSWORD` | SMTP password |
| `MATCHWIZ_SMTP_STARTTLS` | Enable STARTTLS (true/false) |
| `MATCHWIZ_NOTIFY_EMAIL` | From-address for outgoing mail |

## Match Import

Manual administration via the REST API. An external football API import is a future option; manual maintenance remains the fallback.

---

# 16. Deployment

## Environment

| Component | Hosting |
| --- | --- |
| Angular frontend | Docker container |
| Quarkus backend | Docker container |
| PostgreSQL | Docker container |
| Reverse proxy | nginx |


## Docker Setup

* nginx reverse proxy
* Angular frontend container
* Quarkus backend container
* PostgreSQL (external host)
* Automated backups

---

# 17. Future Enhancements

* 2FA via EMAIL_OTP (flag already in place)
* Email verification flow (flag already in place)
* Email notifications for matchday reminders and missing predictions (preferences already stored)
* Social login
* Competition-wide rankings
* Bonus questions
* Push notifications
* External football data provider import
* Mobile app
* Advanced statistics
* Public competition pages
