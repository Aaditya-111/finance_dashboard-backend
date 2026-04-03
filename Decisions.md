Design Decisions-

RBAC with permission matrix:-

This was the most interesting part to build. A simple role check looks like this:

````js
if (req.user.role !== 'admin') return res.status(403).json(...)


The problem is when you have 20 routes doing this differently, adding a new role means hunting through every file. Instead I built one permission matrix:
```js
const permissions = {
  viewer: ['records:read', 'dashboard:read'],
  analyst: ['records:read', 'dashboard:read', 'records:export'],
  admin: ['records:read', 'records:write', 'records:delete', 'dashboard:read', 'users:manage']
};
````

Every route just declares what it needs:

```js
router.post("/", authorize("records:write"), createRecord);
```

Adding a new role means updating one object. Nothing else changes.

SQL aggregations for dashboard:-

I could have fetched all records and calculated totals in JavaScript. Instead I pushed the work to PostgreSQL using SUM, GROUP BY, and DATE_TRUNC. The monthly trends query also uses the LAG window function to calculate month over month income growth percentage in a single query.

This is faster, uses less memory, and keeps the service layer thin. The database is better at aggregating data than application code.

Soft delete for records:-

Financial records are never permanently deleted. Instead a deleted_at timestamp is set. This means:

- Deleted records are hidden from all API responses
- The data stays in the database for auditing
- Accidental deletions can be recovered

This matters in finance — you should always be able to trace where money went.

Role in JWT payload:-

Storing the role in the JWT token means every authenticated request has role information without hitting the database. The tradeoff is that if an admin changes a user's role, the old role stays active until the token expires (7 days). For an internal dashboard this is acceptable.

In production I would use short lived access tokens (15 minutes) with refresh token rotation — that way role changes reflect quickly.

UUID over integer IDs:-

UUIDs prevent enumeration attacks where someone guesses sequential IDs like /api/users/1, /api/users/2. They also make it easier to merge data from multiple sources later.

NUMERIC for money:-

FLOAT and DOUBLE cause rounding errors with currency. NUMERIC(12,2) stores exact decimal values — important when you are tracking financial data.

Parameterized queries:-

Every database query uses $1, $2 placeholders instead of string concatenation. This prevents SQL injection at the database driver level.
