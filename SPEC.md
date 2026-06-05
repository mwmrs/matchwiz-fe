SPEC.md

# MatchWiz - Software Specification (MVP)

## 1. Vision

MatchWiz is a responsive web application for predicting soccer match results within private groups.

Users join groups associated with a specific competition and earn points based on the accuracy of their predictions. Rankings are calculated within each group.

The application consists of:

* Angular frontend
* Quarkus backend
* PostgreSQL database

The MVP focuses on simplicity, maintainability, and self-hosting on Raspberry Pi infrastructure.

## 2. UI-Design

There is a design prototype on Google Stitch "Soccer Matchday Predictor". Use that to realize this Angular App's design which is supposed to be responsible and mobile first.

---

# 2. Roles

## Global Roles

### USER

Default role for registered users.

### ADMIN

Global administrator.

Permissions:

* Create competitions
* Manage competitions
* Create groups
* Manage groups
* Manage teams
* Manage matchdays
* Manage matches
* Promote users to group admins

---

## Group Roles

### MEMBER

Default group member.

Permissions:

* Submit predictions
* View rankings
* View matchdays
* Manage own preferences

### GROUP_ADMIN

Additional role within a group.

Permissions:

* Approve registrations for the group
* Invite users via email
* Manage group members

---

# 3. Competition Model

A competition represents exactly one season.

Examples:

* Bundesliga 2026/27
* World Cup 2026

A competition can contain multiple groups.

A group belongs to exactly one competition.

Example:

Bundesliga 2026/27

* Family Group
* Company Group
* Friends Group

---

# 4. Competition Lifecycle

Competition status:

* DRAFT
* ACTIVE
* CLOSED
* ARCHIVED

## DRAFT

Competition setup.

## ACTIVE

Predictions allowed.

## CLOSED

Competition finished.

## ARCHIVED

Read-only historical data.

---

# 5. User Registration

## Registration

Required:

* Username
* Password

Optional:

* Email address

New registrations require approval. Until successful approval the user is not able to login!

Approval can be performed by:

* ADMIN
* GROUP_ADMIN

## Email Verification

Optional for MVP.

Verification via email link.

## Two-Factor Authentication

Optional.

Method:

* Email OTP

Disabled by default.

---

# 6. Group Membership

Users may belong to multiple groups.

After a user is approved he can login and choose from a list of all available groups.
Every selection must be approved by admin or a group admin (if already present).

---

# 7. Prediction Rules

Default scoring:

| Condition                        | Points |
| -------------------------------- | ------ |
| Exact result                     | 5      |
| Correct goal difference          | 3      |
| Correct tendency (win/loss/draw) | 2      |
| Wrong prediction                 | 0      |

Scoring rules are configurable per competition.

Bonus questions are out of scope for MVP.

---

# 8. Rankings

Rankings exist on group level.

Ranking calculation:

Sum of awarded prediction points.

Sorting:

1. Total points descending
2. Exact predictions descending
3. Username ascending

Rankings remain available while the competition exists.

---

# 9. Notifications

Notifications are displayed on the dashboard.

Examples:

* Matchday starts tomorrow
* Missing predictions
* Registration approved
* Invitation accepted

Email notifications are optional per user.

---

# 10. User Preferences

Supported preferences:

* Language
* Timezone
* Theme

  * Light
  * Dark
  * System
* Notification settings
* Email address

---

# 11. MVP Screens

## Public

### Landing Page

* Login
* Registration
* Competition information
* Invitation acceptance

### Login

* Username
* Password

### Registration

* Username
* Password
* Optional email

---

## Authenticated

### Dashboard

Displays:

* My groups
* Active competition
* Upcoming matchday
* Missing predictions
* Notifications

### Matchday Prediction

Displays all matches of a matchday.

Users can submit predictions before kickoff.

### Ranking

Displays group ranking table.

### Preferences

User settings.

---

## Administration

### Competition Administration

* Create competition
* Edit competition
* Change status

### Group Administration

* Create group
* Invite users
* Approve registrations
* Manage members

### Match Administration

* Teams
* Matchdays
* Matches
* Results

---

# 12. Database Model

## User

* id
* username
* password_hash
* email
* email_verified
* preferred_language
* timezone
* theme
* two_factor_enabled
* active
* created_at

## GlobalRole

* user_id
* role

## Competition

* id
* name
* season
* status
* start_date
* end_date

## ScoringRule

* id
* competition_id
* exact_result_points
* goal_difference_points
* tendency_points

## Group

* id
* competition_id
* name
* description

## GroupMembership

* id
* group_id
* user_id
* role
* joined_at

## Invitation

* id
* group_id
* email
* token
* expires_at
* accepted_at

## Team

* id
* name
* short_name
* logo_url

## Matchday

* id
* competition_id
* number
* deadline

## Match

* id
* matchday_id
* home_team_id
* away_team_id
* kickoff_time
* home_goals
* away_goals
* status

## Prediction

* id
* user_id
* group_id
* match_id
* predicted_home_goals
* predicted_away_goals
* awarded_points
* submitted_at

## Notification

* id
* user_id
* type
* title
* message
* read
* created_at

---

# 13. Frontend Architecture

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

src/app

* core

  * auth
  * api
  * guards
  * interceptors
  * services

* shared

  * components
  * pipes
  * directives
  * models

* features

  * auth
  * dashboard
  * competitions
  * groups
  * predictions
  * rankings
  * notifications
  * administration
  * preferences

* layouts

* app.routes.ts

---

## State Management

Principle:

Prefer Angular Signals.

Use Signal Store only for shared application state.

Initial stores:

* AuthStore
* NotificationStore

All other features should use:

* Generated OpenAPI services
* Local component signals

Avoid premature state management complexity.

---

# 14. Backend Architecture

## Technology Stack

* Quarkus 3.x
* PostgreSQL
* Hibernate ORM + Panache
* Flyway
* JWT Authentication
* OpenAPI
* Testcontainers

---

## Match Import

MVP:

* Manual administration

Future option:

* External football API import

Manual maintenance must always remain available as fallback.

---

# 15. Deployment

## Environment

Frontend:

* Docker container

Backend:

* Docker container

Database:

* PostgreSQL Docker container on dedicated Raspberry Pi 5

Hosting:

* Raspberry Pi 4 (4 GB)

---

## Docker Setup

* nginx reverse proxy
* Angular frontend
* Quarkus backend
* PostgreSQL (external host)
* automated backups

---

# 16. Future Enhancements

* Social login
* Competition-wide rankings
* Bonus questions
* Push notifications
* External football data providers
* Mobile app
* Advanced statistics
* Public competition pages
