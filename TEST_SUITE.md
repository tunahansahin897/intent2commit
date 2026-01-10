# Intent2Commit - Test Suite

## Manual Test Checklist

### ✅ Core Features

#### 1. Intent Capture
- [ ] `intent "test message"` - Creates intent cache
- [ ] `intent --template performance` - Uses template
- [ ] `intent --template list` - Lists all templates
- [ ] Verify `.intent-cache/current-intent.json` created

#### 2. Intent Commit
- [ ] Stage changes: `git add .`
- [ ] `intent commit` - Creates commit with alignment
- [ ] Verify commit message format
- [ ] Verify `.intent-ledger/intent-commits.json` updated

#### 3. Intent Preview
- [ ] `intent preview` - Shows basic preview
- [ ] `intent preview --visual` - Shows visual diff
- [ ] `intent preview --matrix` - Shows alignment matrix
- [ ] Verify alignment score displayed

#### 4. Intent Log
- [ ] `intent log` - Shows all history
- [ ] `intent log -f src/test.js` - File-specific
- [ ] `intent log -n 5` - Limited results

#### 5. Intent Stats
- [ ] `intent stats` - Shows basic stats
- [ ] `intent stats --team` - Team analytics

---

### ✅ Level 1 Features

#### 6. Intent Branching
- [ ] `intent branch "test feature"` - Creates branch
- [ ] Verify branch name: `intent/test-feature`
- [ ] `intent branches` - Lists all intent branches
- [ ] Verify metadata in `.intent-cache/branches/`

#### 7. Intent Edit/Undo
- [ ] `intent edit "new message"` - Edits current
- [ ] `intent edit "msg" --reason "test"` - With reason
- [ ] `intent undo` - Restores previous
- [ ] `intent history` - Shows edit history

---

### ✅ Templates v2

#### 8. New Templates
- [ ] `intent --template docs` - Documentation template
- [ ] `intent --template test` - Test template
- [ ] `intent --template hotfix` - Hotfix template
- [ ] `intent --template dependency` - Dependency template
- [ ] `intent --template migration` - Migration template
- [ ] `intent --template experiment` - Experiment template

---

### ✅ Alignment Matrix

#### 9. Matrix Display
- [ ] `intent preview --matrix` - Shows matrix
- [ ] Verify per-file scoring
- [ ] Verify heatmap visualization

#### 10. Matrix Export
- [ ] `intent export-alignment ./report.csv` - CSV export
- [ ] Verify CSV format
- [ ] Verify file contents

---

### ✅ Git Hooks

#### 11. Hook Installation
- [ ] `intent install-hooks` - Installs hooks
- [ ] Verify `.git/hooks/pre-commit` exists
- [ ] Verify `.git/hooks/commit-msg` exists
- [ ] Test pre-commit hook (should check for intent)

#### 12. Hook Uninstall
- [ ] `intent uninstall-hooks` - Removes hooks
- [ ] Verify hooks removed

---

### ✅ Config System

#### 13. Configuration
- [ ] Create `.intent2commit.json` with custom rules
- [ ] Verify config loaded
- [ ] Test custom penalties
- [ ] Test ignore patterns

---

### ✅ Progress Indicators

#### 14. Loading States
- [ ] Run any command
- [ ] Verify spinner/progress shown
- [ ] Verify smooth animations

---

## Automated Tests (TODO)

### Unit Tests

```bash
npm test
```

**Test Coverage:**
- [ ] `capture.js` - Intent capture
- [ ] `alignment.js` - Alignment scoring
- [ ] `branching.js` - Branch operations
- [ ] `templates.js` - Template management
- [ ] `alignment-matrix.js` - Matrix calculations

---

### Integration Tests

```bash
npm run test:integration
```

**Scenarios:**
- [ ] Full workflow: capture → code → preview → commit
- [ ] Template usage
- [ ] Branch creation and switching
- [ ] Edit/undo operations
- [ ] Config file loading

---

## Performance Tests

### Large Repository Test

**Setup:**
```bash
# Create repo with 100+ commits
git log --oneline | wc -l
```

**Tests:**
- [ ] `intent log` performance (< 1s)
- [ ] `intent stats` performance (< 2s)
- [ ] Alignment check with 50+ files (< 3s)

---

### Memory Usage

**Monitor:**
```bash
/usr/bin/time -v intent commit
```

**Targets:**
- Peak memory < 100MB
- No memory leaks

---

## Error Handling Tests

### 15. No Git Repository
- [ ] Run `intent` outside Git repo
- [ ] Verify friendly error message

### 16. No Intent Captured
- [ ] Run `intent commit` without intent
- [ ] Verify error message

### 17. No Staged Changes
- [ ] Capture intent
- [ ] Run `intent preview` without staging
- [ ] Verify warning message

### 18. Git Not Installed
- [ ] Simulate missing Git
- [ ] Verify error handler triggered

---

## VS Code Extension Tests

### 19. Extension Installation
- [ ] Install VSIX
- [ ] Verify extension loaded
- [ ] Check sidebar appears

### 20. Extension Commands
- [ ] Command Palette → "Capture Intent"
- [ ] Enter intent, verify saved
- [ ] Preview command works
- [ ] Commit command works

### 21. Status Bar
- [ ] Verify intent shown in status bar
- [ ] Click status bar → opens preview
- [ ] Auto-refresh on file save

---

## GitHub Action Tests

### 22. Action Workflow
- [ ] Create test repo
- [ ] Add `.github/workflows/intent-check.yml`
- [ ] Make PR with intent in description
- [ ] Verify action runs
- [ ] Verify PR comment posted

---

## Web Dashboard Tests

### 23. Dashboard Launch
- [ ] `cd web-dashboard && npm install`
- [ ] `npm run dev`
- [ ] Verify opens at `localhost:3000`
- [ ] Verify no console errors

### 24. Dashboard Features
- [ ] Stats cards display correctly
- [ ] Charts render (D3.js)
- [ ] Navigation works
- [ ] API calls successful

---

## MCP Server Tests

### 25. Server Launch
- [ ] Start MCP server
- [ ] Verify no errors
- [ ] Test resource endpoint
- [ ] Test tool endpoint

---

## Browser Compatibility

### 26. Dashboard Browser Tests
- [ ]  Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Responsiveness

### 27. Dashboard Mobile
- [ ] 375px width (mobile)
- [ ] 768px width (tablet)
- [ ] 1024px width (desktop)
- [ ] All elements readable

---

## Test Results Template

```markdown
## Test Run: [Date]

**Environment:**
- OS: [Windows/Mac/Linux]
- Node: [version]
- Git: [version]

**Results:**
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

**Failed Tests:**
1. [Test name] - [Reason]

**Notes:**
- [Any observations]
```

---

## Continuous Testing

```bash
# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Target Coverage:** 80%+

---

**All tests should pass before GitHub upload!**
