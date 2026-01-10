# MCP Integration Configurations

Intent2Commit MCP server works with all major AI coding tools.

---

## Cursor

**File:** `~/.cursor/mcp_config.json` (Mac/Linux) or `%APPDATA%\.cursor\mcp_config.json` (Windows)

```json
{
  "mcpServers": {
    "intent2commit": {
      "command": "npx",
      "args": ["-y", "intent2commit-mcp-server"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

---

## Windsurf

**File:** `~/.windsurf/mcp.json`

```json
{
  "servers": {
    "intent2commit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "intent2commit-mcp-server"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

---

## Antigravity (Gemini)

**File:** `.agent/mcp-config.json` in your project

```json
{
  "mcpServers": {
    "intent2commit": {
      "command": "node",
      "args": ["./node_modules/intent2commit/mcp-server/server.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

---

## Claude Desktop

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)  
**File:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "intent2commit": {
      "command": "npx",
      "args": ["-y", "intent2commit-mcp-server"],
      "env": {
        "WORKSPACE_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

---

## Cline (VS Code)

**File:** `.vscode/mcp.json`

```json
{
  "mcp.servers": {
    "intent2commit": {
      "type": "node",
      "module": "intent2commit-mcp-server",
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

---

## Usage Examples

### In Cursor/Windsurf/Antigravity

```
You: "What's my current intent?"
AI: *Uses MCP to query intent://current*
    "Your current intent is: reduce login latency by 40% via caching"

You: "Check if my changes fulfill the intent"
AI: *Uses check_alignment tool*
    "Fulfillment score: 88/100
     ⚠️ Drift warning: logger.js is outside expected scope"

You: "Should I commit?"
AI: *Analyzes and recommends*
    "Your fulfillment is good (88%), but consider removing 
     the logging changes or updating your intent to include debugging."
```

---

## Available MCP Resources

```
intent://current          - Get current intent
intent://history          - Get intent history
intent://alignment/current - Get current fulfillment analysis
```

---

## Available MCP Tools

```
capture_intent(message, template)    - Capture new intent
check_alignment()                    - Check fulfillment
commit_with_intent(force)            - Commit with intent
suggest_split(reason)                - Suggest commit split
query_intent_history(filter, limit)  - Query history
```

---

## Available MCP Prompts

```
review_alignment(includeHistory)  - AI reviews fulfillment
suggest_intent()                  - AI suggests intent from changes
```

---

## Verification

After setup, ask your AI tool:

```
"Can you access Intent2Commit via MCP?"
```

AI should respond with available resources and tools.

---

## Troubleshooting

### "MCP server not found"
```bash
# Install globally
npm install -g intent2commit

# Or use npx (auto-install)
npx -y intent2commit-mcp-server
```

### "Workspace root not set"
Ensure `WORKSPACE_ROOT` environment variable points to your Git repository root.

### "Permission denied"
```bash
chmod +x ./node_modules/intent2commit/mcp-server/server.js
```

---

**For more details:** See [MCP_GUIDE.md](../MCP_GUIDE.md)
