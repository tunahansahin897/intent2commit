const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { getCurrentIntent } = require('./capture');

/**
 * Install Git hooks to enforce intent capture
 */
async function installHooks() {
  try {
    // Check if we're in a Git repository
    const gitDir = '.git';
    if (!fs.existsSync(gitDir)) {
      console.log(chalk.red('✗ Not in a Git repository'));
      console.log(chalk.gray('Run this command from the root of your Git repository'));
      process.exit(1);
    }

    const hooksDir = path.join(gitDir, 'hooks');
    
    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Pre-commit hook content
    const preCommitHook = `#!/bin/sh
#
# Intent2Commit pre-commit hook
# Enforces intent capture before commits
#

# Check if intent exists
if [ ! -f ".intent-cache/current-intent.json" ]; then
  echo ""
  echo "✗ No intent found"
  echo ""
  echo "You must capture your intent before committing."
  echo ""
  echo "Run: intent \\"your intent message\\""
  echo "Or:  intent --template <type>"
  echo ""
  exit 1
fi

# Intent exists, allow commit
exit 0
`;

    const preCommitPath = path.join(hooksDir, 'pre-commit');
    
    // Check if hook already exists
    if (fs.existsSync(preCommitPath)) {
      console.log(chalk.yellow('⚠ pre-commit hook already exists'));
      console.log();
      
      // Ask for confirmation (in real implementation, use inquirer)
      console.log(chalk.gray('Backing up existing hook to pre-commit.backup'));
      fs.copyFileSync(preCommitPath, path.join(hooksDir, 'pre-commit.backup'));
    }

    // Write the hook
    fs.writeFileSync(preCommitPath, preCommitHook);
    
    // Make it executable (Unix/Linux/Mac)
    if (process.platform !== 'win32') {
      fs.chmodSync(preCommitPath, '755');
    }

    console.log(chalk.green('✓ Git hooks installed successfully'));
    console.log();
    console.log(chalk.cyan('What this does:'));
    console.log(chalk.gray('  • Blocks commits without captured intent'));
    console.log(chalk.gray('  • Enforces intent-first workflow'));
    console.log(chalk.gray('  • Reminds developers to think before coding'));
    console.log();
    console.log(chalk.yellow('⚡ Intent capture is now MANDATORY for this repository'));
    console.log();
    console.log(chalk.gray('To uninstall:'));
    console.log(chalk.cyan('  intent uninstall-hooks'));
    console.log();

  } catch (error) {
    console.error(chalk.red('✗ Failed to install hooks:'), error.message);
    process.exit(1);
  }
}

/**
 * Uninstall Git hooks
 */
async function uninstallHooks() {
  try {
    const hookPath = path.join('.git', 'hooks', 'pre-commit');
    
    if (!fs.existsSync(hookPath)) {
      console.log(chalk.yellow('⚠ No Intent2Commit hooks found'));
      return;
    }

    // Check if it's our hook
    const content = fs.readFileSync(hookPath, 'utf8');
    if (!content.includes('Intent2Commit')) {
      console.log(chalk.yellow('⚠ Existing pre-commit hook is not from Intent2Commit'));
      console.log(chalk.gray('Skipping removal for safety'));
      return;
    }

    // Check for backup
    const backupPath = path.join('.git', 'hooks', 'pre-commit.backup');
    if (fs.existsSync(backupPath)) {
      console.log(chalk.cyan('→ Restoring backup'));
      fs.copyFileSync(backupPath, hookPath);
      fs.unlinkSync(backupPath);
    } else {
      fs.unlinkSync(hookPath);
    }

    console.log(chalk.green('✓ Intent2Commit hooks uninstalled'));
    console.log();
    console.log(chalk.yellow('⚠ Intent capture is now optional'));
    console.log();

  } catch (error) {
    console.error(chalk.red('✗ Failed to uninstall hooks:'), error.message);
    process.exit(1);
  }
}

/**
 * Auto-suggest intent based on staged changes
 * IMPORTANT: Only suggests, never auto-commits
 */
async function suggestIntent() {
  try {
    const { analyzeChanges } = require('./analyzer');
    
    console.log(chalk.cyan('→ Analyzing staged changes...'));
    console.log();
    
    const analysis = await analyzeChanges();
    
    if (analysis.diffStats.length === 0) {
      console.log(chalk.yellow('⚠ No staged changes found'));
      console.log(chalk.gray('Use "git add" to stage your changes'));
      return;
    }

    // Simple heuristic-based suggestions
    const suggestions = [];
    const diff = analysis.diff.toLowerCase();
    const files = analysis.diffStats.map(f => f.file);

    // Detect patterns
    if (diff.includes('cache') || diff.includes('redis') || diff.includes('memcache')) {
      suggestions.push('add caching to improve performance');
    }
    
    if (diff.includes('test') || files.some(f => f.includes('test') || f.includes('spec'))) {
      suggestions.push('add tests for better coverage');
    }
    
    if (diff.includes('console.log') || diff.includes('logger')) {
      suggestions.push('add logging for debugging');
    }
    
    if (diff.includes('auth') || diff.includes('login') || diff.includes('password')) {
      suggestions.push('update authentication logic');
    }
    
    if (diff.includes('fix') || diff.includes('bug') || diff.includes('error')) {
      suggestions.push('fix bug in ' + files[0].split('/').pop());
    }
    
    if (analysis.insertions > analysis.deletions * 2) {
      suggestions.push('add new feature to ' + files[0].split('/')[0]);
    }
    
    if (analysis.deletions > analysis.insertions * 2) {
      suggestions.push('remove unused code from ' + files[0].split('/')[0]);
    }

    // Fallback
    if (suggestions.length === 0) {
      suggestions.push('update ' + files[0].split('/').pop());
      suggestions.push('refactor ' + files[0].split('/')[0] + ' module');
    }

    // Display suggestions
    console.log(chalk.bold('Suggested intents based on your changes:\n'));
    
    suggestions.slice(0, 3).forEach((suggestion, index) => {
      console.log(chalk.cyan(`  ${index + 1}. "${suggestion}"`));
    });
    
    console.log();
    console.log(chalk.gray('These are suggestions only. Use one or write your own:'));
    console.log(chalk.white('  intent "your intent message"'));
    console.log();
    console.log(chalk.yellow('⚠ Important: Suggestions are heuristic, not AI inference'));
    console.log();

  } catch (error) {
    if (error.message.includes('Not a git repository')) {
      console.log(chalk.red('\n✗ Not in a Git repository'));
    } else {
      console.error(chalk.red('\n✗ Error:'), error.message);
    }
    process.exit(1);
  }
}

module.exports = {
  installHooks,
  uninstallHooks,
  suggestIntent
};
