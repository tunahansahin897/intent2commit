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

/**
 * Intent2Commit MCP Server Implementation
 */
class Intent2CommitMCPServer {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.server = new Server({
      name: 'intent2commit',
      version: '1.0.0'
    }, {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    });

    this.setupHandlers();
  }

  setupHandlers() {
    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'intent://current',
          name: 'Current Intent',
          description: 'The currently active intent',
          mimeType: 'application/json'
        },
        {
          uri: 'intent://history',
          name: 'Intent History',
          description: 'Historical intents',
          mimeType: 'application/json'
        },
        {
          uri: 'intent://alignment/current',
          name: 'Current Alignment',
          description: 'Alignment analysis for staged changes',
          mimeType: 'application/json'
        }
      ]
    }));

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'intent://current') {
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(await this.getCurrentIntent()) }] };
      }

      if (uri === 'intent://history') {
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(await this.getHistory()) }] };
      }

      if (uri === 'intent://alignment/current') {
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(await this.getAlignment()) }] };
      }

      throw new Error(`Resource not found: ${uri}`);
    });

    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'capture_intent',
          description: 'Capture developer intent before code changes',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Intent message' },
              template: { type: 'string', description: 'Template name' }
            },
            required: ['message']
          }
        },
        {
          name: 'check_alignment',
          description: 'Check alignment between intent and changes',
          inputSchema: {
            type: 'object',
            properties: {
              intentId: { type: 'string', description: 'Intent ID (optional)' }
            }
          }
        },
        {
          name: 'commit_with_intent',
          description: 'Commit with intent-aware message',
          inputSchema: {
            type: 'object',
            properties: {
              force: { type: 'boolean', description: 'Force commit', default: false }
            }
          }
        }
      ]
    }));

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'capture_intent') {
        return { content: [{ type: 'text', text: JSON.stringify(await this.captureIntent(args.message, args.template)) }] };
      }

      if (name === 'check_alignment') {
        return { content: [{ type: 'text', text: JSON.stringify(await this.checkAlignment(args.intentId)) }] };
      }

      if (name === 'commit_with_intent') {
        return { content: [{ type: 'text', text: JSON.stringify(await this.commitWithIntent(args.force)) }] };
      }

      throw new Error(`Tool not found: ${name}`);
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'review_alignment',
          description: 'Review alignment and provide recommendations',
          arguments: [
            { name: 'includeHistory', description: 'Include history', required: false }
          ]
        }
      ]
    }));

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === 'review_alignment') {
        const intent = await this.getCurrentIntent();
        const alignment = await this.getAlignment();

        return {
          description: 'Review alignment',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `You are reviewing alignment between intent and code changes.\n\nIntent: "${intent?.message || 'None'}"\nScore: ${alignment?.score || 'N/A'}/100\n\nProvide recommendations.`
              }
            }
          ]
        };
      }

      throw new Error(`Prompt not found: ${request.params.name}`);
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

  async getAlignment() {
    try {
      const { stdout } = await execAsync('intent preview --json', { cwd: this.workspaceRoot });
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  }

  async captureIntent(message, template) {
    const cmd = template ? `intent --template ${template}` : `intent "${message}"`;
    await execAsync(cmd, { cwd: this.workspaceRoot });
    return this.getCurrentIntent();
  }

  async checkAlignment(intentId) {
    try {
      const { stdout } = await execAsync('intent preview --json', { cwd: this.workspaceRoot });
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Alignment check failed: ${error.message}`);
    }
  }

  async commitWithIntent(force) {
    const cmd = force ? 'intent commit --force' : 'intent commit';
    const { stdout } = await execAsync(cmd, { cwd: this.workspaceRoot });
    return { success: true, output: stdout };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Intent2Commit MCP server running on stdio');
  }
}

// Start server
const server = new Intent2CommitMCPServer(process.env.WORKSPACE_ROOT);
server.start().catch(console.error);

module.exports = { Intent2CommitMCPServer };
