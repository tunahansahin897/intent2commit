# Intent2Commit - Installation & Setup Guide

## 📦 Quick Installation

### Prerequisites
- **Node.js** v14.0.0 or higher
- **npm** (comes with Node.js)
- **Git** (required for full functionality)

### Install from npm (When Published)
```bash
npm install -g intent2commit
```

### Install from Source (Current)
```bash
# Clone repository
git clone https://github.com/yourusername/intent2commit.git
cd intent2commit

# Install dependencies
npm install

# Link globally
npm link

# Verify installation
intent --version
```

---

## 🚀 First-Time Setup

### 1. Initialize in Your Repository
```bash
cd your-project
intent install-hooks
```

**Output:**
```
✓ Git hooks installed successfully

What this does:
  • Blocks commits without captured intent
  • Enforces intent-first workflow
  • Reminds developers to think before coding

⚡ Intent capture is now MANDATORY for this repository
```

### 2. Test Your Setup
```bash
# Try to commit without intent
git commit -m "test"

# Expected output:
✗ No intent found
You must capture your intent before committing.
```

---

## 💡 Basic Usage Workflow

### Step 1: Capture Intent (BEFORE Coding)
```bash
intent "reduce login latency by removing redundant database queries"
```

**Or use a template:**
```bash
intent --template performance

→ What are you optimizing? login latency
→ Current baseline (ms)? 1200
→ Target (ms)? 800
→ Risk accepted? Reduced logging
```

**Output:**
```
✓ Intent captured
  ID: a8f3c2b4-9d1e
  "reduce login latency from 1200ms to 800ms"

→ Make your code changes, then run:
  intent commit
```

---

### Step 2: Write Your Code
Make your changes as usual.

---

### Step 3: Preview (Recommended)
```bash
git add .
intent preview
```

**Output:**
```
┌─────────────────────────────────────────┐
│ INTENT PREVIEW                          │
└─────────────────────────────────────────┘

Intent:
  "reduce login latency from 1200ms to 800ms"

Changes Detected:
✓ auth.js: Removed blocking DB call (+8/-15)
✓ cache.js: Added Redis cache (+42/-0)
⚠ logger.js: Added verbose logging (+12/-2)

Alignment Estimate: 72/100

⚠ WARNINGS:
  Verbose logging may conflict with performance goal
  in logger.js

Summary:
  Files changed: 3
  Lines changed: +62/-17

→ To commit with this intent:
  intent commit
```

---

### Step 4: Commit with Intent
```bash
intent commit
```

**Process:**
1. Analyzes your Git diff
2. Validates intent-change alignment
3. Generates decision-aware commit message
4. Prompts for confirmation
5. Creates Git commit
6. Saves to permanent ledger

**Generated Commit Message:**
```
perf(auth): reduce login latency from 1200ms to 800ms

Intent:
- Reduce login response time from 1200ms to 800ms

Changes:
- Modified: src/auth.js (+8/-15)
- Modified: src/cache.js (+42/-0)
- Modified: src/logger.js (+12/-2)

Impact:
- Performance optimization with caching
- Reduced database calls

Risks:
- Added logging may slow production
- Cache invalidation needs monitoring

Intent ID: a8f3c2b4
Alignment Score: 72/100
```

---

## 🔧 Advanced Configuration

### Uninstall Hooks (Make Intent Optional)
```bash
intent uninstall-hooks
```

### Get Intent Suggestions
```bash
git add .
intent suggest

# Output:
Suggested intents:
  1. "add caching to improve performance"
  2. "update authentication logic"
  3. "refactor auth module"

⚠ These are heuristic suggestions, not AI inference
```

---

## 📊 Querying Intent History

### View All Intents
```bash
intent log
```

### View Intents for Specific File
```bash
intent log --file src/auth.js
```

### View Statistics
```bash
# Basic stats
intent stats

# Team analytics
intent stats --team
```

### Explain Old Commit
```bash
intent explain a8f3c2
```

---

## 🎯 Team Setup

### For Team Leads
```bash
# Setup repository
cd your-project
intent install-hooks

# Add setup instructions to team onboarding:
# "Run: npm install -g intent2commit && intent install-hooks"
```

### Team Policy (Optional)
Create `.intent2commit.json` in repository root:
```json
{
  "enforcement": "team",
  "minAlignment": 70,
  "requireTemplate": false
}
```

---

## 🐛 Troubleshooting

### "Not in a Git repository"
```bash
# Initialize Git first
git init
```

### "No staged changes found"
```bash
# Stage your changes
git add <files>
```

### "Permission denied" on hooks
```bash
# Unix/Linux/Mac only
chmod +x .git/hooks/pre-commit
```

### Hooks Not Working
```bash
# Reinstall hooks
intent uninstall-hooks
intent install-hooks
```

---

## 📁 File Structure After Installation

```
your-project/
├── .git/
│   └── hooks/
│       └── pre-commit        ← Intent2Commit hook
├── .intent-cache/            ← Temporary (gitignored)
│   └── current-intent.json
├── .intent-ledger/           ← Permanent (committed)
│   ├── index.json
│   └── <commit-hash>.json
└── .intent2commit.json       ← Optional config
```

---

## 🔄 Updating Intent2Commit

### From npm
```bash
npm update -g intent2commit
```

### From Source
```bash
cd intent2commit
git pull
npm install
npm link
```

---

## ✅ Verify Installation

```bash
# Check version
intent --version

# Check help
intent --help

# Test module loading
node -e "require('intent2commit/src/index'); console.log('✓ OK')"
```

---

## 🎓 Learning Path

**Day 1:** Install + Basic workflow
```bash
intent "message" → code → intent commit
```

**Day 2:** Use templates
```bash
intent --template <type>
```

**Day 3:** Preview before commit
```bash
intent preview
```

**Day 4:** Install hooks (enforce)
```bash
intent install-hooks
```

**Week 2:** Explore archaeology
```bash
intent log, intent stats, intent explain
```

---

## 💬 Getting Help

- **Documentation:** See `COMMANDS.md` for all commands
- **GitHub Issues:** [Create an issue](https://github.com/yourusername/intent2commit/issues)
- **Quick Start:** See `QUICKSTART.md`
- **Examples:** See `examples/` directory

---

**Installation Complete!**  
**Next:** Run `intent --help` or see `QUICKSTART.md`
