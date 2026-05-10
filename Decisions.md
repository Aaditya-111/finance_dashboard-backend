# Technical Decisions and Trade-offs

When building this finance dashboard backend, I wanted to focus on getting the fundamentals right: solid database design, real security, and a maintainable architecture. Here’s a breakdown of the core technical decisions I made along the way, including the paths I chose *not* to take and why.

## 1. The RBAC "Permission Matrix" Approach
This was honestly the most satisfying part of the project to put together. Initially, the easiest way to handle roles is to just sprinkle `if (user.role !== 'admin')` throughout the controllers. I’ve done that before, and it becomes a massive headache the second you need to add a "manager" role.

Instead, I decided to decouple roles from permissions entirely. I built a central permission matrix:

```javascript
const permissions = {
  viewer: ['records:read', 'dashboard:read'],
  analyst: ['records:read', 'dashboard:read', 'records:export'],
  admin: ['records:read', 'records:write', 'records:delete', 'dashboard:read', 'users:manage']
};
```

This way, the routes just declare what action they are guarding:
`router.post("/", authorize("records:write"), createRecord);`

**The Trade-off:** It’s a tiny bit more upfront setup than hardcoding roles, but the payoff is huge. If we ever want to introduce a "super-analyst" role, I just add one line to the matrix.

## 2. Pushing Data Aggregation to PostgreSQL
For the dashboard summaries (monthly trends, total income/expense), I originally considered just fetching all the raw records for a user and letting Node.js reduce the arrays into totals. 

I decided against that. Node is fast, but pulling thousands of rows into memory just to sum them up is a terrible practice at scale. Instead, I pushed the heavy lifting to PostgreSQL. I used SQL aggregations (`SUM`, `GROUP BY`, `DATE_TRUNC`) and even window functions like `LAG` for month-over-month growth.

**The Trade-off:** The SQL queries are definitely more complex to write and test than standard `SELECT *`, but the application is significantly more memory-efficient. The database engine is literally built for this kind of math.

## 3. JWTs and "Stale" Roles
For authentication, I went with stateless JWTs. When a user logs in, I encode their `id` and `role` right into the token payload.

**The Trade-off:** Because the role is baked into the token, we save a database trip on every single authenticated request. The downside? If an Admin demotes someone from `analyst` to `viewer`, that user technically retains their analyst privileges until their current token expires (currently set to 7 days). For this specific project, I accepted that risk to prioritize speed and statelessness. In a strict enterprise environment, I'd implement short-lived access tokens (e.g., 15 minutes) paired with a refresh token to force role validation more frequently.

## 4. Soft Deleting Financial Data
In a finance app, data integrity is paramount. If money moves, there needs to be a record of it. Because of this, I completely avoided `DELETE` SQL statements for financial records.

Instead, I added a `deleted_at` timestamp column to the database. When an admin deletes a record, it simply stamps that column with the current time. All our `GET` queries just append `WHERE deleted_at IS NULL`.

**The Trade-off:** Our database will eventually store a bit of "junk" data, but it guarantees we have a reliable audit trail and can easily recover accidentally deleted transactions. 

## 5. Strict Data Types: NUMERIC and UUIDs
**Money is not a FLOAT:** I’ve learned the hard way that using `FLOAT` or `DOUBLE` for financial data leads to weird JavaScript floating-point math errors (the classic `0.1 + 0.2 = 0.30000000000000004` problem). I strictly used `NUMERIC(12,2)` in PostgreSQL to ensure perfect decimal accuracy.

**UUIDs over Auto-Incrementing IDs:** The database uses UUIDs for primary keys instead of your standard `1, 2, 3...` integers. 
**The Trade-off:** They take up slightly more storage space and look uglier in URLs, but they prevent enumeration attacks. A malicious user can't just script a loop to hit `/api/users/83`, `/api/users/84`, etc., to scrape our dataset.

## 6. Parameterized Queries Everywhere
This isn't really a trade-off, just common sense. Every database interaction uses the `pg` driver's parameterized query arrays (e.g., `[userId, amount]`). We don't concatenate SQL strings anywhere in this app, entirely neutralizing the risk of SQL injection.

## Setup Prerequisites
If you wanted to clone and run this project yourself, here's exactly what you need:
- **Node.js (v18+)**: The runtime environment.
- **PostgreSQL**: Used for all persistent storage. You'll need an instance running locally or hosted (e.g., Supabase/Neon).
- **Environment Variables**: A `.env` file detailing your `DATABASE_URL` and a secret string for `JWT_SECRET`. 
- **Database Migrations**: The `src/db/migrations` folder contains manual SQL scripts that need to be run sequentially (`01_create_users.sql`, then `02_create_records.sql`) before the API will function.

## Known Limitations
No project is perfect. Currently, there are a few blind spots:
1. **Self-Registering Admins**: Right now, the registration endpoint has no restriction on creating admin users. In a true production environment, the first admin would be seeded manually, and subsequent admins would need approval from an existing admin.
2. **Missing Pagination metadata**: While endpoints like `GET /api/records` support `limit` and `offset`, the API response doesn't include total counts or "next page" logic, which makes building a frontend pagination component slightly harder.
3. **No Rate Limiting**: The authentication endpoints lack protection against brute-force login attempts.

## Areas for Improvement
If I had another sprint to work on this, here is exactly what I would tackle next:
- **Refresh Tokens**: Moving away from long-lived JWTs to a system using short-lived access tokens (5 minutes) and encrypted HTTP-only refresh cookies. This resolves the "stale role" issue securely.
- **Audit Logging Table**: While soft deletes protect the data, we don't currently track *who* updated a record and *when*. A dedicated audit log table recording `user_id`, `action`, `table`, and `timestamp` would be crucial for a real financial product.
- **Automated Testing**: There are currently no unit or integration tests. Dropping in a framework like Jest to cover the core service logic (especially the authorization matrix and dashboard sql generation) would be my immediate next priority.
