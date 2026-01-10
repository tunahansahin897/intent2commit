# Intent2Commit MCP Server Specification

## Model Context Protocol (MCP) Integration

This document defines the MCP server implementation for Intent2Commit, enabling AI agents to interact with intent-driven Git workflows.

---

## Protocol Overview

The Intent2Commit MCP server exposes intent capture, alignment checking, and decision archaeology capabilities to AI agents via standardized protocol.

**Server Name:** `intent2commit`  
**Version:** `1.0.0`  
**Protocol:** Model Context Protocol v1.0

---

## Resources

### 1. Current Intent Resource

```typescript
{
  uri: "intent:/ /current",
  name: "Current Intent",
  description: "The currently active intent for upcoming changes",
  mimeType: "application/json"
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "string",
  "timestamp": "ISO8601",
  "template": "string | null"
}
```

---

### 2. Intent History Resource

```typescript
{
  uri: "intent://history",
  name: "Intent History",
  description": "Historical record of all captured intents",
  mimeType: "application/json"
}
```

**Response:**
```json
{
  "intents": [
    {
      "id": "uuid",
      "message": "string",
      "timestamp": "ISO8601",
      "commitHash": "string | null",
      "alignmentScore": "number | null"
    }
  ]
}
```

---

### 3. Alignment Report Resource

```typescript
{
  uri: "intent://alignment/current",
  name: "Current Alignment Report",
  description: "Alignment analysis for staged changes vs current intent",
  mimeType: "application/json"
}
```

**Response:**
```json
{
  "score": 85,
  "alignment": "excellent",
  "warnings": [],
  "breakdown": {
    "intentClarity": 90,
    "fileScope": 85,
    "codeVolume": 80,
    "riskPatterns": -5
  },
  "topIssue": "string | null"
}
```

---

## Tools

### 1. `capture_intent`

Capture developer intent before code changes.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The intent message"
    },
    "template": {
      "type": "string",
      "description": "Optional template name",
      "enum": ["performance", "security", "feature", "bugfix", "refactor"]
    }
  },
  "required": ["message"]
}
```

**Output:**
```json
{
  "id": "uuid",
  "message": "string",
  "timestamp": "ISO8601",
  "success": true
}
```

---

### 2. `check_alignment`

Check alignment between intent and staged changes.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "intentId": {
      "type": "string",
      "description": "Intent ID to check against (optional, uses current if omitted)"
    }
  }
}
```

**Output:**
```json
{
  "score": 85,
  "alignment": "excellent",
  "warnings": [
    {
      "severity": "medium",
      "message": "string",
      "file": "string"
    }
  ],
  "recommendation": "proceed | review | split"
}
```

---

### 3. `commit_with_intent`

Execute commit with intent-aware message generation.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "force": {
      "type": "boolean",
      "description": "Force commit even with low alignment",
      "default": false
    }
  }
}
```

**Output:**
```json
{
  "commitHash": "string",
  "message": "string",
  "alignmentScore": 85,
  "success": true
}
```

---

### 4. `suggest_split`

Suggest how to split changes for better alignment.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string",
      "description": "Reason for split suggestion"
    }
  },
  "required": ["reason"]
}
```

**Output:**
```json
{
  "suggestions": [
    {
      "intent": "string",
      "files": ["string"],
      "rationale": "string"
    }
  ]
}
```

---

### 5. `query_intent_history`

Query historical intents with filtering.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filter": {
      "type": "string",
      "description": "Search query"
    },
    "limit": {
      "type": "number",
      "default": 10
    }
  }
}
```

**Output:**
```json
{
  "results": [
    {
      "id": "uuid",
      "message": "string",
      "timestamp": "ISO8601",
      "commitHash": "string",
      "alignmentScore": 85
    }
  ]
}
```

---

## Prompts

### 1. `review_alignment`

**Name:** Review Alignment  
**Description:** Ask AI to review current alignment and provide recommendations

**Arguments:**
- `includeHistory`: boolean - Include recent alignment history

**Prompt Template:**
```
You are reviewing the alignment between developer intent and code changes.

Intent: {{currentIntent.message}}
Alignment Score: {{alignment.score}}/100

{{#if alignment.warnings}}
Warnings:
{{#each alignment.warnings}}
- {{this.message}}
{{/each}}
{{/if}}

Based on this alignment analysis, provide:
1. Assessment of whether to proceed, review, or split
2. Specific recommendations for improving alignment
3. Potential risks if proceeding with current alignment
```

---

### 2. `suggest_intent`

**Name:** Suggest Intent  
**Description:** AI suggests intent based on staged changes

**Prompt Template:**
```
Based on the following code changes, suggest a clear, concise intent statement:

Files Changed:
{{#each files}}
- {{this.file}}: +{{this.insertions}}/-{{this.deletions}}
{{/each}}

Generate an intent that:
1. Captures the "why" behind these changes
2. Is specific and measurable
3. Follows the pattern: "verb + target + goal"
```

---

## Server Implementation

### TypeScript Interface

```typescript
interface Intent2CommitMCPServer {
  // Resources
  getResource(uri: string): Promise<Resource>;
  listResources(): Promise<Resource[]>;

  // Tools
  callTool(name: string, arguments: any): Promise<ToolResult>;
  listTools(): Promise<Tool[]>;

  // Prompts
  getPrompt(name: string, arguments: any): Promise<Prompt>;
  listPrompts(): Promise<Prompt[]>;
}
```

---

### Server Lifecycle

```typescript
// Initialize
const server = new Intent2CommitMCPServer({
  workspaceRoot: process.cwd()
});

// Start
await server.start();

// Handle requests
server.on('resource/read', async (uri) => {
  // Return resource content
});

server.on('tool/call', async (name, args) => {
  // Execute tool
});

// Shutdown
await server.shutdown();
```

---

## Authentication & Security

- **Local Only:** Server runs in user's local environment
- **No Cloud:** All data stays on developer's machine
- **Git Credentials:** Uses existing Git configuration
- **Permissions:** Read/write access to Git repository only

---

## Error Handling

```json
{
  "error": {
    "code": "INTENT_NOT_FOUND",
    "message": "No current intent found",
    "details": {
      "suggestion": "Capture intent first: mcp.callTool('capture_intent', {...})"
    }
  }
}
```

**Error Codes:**
- `INTENT_NOT_FOUND` - No current intent
- `NO_STAGED_CHANGES` - No changes to analyze
- `GIT_NOT_INITIALIZED` - Not a Git repository
- `LOW_ALIGNMENT` - Alignment below threshold
- `INVALID_TEMPLATE` - Template not found

---

## Example Usage (AI Agent)

```typescript
// AI agent workflow
const mcp = new MCPClient('intent2commit');

// 1. Get current state
const intent = await mcp.readResource('intent://current');
const alignment = await mcp.readResource('intent://alignment/current');

// 2. Make decision
if (alignment.score < 70) {
  // Get AI recommendation
  const review = await mcp.getPrompt('review_alignment', {
    includeHistory: true
  });
  
  // AI analyzes and suggests
  const suggestion = await ai.generateResponse(review);
  
  // Suggest split
  if (suggestion.action === 'split') {
    const splits = await mcp.callTool('suggest_split', {
      reason: suggestion.reason
    });
    
    return splits;
  }
}

// 3. Proceed with commit
const result = await mcp.callTool('commit_with_intent', {});
```

---

## Integration Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "intent2commit": {
      "command": "npx",
      "args": ["-y", "intent2commit-mcp-server"],
      "env": {
        "WORKSPACE_ROOT": "/path/to/project"
      }
    }
  }
}
```

### Cline / VS Code

```json
{
  "mcp.servers": {
    "intent2commit": {
      "type": "node",
      "module": "intent2commit-mcp-server"
    }
  }
}
```

---

## Roadmap

**v1.0 (Current):**
- Basic resources (current intent, history)
- Core tools (capture, check, commit)
- Review prompts

**v1.1 (Next):**
- Intent branching support
- Visual diff generation
- Team analytics

**v2.0 (Future):**
- Multi-repository support
- Decision graph queries
- Advanced AI collaboration

---

**This MCP server positions Intent2Commit as AI-native infrastructure for the AI coding era.**
