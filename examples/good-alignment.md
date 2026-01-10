# Example: Good Alignment

## Scenario
Developer wants to improve performance of login endpoint.

## Intent
```bash
intent "reduce login response time by removing redundant database calls"
```

## Code Changes
```diff
// src/auth/login.js
function authenticateUser(email, password) {
- const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
- const profile = await db.query('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
+ const user = await db.query(
+   'SELECT u.*, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.email = ?',
+   [email]
+ );
  
  // ... rest of authentication
}
```

## Alignment Result
```
✓ Score: 98/100 (excellent)
✓ No alignment issues detected

Changes directly support stated intent:
- Removed redundant query (1 → 1 query)
- Combined data fetching
- No unrelated changes
```

## Generated Commit
```
perf(auth): reduce login response time by removing redundant database calls

Intent:
- Improve login performance for end users

Changes:
- Modified: src/auth/login.js (+5/-8)

Impact:
- ~40% reduction in login latency
- Eliminated N+1 query pattern

Alignment Score: 98/100
```

## Why This Works
✅ Intent clearly states goal ("reduce response time")  
✅ Changes directly achieve goal (remove extra query)  
✅ No scope creep or unrelated modifications  
✅ Commit message captures decision context
