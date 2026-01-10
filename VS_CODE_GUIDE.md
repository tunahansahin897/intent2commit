# VS Code Extension Guide

## Installation

### From VSIX
```bash
cd vscode-extension
npm install
vsce package
code --install-extension intent2commit-0.1.0.vsix
```

### From Marketplace (Coming Soon)
Search for "Intent2Commit" in VS Code Extensions.

---

## Features

### 1. Sidebar Panel
- View current intent
- Quick capture button
- Recent intent history

### 2. Status Bar
- Shows current intent (click to preview)
- Alignment indicator

### 3. Commands
All commands available via Command Palette (`Ctrl+Shift+P`):

- **Intent2Commit: Capture Intent** - Capture new intent
- **Intent2Commit: Preview** - Preview alignment
- **Intent2Commit: Commit** - Commit with intent
- **Intent2Commit: Refresh** - Refresh intent view

---

## Configuration

**File:** `.vscode/settings.json`

```json
{
  "intent2commit.showAlignmentInStatusBar": true,
  "intent2commit.autoRefresh": true
}
```

---

## Workflow

1. **Capture Intent**
   - Click sidebar button OR
   - Command Palette → "Capture Intent"
   - Enter your intent message

2. **Write Code**
   - Intent stays visible in sidebar
   - Status bar shows current intent

3. **Preview**
   - Click status bar OR
   - Command Palette → "Preview"

4. **Commit**
   - Command Palette → "Commit"
   - Auto-generates aligned commit message

---

## Keyboard Shortcuts (Optional)

Add to `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+i",
    "command": "intent2commit.captureIntent"
  },
  {
    "key": "ctrl+shift+p",
    "command": "intent2commit.preview"
  }
]
```

---

## Troubleshooting

### Extension Not Working

**Check CLI Installation:**
```bash
intent --version
```

If not installed:
```bash
npm install -g intent2commit
```

### Sidebar Not Showing

1. View → Open View → Intent2Commit
2. Or click Intent2Commit icon in Activity Bar

---

**Need help?** https://github.com/yourusername/intent2commit/issues
