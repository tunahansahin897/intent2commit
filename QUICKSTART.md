# Quick Start Guide

Get started with Intent2Commit in 5 minutes.

## Installation

### Option 1: Global Install (Recommended)
```bash
npm install -g intent2commit
```

### Option 2: Local Development
```bash
cd intent2commit
npm install
npm link
```

## First Steps

### 1. Navigate to a Git Repository
```bash
cd /path/to/your/project
```

### 2. Capture Your Intent
```bash
intent "fix memory leak in background worker"
```

Output:
```
✓ Intent captured
  "fix memory leak in background worker"

→ Make your code changes, then run:
  intent commit
```

### 3. Make Your Code Changes
Edit your files to implement the intent.

### 4. Stage Changes
```bash
git add .
```

### 5. Commit with Intent
```bash
intent commit
```

This will:
- Analyze your staged changes
- Check intent-change alignment
- Generate a decision-aware commit message
- Prompt for confirmation
- Save intent to ledger

## Common Commands

### View Intent History
```bash
# All intents
intent log

# Specific file
intent log --file src/worker.js
```

### View Statistics
```bash
intent stats
```

### Explain a Commit
```bash
intent explain a8f3c2
```

## Tips

✅ **Capture intent BEFORE coding** - This forces you to think through your approach

✅ **Keep intents specific** - "reduce login latency" is better than "improve performance"

✅ **Pay attention to alignment scores** - Scores below 70 suggest scope creep

✅ **Use intent log** - Review your decision patterns over time

## Troubleshooting

### "No staged changes found"
→ Run `git add` before `intent commit`

### "No intent found"
→ Run `intent "your message"` before making code changes

### Command not found
→ Ensure you've installed the package (`npm install -g intent2commit`)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [examples/](examples/) for workflow demonstrations
- View [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for video guide

---

**Remember:** Intent first, code second. That's the paradigm shift.
