# Complete Demo Workflow

This is a step-by-step walkthrough of Intent2Commit in action.

## Scenario
You're working on an e-commerce app and notice the checkout process is slow.

---

## Step 1: Capture Intent

**Before writing any code**, capture your intent:

```bash
$ intent "reduce checkout completion time by caching payment provider validation"

✓ Intent captured
  ID: 8f3a-4b2c-9d1e-a1b2
  "reduce checkout completion time by caching payment provider validation"

→ Make your code changes, then run:
  intent commit
```

---

## Step 2: Write Code

Make your changes:

**src/payment/validator.js**
```javascript
const redis = require('redis');
const cache = redis.createClient();

async function validatePaymentMethod(method) {
  // Check cache first
  const cached = await cache.get(`payment:${method.id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Call external provider (slow)
  const result = await paymentProvider.validate(method);
  
  // Cache for 5 minutes
  await cache.set(`payment:${method.id}`, JSON.stringify(result), 'EX', 300);
  
  return result;
}
```

---

## Step 3: Stage Changes

```bash
$ git add src/payment/validator.js
```

---

## Step 4: Commit with Intent

```bash
$ intent commit
```

**Output:**

```
Intent2Commit Workflow

Intent: "reduce checkout completion time by caching payment provider validation"
Captured: 1/5/2026, 11:30:15 PM

→ Analyzing staged changes...
✓ Found 1 file(s) with changes
  +15/-3 lines

→ Checking intent-change alignment...

Intent-Change Alignment Check:

  Score: 95/100 (excellent)

  ✓ No alignment issues detected

Generated Commit Message:
────────────────────────────────────────────────────────────
perf(payment): reduce checkout completion time by caching payment provider validation

Intent:
- reduce checkout completion time by caching payment provider validation

Changes:
- Modified: src/payment/validator.js (+15/-3)

Impact:
- Changes align with stated intent

Intent ID: 8f3a-4b2c-9d1e-a1b2
Alignment Score: 95/100
────────────────────────────────────────────────────────────

? Proceed with this commit? (Y/n) Y

→ Creating commit...
✓ Committed: a8f3c24

→ Saving to intent ledger...
✓ Intent saved to ledger

✓ Intent2Commit workflow complete!

View this commit later:
  intent explain a8f3c24
```

---

## Step 5: View Intent History

```bash
$ intent log

Intent History
────────────────────────────────────────────────────────────

a8f3c24 • 1/5/2026
  Intent: reduce checkout completion time by caching payment provider validation
  Files:  1 changed (+15/-3)
  Align:  95/100 (excellent)

7b2d19f • 1/4/2026
  Intent: fix race condition in inventory decrement
  Files:  2 changed (+28/-15)
  Align:  88/100 (good)
```

---

## Step 6: Repository Archaeology (3 Months Later)

You're debugging an issue and wondering why caching was added:

```bash
$ intent explain a8f3c24

Commit Intent Explanation
────────────────────────────────────────────────────────────

Commit:
  Hash: a8f3c24 (a8f3c2498...)
  Date: 1/5/2026, 11:30:45 PM

Intent:
  "reduce checkout completion time by caching payment provider validation"

Changes:
  • src/payment/validator.js
  Summary: 1 files, +15/-3 lines

Alignment:
  Score: 95/100 (excellent)

💡 This is what the developer was thinking when writing this code.
```

---

## Step 7: View Statistics

```bash
$ intent stats

Intent Statistics
────────────────────────────────────────────────────────────

Overview:
  Total Intents: 24
  Avg Alignment: 87/100

By Type:
  performance       8 (33%)
  bugfix            7 (29%)
  feature           5 (21%)
  refactor          3 (13%)
  security          1 (4%)

Most Changed Files:
  src/payment/validator.js              5 change(s)
  src/checkout/cart.js                  4 change(s)
  src/api/orders.js                     3 change(s)
```

---

## Key Takeaways

✅ **Intent captured before code** - Forces thoughtful development  
✅ **Alignment validation** - Catches scope creep automatically  
✅ **Rich commit messages** - Decision context preserved  
✅ **Queryable history** - Understand "why" months later  
✅ **Pattern insights** - See what drives your codebase evolution

---

**This is Intent2Commit: Human reasoning, preserved forever.**
