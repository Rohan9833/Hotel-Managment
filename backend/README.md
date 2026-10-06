# Hotel Management API — Phases 1–3

Phase 1 implements the foundation, organization, authentication and security boundary.

## Structure

- config — environment and database
- models — MongoDB domain models
- controllers — request/application orchestration
- routes — API endpoints
- middleware — authentication, authorization, rate limiting and error handling
- services — audit logging
- utils — reusable security helpers

## Local setup

1. Copy .env.example to .env.
2. Set MONGODB_URI, JWT_SECRET, BOOTSTRAP_SECRET and FRONTEND_URL.
3. Run npm install.
4. Run npm run dev.

The first system administrator is created through POST /api/v1/auth/bootstrap with the x-bootstrap-secret header. Bootstrap is intentionally one-time: it is rejected after an organization exists.

## Security boundary

The frontend only presents permissions. Every protected API checks authentication, organization scope, hotel scope where applicable, and the requested permission on the backend.

## Phase 3 — Staff operations

The API now includes departments, employee profiles, attendance, shift definitions, shift assignments/replacements/overtime, and shift handovers under `/api/v1/staff`. All endpoints require authentication plus the appropriate Phase 3 permission, and hotel-scoped records are checked against the authenticated user's hotel memberships.

### Staff endpoints

- GET/POST/PATCH `/staff/departments`
- GET/POST/PATCH `/staff/employees`
- GET/POST `/staff/attendance`
- GET/POST/PATCH `/staff/shifts`
- GET/POST/PATCH `/staff/assignments`
- POST `/staff/assignments/:assignmentId/replace`
- GET/POST/PATCH `/staff/handovers`
