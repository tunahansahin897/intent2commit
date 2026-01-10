#!/usr/bin/env node

/**
 * Intent2Commit MCP Server
 * 
 * Production-ready MCP server for AI coding tool integration.
 * Supports: Cursor, Windsurf, Antigravity, Claude Desktop, Cline
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class Intent2CommitMCPServer {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot || process.env.WORKSPACE_ROOT || process.cwd();
    
    this.server = new Server({
      name: 'intent2commit',
      version: '2.0.0'
    }, {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    });

    this.setupHandlers();
    this.logToStderr(`Intent2Commit MCP Server initialized (workspace: ${this.workspaceRoot})`);
  }

  logToStderr(message) {
    console.error(`[Intent2Commit MCP] ${message}`);
  }

  setupHandlers() {
    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'intent://current',
          name: 'Current Intent',
          description: 'The currently active developer intent',
          mimeType: 'application/json'
        },
        {
          uri: 'intent://history',
          name: 'Intent History',
          description: 'Historical record of all captured intents',
          mimeType: 'application/json'
        },
        {
          uri: 'intent://fulfillment/current',
          name: 'Current Fulfillment Analysis',
          description: 'Intent fulfillment analysis for staged changes',
          mimeType: 'application/json'
        }
      ]
    }));

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      this.logToStderr(`Reading resource: ${uri}`);

      try {
        if (uri === 'intent://current') {
          const intent = await this.getCurrentIntent();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(intent || { message: 'No intent captured' })
            }]
          };
        }

        if (uri === 'intent://history') {
          const history = await this.getHistory();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ intents: history })
            }]
          };
        }

        if (uri === 'intent://fulfillment/current') {
          const fulfillment = await this.getFulfillment();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(fulfillment || { message: 'No analysis available' })
            }]
          };
        }

        throw new Error(`Unknown resource: ${uri}`);
      } catch (error) {
        this.logToStderr(`Error reading resource ${uri}: ${error.message}`);
        throw error;
      }
    });

    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'capture_intent',
          description: 'Capture developer intent before writing code',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The intent message describing what you plan to do'
              },
              template: {
                type: 'string',
                description: 'Optional template name (performance, security, feature, bugfix, etc.)'
              }
            },
            required: ['message']
          }
        },
        {
          name: 'check_fulfillment',
          description: 'Check intent fulfillment for staged changes',
          inputSchema: {
            type: 'object',
            properties: {
              intentId: {
                type: 'string',
                description: 'Specific intent ID to check (optional, uses current if omitted)'
              }
            }
          }
        },
        {
          name: 'commit_with_intent',
          description: 'Commit staged changes with validated intent',
          inputSchema: {
            type: 'object',
            properties: {
              force: {
                type: 'boolean',
                description: 'Force commit even with low fulfillment score',
                default: false
              }
            }
          }
        },
        {
          name: 'detect_drift',
          description: 'Detect files changed outside declared intent scope',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      this.logToStderr(`Calling tool: ${name}`);

      try {
        if (name === 'capture_intent') {
          const result = await this.captureIntent(args.message, args.template);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        if (name === 'check_fulfillment') {
          const result = await this.checkFulfillment(args.intentId);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        if (name === 'commit_with_intent') {
          const result = await this.commitWithIntent(args.force);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        if (name === 'detect_drift') {
          const result = await this.detectDrift();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        this.logToStderr(`Error calling tool ${name}: ${error.message}`);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: error.message })
          }],
          isError: true
        };
      }
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'review_fulfillment',
          description: 'Review intent fulfillment and provide recommendations',
          arguments: [
            {
              name: 'includeHistory',
              description: 'Include recent intent history',
              required: false
            }
          ]
        }
      ]
    }));

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === 'review_fulfillment') {
        const intent = await this.getCurrentIntent();
        const fulfillment = await this.getFulfillment();

        return {
          description: 'Review intent fulfillment',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Review the following intent fulfillment analysis:\n\nIntent: "${intent?.message || 'None'}"\nFulfillment Score: ${fulfillment?.score || 'N/A'}/100\n\nProvide specific recommendations for improving the commit or adjusting the intent.`
              }
            }
          ]
        };
      }

      throw new Error(`Unknown prompt: ${request.params.name}`);
    });
  }

  // Helper methods
  async getCurrentIntent() {
    const intentFile = path.join(this.workspaceRoot, '.intent-cache', 'current-intent.json');
    if (fs.existsSync(intentFile)) {
      return JSON.parse(fs.readFileSync(intentFile, 'utf8'));
    }
    return null;
  }

  async getHistory() {
    const historyFile = path.join(this.workspaceRoot, '.intent-cache', 'history.json');
    if (fs.existsSync(historyFile)) {
      return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    return [];
  }

  async getFulfillment() {
    try {
      const { stdout } = await execAsync('intent preview --json', { cwd: this.workspaceRoot });
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  }

  async captureIntent(message, template) {
    const cmd = template 
      ? `intent --template ${template}` 
      : `intent "${message.replace(/"/g, '\\"')}"`;
    
    await execAsync(cmd, { cwd: this.workspaceRoot });
    return await this.getCurrentIntent();
  }

  async checkFulfillment(intentId) {
    try {
      const { stdout } = await execAsync('intent preview --json', { cwd: this.workspaceRoot });
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Fulfillment check failed: ${error.message}`);
    }
  }

  async commitWithIntent(force) {
    const cmd = force ? 'intent commit --force' : 'intent commit';
    const { stdout } = await execAsync(cmd, { cwd: this.workspaceRoot });
    return { success: true, output: stdout };
  }

  async detectDrift() {
    try {
      const { stdout } = await execAsync('intent preview --json', { cwd: this.workspaceRoot });
      const analysis = JSON.parse(stdout);
      return {
        driftDetected: analysis.driftDetected || false,
        driftFiles: analysis.driftFiles || [],
        warnings: analysis.warnings || []
      };
    } catch (error) {
      throw new Error(`Drift detection failed: ${error.message}`);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logToStderr('MCP server running on stdio');
  }
}

// Start server
const server = new Intent2CommitMCPServer(process.env.WORKSPACE_ROOT);
server.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

module.exports = { Intent2CommitMCPServer };
