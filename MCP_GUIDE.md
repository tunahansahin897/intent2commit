# MCP Server Guide

## What is MCP?

Model Context Protocol (MCP) enables AI agents to interact with Intent2Commit programmatically.

---

## Installation

```bash
npm install -g intent2commit-mcp-server
```

---

## Configuration

### Claude Desktop

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### Cline / Other MCP Clients

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

## Available Resources

### `intent://current`
Get current active intent.

```typescript
const intent = await mcp.readResource('intent://current');
// { id, message, timestamp, template }
```

### `intent://history`
Get intent history.

```typescript
const history = await mcp.readResource('intent://history');
```

### `intent://alignment/current`
Get current alignment analysis.

```typescript
const alignment = await mcp.readResource('intent://alignment/current');
// { score, status, warnings, breakdown }
```

---

## Available Tools

### `capture_intent`
```typescript
await mcp.callTool('capture_intent', {
  message: "optimize database queries",
  template: "performance"
});
```

### `check_alignment`
```typescript
const result = await mcp.callTool('check_alignment', {});
// Returns alignment score and recommendations
```

### `commit_with_intent`
```typescript
await mcp.callTool('commit_with_intent', {
  force: false
});
```

---

## AI Agent Workflow Example

```typescript
// 1. Agent reads current intent
const intent = await mcp.readResource('intent://current');

if (!intent) {
  // No intent captured yet
  await mcp.callTool('capture_intent', {
    message: "Suggested intent based on changes"
  
});
}

// 2. Check alignment
const alignment = await mcp.callTool('check_alignment');

if (alignment.score < 70) {
  // Get AI recommendation
  const prompt = await mcp.getPrompt('review_alignment');
  const suggestion = await ai.analyze(prompt);
  
  if (suggestion.shouldSplit) {
    console.log("AI suggests splitting commits");
  }
}

// 3. Proceed with commit
await mcp.callTool('commit_with_intent');
```

---

## Prompts

### `review_alignment`
Ask AI to review alignment and provide recommendations.

```typescript
const prompt = await mcp.getPrompt('review_alignment', {
  includeHistory: true
});
```

AI receives structured context about intent, changes, and alignment.

---

## Benefits for AI Agents

1. **Context Preservation:** AI knows WHY code was written
2. **Decision Tracking:** AI can query past intents
3. **Quality Assurance:** AI checks alignment before committing
4. **Team Learning:** AI learns from team's intent patterns

---

## Debugging

### Check Server Status
```bash
npx intent2commit-mcp-server --version
```

### Test Connection
```bash
# In Claude/Cline
Ask: "What is my current intent?" (uses MCP)
```

---

**Full MCP Spec:** See `mcp-server/MCP_SPEC.md`
