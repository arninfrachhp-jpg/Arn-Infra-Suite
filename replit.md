# ARN INFRA - Field Management Tool

## Overview

Mobile application for ARN INFRA construction company built with Expo (React Native) and Express backend. Tracks daily labor counts, square meters of work completed, and working channels across construction projects.

## Stack

- **Frontend**: Expo (React Native) with TypeScript
- **Backend**: Express 5 (Node.js)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Token-based (JWT-like) authentication
- **Monorepo**: pnpm workspaces
- **API Codegen**: Orval (OpenAPI → React Query hooks + Zod schemas)

## User Roles

- **Admin** (admin@arninfra.com / admin123): Full access — data entry, dashboard, reports, user management, Excel/PDF export
- **Operator** (operator@arninfra.com / operator123): Data entry only

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/scripts run seed` — seed initial users

## Project Structure

- `artifacts/mobile/` — Expo mobile app (React Native)
- `artifacts/api-server/` — Express API server
- `lib/api-spec/` — OpenAPI specification
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/db/` — Database schema (Drizzle ORM)
- `scripts/` — Utility scripts (seed, etc.)

## Database Tables

- `users` — name, email, password (hashed), role (admin/operator)
- `work_entries` — date, labour_count, square_meter, working_channel, created_by

## API Endpoints

- POST `/api/auth/login` — Login
- GET `/api/auth/me` — Current user
- GET/POST `/api/users` — List/create users (admin only)
- PATCH/DELETE `/api/users/:id` — Update/delete users (admin only)
- GET/POST `/api/work-entries` — List/create work entries
- PATCH/DELETE `/api/work-entries/:id` — Update/delete work entries
- GET `/api/reports/summary` — Report summary (admin only)
- GET `/api/reports/export-excel` — Export CSV (admin only)
- GET `/api/reports/export-pdf` — Export HTML report (admin only)
- GET `/api/dashboard/stats` — Dashboard statistics
