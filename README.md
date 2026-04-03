Finance Dashboard Backend:-

A fundamentally strong finance management dashboard backend with core backend concepts — API design, role-based access control, database modeling, and data aggregation.

Built with Node.js, Express, and PostgreSQL.

What this project does:-

This is a backend API for a finance dashboard where different users interact with financial records based on their role. An admin can create and manage records, an analyst can view and export data, and a viewer can only read the dashboard.

Tech Stack:-

- Node.js + Express
- PostgreSQL
- JWT for authentication
- Zod for validation
- bcryptjs for password hashing

Roles and Permissions:-

There are three roles in the system:

- Admin — full access. Can create, update, and delete records, and manage all users.
- Analyst — can view all records and dashboard data, and export records.
- Viewer — read only. Can view records and dashboard but cannot make any changes.

Local Setup:-

1. Clone the repository and install dependencies
   bash
   npm install

2. Create a `.env` file in the root directory
   env
   PORT=3000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_dashboard
   JWT_SECRET=your_random_secret_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

3. Create the database in PostgreSQL
   sql
   CREATE DATABASE finance_dashboard;

4. Run the migration files from `src/db/migrations/` in pgAdmin Query Tool — run `01_create_users.sql` first, then `02_create_records.sql`

5. Start the server
   bash
   npm run dev

Server runs on `http://localhost:3000`

API Reference:-

Base URL: `http://localhost:3000`

Auth:- (no token needed)

- `POST /api/auth/register` — create a new account
- `POST /api/auth/login` — login and receive a token
- `GET /api/auth/me` — get your own profile (token required)

Records:- (token required)

- `GET /api/records` — get your records, supports filtering by type, category, date
- `GET /api/records/:id` — get a single record
- `POST /api/records` — create a record (admin only)
- `PUT /api/records/:id` — update a record (admin only)
- `DELETE /api/records/:id` — soft delete a record (admin only)

Dashboard:- (token required)

- `GET /api/dashboard/summary` — total income, expenses and net balance
- `GET /api/dashboard/by-category` — totals grouped by category
- `GET /api/dashboard/trends` — monthly breakdown with growth percentage
- `GET /api/dashboard/recent` — last 10 transactions

Users:- (token required, admin only)

- `GET /api/users` — list all users
- `PATCH /api/users/:id/role` — change a user's role
- `PATCH /api/users/:id/toggle-status` — activate or deactivate a user
- `DELETE /api/users/:id` — delete a user

Filtering records:-

- `GET /api/records?type=income`
- `GET /api/records?category=Salary`
- `GET /api/records?date_from=2026-01-01&date_to=2026-04-01`
- `GET /api/records?limit=5&offset=0`

Assumptions:-

- Users can only see and manage their own records
- Role changes don't reflect until the current JWT expires — this is a known tradeoff of storing role in the token payload
- Soft delete is used for records because financial data should never be permanently removed
- Admin can register other admins through the register endpoint — in a production system this would be restricted

Design Decisions:-

Permission matrix over simple role checks:-
Instead of checking roles directly in each route, I built a centralized permission matrix that maps roles to permissions. Adding a new role means updating one object, not searching through all route files.

SQL aggregations for dashboard:-
All dashboard calculations are done at the database level using SUM, GROUP BY, and window functions like LAG for growth percentage. This keeps the service layer thin and is faster than fetching all records and calculating in JavaScript.

Soft delete for records:-
Financial records are never permanently deleted. A deleted_at timestamp marks them as deleted while keeping the data intact for auditing purposes.

JWT payload includes role:-
The user role is stored in the JWT token to avoid a database lookup on every authenticated request. The tradeoff is that role changes don't reflect until the token expires.

Parameterized queries:-
All database queries use parameterized inputs to prevent SQL injection.

NUMERIC for money:-
Used NUMERIC(12,2) instead of FLOAT to avoid floating point rounding errors with currency values.

What I would improve with more time:-

- Refresh token rotation with short lived access tokens
- Rate limiting on auth endpoints to prevent brute force attacks
- Audit log to track who changed what and when
- Unit tests for all service functions
- Better pagination with total count and page info in responses
- Search across records by notes or category
