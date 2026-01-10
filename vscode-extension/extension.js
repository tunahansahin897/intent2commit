const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

let statusBarItem;
let currentIntentPanel;

/**
 * Activate extension
 */
function activate(context) {
  console.log('Intent2Commit extension activated');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'intent2commit.preview';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('intent2commit.captureIntent', captureIntent),
    vscode.commands.registerCommand('intent2commit.preview', showPreview),
    vscode.commands.registerCommand('intent2commit.commit', commitWithIntent),
    vscode.commands.registerCommand('intent2commit.refresh', refreshIntentView)
  );

  // Register sidebar provider
  const sidebarProvider = new IntentSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('intent2commitSidebar', sidebarProvider)
  );

  // Auto-refresh on file save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const config = vscode.workspace.getConfiguration('intent2commit');
      if (config.get('autoRefresh')) {
        refreshIntentView();
      }
    })
  );

  // Initial load
  refreshIntentView();
}

/**
 * Capture intent command
 */
async function captureIntent() {
  const intent = await vscode.window.showInputBox({
    prompt: 'Enter your intent',
    placeHolder: 'e.g., optimize database queries in user profile endpoint'
  });

  if (intent) {
    runIntentCommand(`intent "${intent}"`, 'Intent captured');
  }
}

/**
 * Show preview command
 */
function showPreview() {
  runIntentCommand('intent preview --visual', 'Preview');
}

/**
 * Commit with intent command
 */
function commitWithIntent() {
  runIntentCommand('intent commit', 'Committing with intent');
}

/**
 * Refresh intent view
 */
function refreshIntentView() {
  getCurrentIntent((intent) => {
    updateStatusBar(intent);
    if (currentIntentPanel) {
      currentIntentPanel.updateIntent(intent);
    }
  });
}

/**
 * Get current intent
 */
function getCurrentIntent(callback) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    callback(null);
    return;
  }

  exec('intent --version', { cwd: workspaceRoot }, (error) => {
    if (error) {
      vscode.window.showErrorMessage('Intent2Commit CLI not found. Install: npm install -g intent2commit');
      callback(null);
      return;
    }

    // Read intent cache file
    const fs = require('fs');
    const intentFile = path.join(workspaceRoot, '.intent-cache', 'current-intent.json');
    
    if (fs.existsSync(intentFile)) {
      try {
        const intent = JSON.parse(fs.readFileSync(intentFile, 'utf8'));
        callback(intent);
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Update status bar
 */
function updateStatusBar(intent) {
  const config = vscode.workspace.getConfiguration('intent2commit');
  
  if (!config.get('showAlignmentInStatusBar')) {
    statusBarItem.hide();
    return;
  }

  if (intent) {
    const shortIntent = intent.message.length > 30 
      ? intent.message.substring(0, 27) + '...' 
      : intent.message;
    
    statusBarItem.text = `$(target) ${shortIntent}`;
    statusBarItem.tooltip = `Intent: ${intent.message}\nClick to preview`;
    statusBarItem.show();
  } else {
    statusBarItem.text = '$(target) No intent';
    statusBarItem.tooltip = 'Click to capture intent';
    statusBarItem.show();
  }
}

/**
 * Run intent CLI command
 */
function runIntentCommand(command, taskName) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const terminal = vscode.window.createTerminal('Intent2Commit');
  terminal.show();
  terminal.sendText(`cd "${workspaceRoot}"`);
  terminal.sendText(command);
  
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: taskName,
    cancellable: false
  }, async (progress) => {
    progress.report({ increment: 0 });
    
    // Simulate progress
    await new Promise(resolve => setTimeout(resolve, 1000));
    progress.report({ increment: 50 });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    progress.report({ increment: 100 });
    
    refreshIntentView();
  });
}

/**
 * Sidebar webview provider
 */
class IntentSidebarProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent(null);

    // Refresh on visibility
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        refreshIntentView();
      }
    });
  }

  updateIntent(intent) {
    if (this._view) {
      this._view.webview.html = this.getHtmlContent(intent);
    }
  }

  getHtmlContent(intent) {
    if (!intent) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { padding: 20px; font-family: var(--vscode-font-family); }
            .empty { text-align: center; color: var(--vscode-descriptionForeground); }
            button { 
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              padding: 8px 16px;
              cursor: pointer;
              width: 100%;
              margin-top: 16px;
            }
            button:hover { background: var(--vscode-button-hoverBackground); }
          </style>
        </head>
        <body>
          <div class="empty">
            <p>No current intent</p>
            <button onclick="captureIntent()">Capture Intent</button>
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            function captureIntent() {
              vscode.postMessage({ command: 'captureIntent' });
            }
          </script>
        </body>
        </html>
      `;
    }

    const timeAgo = getTimeAgo(intent.timestamp);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            padding: 16px; 
            font-family: var(--vscode-font-family); 
            color: var(--vscode-foreground);
          }
          .intent {
            background: var(--vscode-editor-background);
            border-left: 3px solid var(--vscode-activityBarBadge-background);
            padding: 12px;
            margin-bottom: 16px;
          }
          .message { font-size: 14px; margin-bottom: 8px; }
          .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
          .actions { display: flex; gap: 8px; margin-top: 12px; }
          button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            flex: 1;
          }
          button:hover { background: var(--vscode-button-hoverBackground); }
        </style>
      </head>
      <body>
        <div class="intent">
          <div class="message">"${intent.message}"</div>
          <div class="meta">Captured ${timeAgo}</div>
        </div>
        <div class="actions">
          <button onclick="preview()">Preview</button>
          <button onclick="commit()">Commit</button>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          function preview() { vscode.postMessage({ command: 'preview' }); }
          function commit() { vscode.postMessage({ command: 'commit' }); }
        </script>
      </body>
      </html>
    `;
  }
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
