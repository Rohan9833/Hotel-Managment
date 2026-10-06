# Hotel Management API — Phase 1

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