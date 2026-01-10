# GitHub Action Usage Guide

## Quick Setup

Add this workflow to `.github/workflows/intent-check.yml`:

```yaml
name: Intent Fulfillment Check

on:
  pull_request:
    types: [opened, synchronize, edited]

jobs:
  check-intent:
    runs-on: ubuntu-latest
    name: Check Intent Fulfillment
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Intent2Commit Fulfillment Check
        uses: andorabilisim/intent2commit-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          min-fulfillment-score: 70
          fail-on-low-fulfillment: false
          fail-on-drift: false
          comment-on-pr: true
```

---

## Configuration Options

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `github-token` | GitHub token for PR comments | - | ✅ Yes |
| `min-fulfillment-score` | Minimum score (0-100) | 70 | No |
| `fail-on-low-fulfillment` | Fail if score < threshold | false | No |
| `fail-on-drift` | Fail if drift detected | false | No |
| `comment-on-pr` | Post report as comment | true | No |

---

## Usage Scenarios

### 1. Informational Only (Recommended for Start)

```yaml
- uses: andorabilisim/intent2commit-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    fail-on-low-fulfillment: false
    fail-on-drift: false
```

**Result:** Comments on PR, but never fails checks.

---

### 2. Strict Fulfillment (Quality Gate)

```yaml
- uses: andorabilisim/intent2commit-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    min-fulfillment-score: 75
    fail-on-low-fulfillment: true
    fail-on-drift: false
```

**Result:** PR blocked if fulfillment < 75.

---

### 3. Zero Drift Tolerance (Production)

```yaml
- uses: andorabilisim/intent2commit-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    min-fulfillment-score: 70
    fail-on-low-fulfillment: true
    fail-on-drift: true  # 🔒 Strict
```

**Result:** PR blocked on ANY drift. Maximum discipline.

---

## How to Add Intent to PR

### Method 1: PR Description (Preferred)

```markdown
Intent: reduce login latency by 40% via token caching

## Changes
- Added Redis caching layer
- Optimized auth queries
```

### Method 2: PR Title

```
feat: Intent: add user authentication system
```

### Method 3: First Line

```markdown
Improve database query performance

## Details
...
```

---

## What the Action Does

### 1. Intent Extraction
- Looks for `Intent: ` in PR description
- Falls back to PR title
- Falls back to first line of description

### 2. Fulfillment Calculation
- File relevance check
- Drift detection
- Change volume assessment
- Keyword correlation

###3. PR Comment
Posts comprehensive report:
- Fulfillment score with color coding
- Drift warnings (if any)
- Recommendations
- Badge URL

### 4. Check Result
- ✅ Pass: Score meets threshold, no blocking drift
- ❌ Fail: Score too low OR drift detected (if configured)

---

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `fulfillment-score` | Score 0-100 | `88` |
| `fulfillment-level` | Level | `good` |
| `drift-detected` | Boolean | `false` |
| `badge-url` | Badge image URL | `https://img.shields.io/badge/...` |

### Using Outputs

```yaml
- name: Check Intent
  id: intent
  uses: andorabilisim/intent2commit-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}

- name: Use Output
  run: |
    echo "Score: ${{ steps.intent.outputs.fulfillment-score }}"
    echo "Badge: ${{ steps.intent.outputs.badge-url }}"
```

---

## Example PR Comment

```markdown
## ✅ Intent Fulfillment Report

**Declared Intent:** "reduce login latency by 40% via token caching"

**Fulfillment Score:** 🟢 **88/100** (good)

### 📊 Analysis

| Metric | Value |
|--------|-------|
| Files Changed | 5 |
| Relevant Files | 4 (80%) |
| Total Changes | 230 lines |
| Drift Detected | ⚠️ Yes |

### 🚨 Intent Drift Detected

The following files appear to be outside the declared intent scope:

- `logger.js`

**Recommendation:** Consider splitting this PR or updating the intent to include these changes.

---
*Powered by [Intent2Commit](https://github.com/andorabilisim/intent2commit) - Preserving the "why" in Git history*
```

---

## Badge in README

Add to your README:

```markdown
[![Intent Fulfillment](https://img.shields.io/badge/intent--fulfillment-88%25-green)]()
```

Or use action output (in workflow):

```yaml
- name: Update README Badge
  run: |
    echo "![Intent]($ {{ steps.intent.outputs.badge-url }})" >> README.md
```

---

## Best Practices

### 1. Start Lenient
Begin with informational mode:
```yaml
fail-on-low-fulfillment: false
fail-on-drift: false
```

### 2. Gradually Tighten
After team adapts:
```yaml
fail-on-low-fulfillment: true  # After 2 weeks
fail-on-drift: true            # After 1 month
```

### 3. Adjust Threshold
Find your team's sweet spot:
- Strict teams: `min-fulfillment-score: 85`
- Balanced: `min-fulfillment-score: 70`
- Learning: `min-fulfillment-score: 50`

### 4. Educate Team
- Link to Intent2Commit docs in PR template
- Share example intents
- Celebrate good fulfillment scores

---

## Troubleshooting

### "No intent found"
**Fix:** Add `Intent: ` to PR description.

### "Drift detected but it's valid"
**Fix:** Update intent to be broader, or split PR.

### "Score unexpectedly low"
**Check:**
- Are file names related to intent keywords?
- Is change volume too large?
- Too many unrelated files?

---

**Full documentation:** [Intent2Commit GitHub Action](https://github.com/andorabilisim/intent2commit/tree/main/github-action)
