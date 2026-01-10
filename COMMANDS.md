# Intent2Commit - Complete Command Reference

## 📚 Table of Contents

- [Core Commands](#core-commands)
- [Level 1 Features](#level-1-features)
- [Level 2 Features](#level-2-features)
- [Configuration](#configuration)
- [Quick Reference](#quick-reference)

---

## Core Commands

### `intent <message>`
Capture your intent before writing code.

```bash
intent "optimize database queries in user profile endpoint"
```

**Options:**
- `-t, --template <name>` - Use a template

**Examples:**
```bash
intent "reduce login latency from 1200ms to 800ms"
intent --template performance
```

---

### `intent commit`
Commit changes with intent-aware message generation.

```bash
git add .
intent commit
```

---

### `intent preview`
Preview intent and staged changes.

```bash
intent preview              # Compact view
intent preview --visual     # Full visual diff
intent preview --matrix     # Per-file alignment matrix
```

---

### `intent log`
Show intent history.

```bash
intent log
intent log -f src/auth.js   # File-specific
```

---

### `intent stats`
Show statistics.

```bash
intent stats
intent stats --team         # Team analytics
```

---

## Level 1 Features

### `intent branch <message>`
Create Git branch with intent metadata.

```bash
intent branch "add payment integration"
# Creates: intent/add-payment-integration
```

---

### `intent edit <message>`
Edit current intent.

```bash
intent edit "new message" --reason "scope change"
```

---

### `intent undo`
Undo last intent change.

```bash
intent undo
```

---

### `intent history`
View intent edit history.

```bash
intent history
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `intent <msg>` | Capture intent |
| `intent commit` | Commit with intent |
| `intent preview` | Preview changes |
| `intent preview --visual` | Visual diff |
| `intent preview --matrix` | Alignment matrix |
| `intent log` | Intent history |
| `intent stats` | Statistics |
| `intent branch <msg>` | Create intent branch |
| `intent edit <msg>` | Edit intent |
| `intent undo` | Undo last change |
| `intent history` | Edit history |
| `intent --template <name>` | Use template |

---

**Full documentation:** https://github.com/yourusername/intent2commit
