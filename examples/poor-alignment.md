# Example: Poor Alignment

## Scenario
Developer wants to improve performance but makes unrelated changes.

## Intent
```bash
intent "optimize API response time"
```

## Code Changes
```diff
// src/api/users.js
function getUsers() {
+ console.log('Fetching users...'); // Added logging
+ console.log('Query params:', req.query);
  
  const users = await db.query('SELECT * FROM users');
  
+ // Added email validation
+ users.forEach(user => {
+   if (!validateEmail(user.email)) {
+     console.warn('Invalid email:', user.email);
+   }
+ });
  
  return users;
}

// src/api/products.js (unrelated file)
function getProducts() {
+ // Added new feature
+ const featured = await db.query('SELECT * FROM featured_products');
  const products = await db.query('SELECT * FROM products');
  
  return products;
}
```

## Alignment Result
```
⚠ Score: 45/100 (poor)

Warnings:
● Added logging may impact performance (intent: optimize performance)
    in src/api/users.js
● New async operation detected while optimizing for performance
    in src/api/products.js
○ 2 files changed - may contain unrelated changes

Suggestions:
• Review warnings before committing
• Your changes may not fully align with stated intent
• Consider splitting into multiple focused commits
```

## What Went Wrong
❌ **Added logging** - Contradicts performance goal  
❌ **Email validation loop** - New processing overhead  
❌ **Modified unrelated file** - products.js change is scope creep  
❌ **New database query** - Adds latency instead of reducing it

## How to Fix

### Option 1: Refine Changes
Remove unrelated modifications and focus only on performance:
```bash
# Unstage everything
git reset

# Only stage actual performance improvements
git add src/api/users.js  # (remove logging/validation first)

# Update intent if needed
intent "optimize user API query by adding pagination"
intent commit
```

### Option 2: Split Into Multiple Commits
```bash
# Commit 1: Performance
intent "add pagination to reduce query size"
git add src/api/users.js  # (only pagination code)
intent commit

# Commit 2: Logging
intent "add debugging logs for troubleshooting"
git add src/api/users.js  # (only logging code)
intent commit

# Commit 3: Feature
intent "add featured products endpoint"
git add src/api/products.js
intent commit
```

## Lesson
Intent2Commit catches **scope creep** and **contradictory changes** that would otherwise slip into commits unnoticed.

This prevents technical debt and makes code review easier.
