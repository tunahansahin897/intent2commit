# Intent2Commit

**"Kod ne yaptığını söyler. Intent neden yaptığını."**

Transform Git history from a record of changes into a ledger of human decisions.

## 🎯 The Problem

Traditional version control captures **what** changed but loses **why** decisions were made:
- Commit messages are inconsistent and often unhelpful
- Intent behind changes disappears after 3 months
- Future developers reverse engineer decisions from code diffs
- AI can write code but doesn't understand human reasoning

## 🧠 Why Intent Matters

Modern developers constantly switch between editor, terminal, browser, issue trackers, and AI tools. This context-switching creates **systematic context loss**:

**What happens:**
1. Developer forgets **why** code was written (minutes to hours later)
2. Code works, but its relationship to the original goal weakens
3. **Code drift** occurs — code serves itself rather than its purpose

**The impact:**
- New contributors struggle to understand reasoning
- Teams hesitate to modify code they don't understand
- Same problems get solved repeatedly
- Unnecessary complexity accumulates

**The root cause:** Intent is systematically lost, not preserved.

> Read our full [Philosophy](PHILOSOPHY.md) for a deeper exploration of this problem.


## 💡 The Solution

Intent2Commit introduces a paradigm shift in version control:

**Traditional:** `CODE → COMMIT → HISTORY`

**Intent2Commit:** `INTENT → CODE → ALIGNMENT → COMMIT → LEDGER`

This is not "better commit messages" — this is **intent as a first-class Git primitive**.

> **Intent2Commit does not guess intent. It records it — and holds the code accountable to it.**

## ⚡ Key Features

### 1. Intent-First Workflow
Capture your intent **before** writing code:
```bash
intent "reduce login latency by removing redundant queries"
```

### 2. Intent-Change Alignment ⭐
The core innovation: validates whether code changes match stated intent.

**Alignment Factors:**
- Intent keyword ↔ changed module correlation
- Change scope size vs intent scope
- Known anti-pattern detection (performance + logging, etc.)
- Unrelated file modification warnings

```
Intent: "improve login performance"
⚠️  Warning: Added console.log() in auth middleware may slow production
⚠️  Warning: New database query in unrelated checkout flow
Alignment Score: 62/100
```

### 3. Decision-Aware Commits
Generate commits that explain **why**, not just **what**:

```
perf(auth): reduce login latency by removing redundant queries

Intent:
- Improve perceived login speed for end users

Changes:
- Modified: src/auth.js (+15/-32)
- Modified: src/middleware/session.js (+8/-12)

Risks:
- Token cache invalidation depends on TTL

Intent ID: 8f3a-4b2c-9d1e
Alignment Score: 95/100
```

### 4. Repository Archaeology
Understand code decisions months later:

```bash
intent explain a8f3c2
# Shows: what the developer was thinking when writing this code
```

## 🚀 Installation

```bash
npm install -g intent2commit
```

Or use locally in your project:

```bash
npm install --save-dev intent2commit
```

## 📖 Usage

### Basic Workflow

```bash
# 1. Capture your intent BEFORE coding
intent "optimize database queries in user profile endpoint"

# OR use a template for guided intent capture
intent --template performance

# 2. Write your code
# ... make changes ...

# 3. Stage your changes
git add .

# 4. PREVIEW before committing (NEW!)
intent preview
# Shows: changes, alignment estimate, warnings

# 5. Commit with intent alignment check
intent commit
```

### Intent Templates

Use predefined templates for common scenarios:

```bash
# List available templates
intent --template list

# Use a template (interactive)
intent --template performance
intent --template security
intent --template feature
intent --template bugfix
intent --template refactor
```

### Enforce Intent Capture (Recommended for Teams) ⭐ NEW

```bash
# Install Git hooks to make intent mandatory
intent install-hooks

# Now commits are blocked without intent!
$ git commit -m "fix"
✗ No intent found
You must capture your intent before committing.

# Uninstall if needed
intent uninstall-hooks
```

### Auto-Suggest Intent (Optional Helper) ⭐ NEW

```bash
# Get intent suggestions based on your changes
intent suggest

Suggested intents:
  1. "add caching to improve performance"
  2. "update authentication logic"
  3. "refactor auth module"

⚠ These are heuristic suggestions, not AI inference
```

### View Intent History

```bash
# Show all intents
intent log

# Show intents for specific file
intent log --file src/auth.js
```

### Analyze Intent Patterns

```bash
# View statistics
intent stats

# View team performance analytics
intent stats --team
```

### Explain Old Commits

```bash
# Understand why code was written
intent explain a8f3c2
```

## 🎬 Demo Workflow

See a complete example in action:

```bash
# Start with intent
intent "fix memory leak in websocket connections"

# Edit code
# ... fix the issue ...

# Stage changes
git add src/websocket.js

# Commit with alignment check
intent commit

# Shows:
# ✓ Found 1 file(s) with changes
# ✓ Checking intent-change alignment...
#   Score: 98/100 (excellent)
# ✓ No alignment issues detected
```

## 🏗️ How It Works

Intent2Commit consists of 5 core modules:

1. **Intent Capture Layer** - Stores intent before changes
2. **Code Change Analyzer** - Reads git diff and file changes
3. **Intent-Change Alignment Engine** - Validates intent ↔ changes match
4. **Commit Intelligence Generator** - Creates decision-aware commits
5. **Intent Ledger** - Permanent history linked to commits

## 🆚 How Is This Different?

| Traditional Tools | Intent2Commit |
|------------------|---------------|
| Infer intent from code | Capture intent **before** code |
| Generate commit messages | Generate **decision records** |
| "What changed?" | "Why did we decide this?" |
| Commit = snapshot | Commit = intent + changes + alignment |
| No validation | Warns about misaligned changes |

## 🎯 Use Cases

- **Code Review**: Understand the "why" behind changes instantly
- **Onboarding**: New developers understand legacy code decisions
- **Debugging**: Trace intent that led to current implementation
- **AI Collaboration**: Preserve human reasoning when AI writes code
- **Team Alignment**: Share decision context across the team

## 📊 Intent Ledger

Every intent is permanently stored in `.intent-ledger/`:

```json
{
  "intentId": "8f3a-4b2c-9d1e",
  "commitHash": "a8f3c24",
  "intent": "reduce login latency",
  "files": ["src/auth.js"],
  "alignment": {
    "score": 95,
    "level": "excellent"
  }
}
```

Query this ledger to answer:
- "What intents drove this file's evolution?"
- "How many times was performance sacrificed for features?"
- "Show all security-motivated changes"

## 🎓 Philosophy

> In the AI era, code becomes abundant but human intent becomes scarce.
> 
> Intent2Commit preserves the most valuable part of software development:
> **why humans decided to write code this way.**

## 🤝 Contributing

This is an open-source project built for the developer community.

Contributions welcome:
- Report bugs or suggest features via GitHub Issues
- Submit PRs for improvements
- Share your intent-driven workflows

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Built For

Created for [Vibeathon 2026](https://www.bridgemind.ai/vibeathon) - empowering developers with better tools.

---

**Intent2Commit** - Because code tells you what it does, but intent tells you why.

> **"AI can write code. But it can't remember why we wrote it. Intent2Commit does."**
