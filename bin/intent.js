#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { 
  captureIntent, 
  commitWithIntent, 
  showIntentLog, 
  showIntentStats, 
  explainCommit, 
  previewIntent,
  installHooks,
  uninstallHooks,
  suggestIntent
} = require('../src/index');

program
  .name('intent')
  .description('Intent-driven Git workflow tool')
  .version('1.0.0');

// Capture intent command
program
  .argument('[intent-message]', 'The intent behind your upcoming changes')
  .option('-t, --template <name>', 'Use an intent template (list templates with --template list)')
  .action(async (intentMessage, options) => {
    // Template mode
    if (options.template) {
      await captureIntent(null, { template: options.template });
      return;
    }
    
    if (!intentMessage) {
      console.log(chalk.yellow('Usage: intent "your intent message"'));
      console.log(chalk.gray('\nExample: intent "reduce login latency by removing redundant queries"'));
      console.log(chalk.gray('\nOr use a template:'));
      console.log(chalk.cyan('  intent --template performance'));
      console.log(chalk.cyan('  intent --template list'));
      process.exit(1);
    }
    
    await captureIntent(intentMessage);
  });

// Commit with intent
program
  .command('commit')
  .description('Commit changes with intent alignment check')
  .action(async () => {
    await commitWithIntent();
  });

// Preview intent and changes
program
  .command('preview')
  .description('Preview intent and staged changes before committing')
  .action(async () => {
    await previewIntent();
  });

// Show intent log
program
  .command('log')
  .description('Show intent history')
  .option('-f, --file <path>', 'Show intent history for specific file')
  .action(async (options) => {
    await showIntentLog(options.file);
  });

// Show intent statistics
program
  .command('stats')
  .description('Show intent statistics and patterns')
  .option('--team', 'Show team performance analytics')
  .action(async (options) => {
    await showIntentStats(options);
  });

// Explain a commit
program
  .command('explain <commit-hash>')
  .description('Explain the intent behind a specific commit')
  .action(async (commitHash) => {
    await explainCommit(commitHash);
  });

// Install Git hooks
program
  .command('install-hooks')
  .description('Install Git hooks to enforce intent capture')
  .action(async () => {
    await installHooks();
  });

// Uninstall Git hooks
program

const { program } = require('commander');
const chalk = require('chalk');
const { 
  captureIntent, 
  commitWithIntent, 
  showIntentLog, 
  showIntentStats, 
  explainCommit, 
  previewIntent,
  installHooks,
  uninstallHooks,
  suggestIntent
} = require('../src/index');

program
  .name('intent')
  .description('Intent-driven Git workflow tool')
  .version('1.0.0');

// Capture intent command
program
  .argument('[intent-message]', 'The intent behind your upcoming changes')
  .option('-t, --template <name>', 'Use an intent template (list templates with --template list)')
  .action(async (intentMessage, options) => {
    // Template mode
    if (options.template) {
      await captureIntent(null, { template: options.template });
      return;
    }
    
    if (!intentMessage) {
      console.log(chalk.yellow('Usage: intent "your intent message"'));
      console.log(chalk.gray('\nExample: intent "reduce login latency by removing redundant queries"'));
      console.log(chalk.gray('\nOr use a template:'));
      console.log(chalk.cyan('  intent --template performance'));
      console.log(chalk.cyan('  intent --template list'));
      process.exit(1);
    }
    
    await captureIntent(intentMessage);
  });

// Commit with intent
program
  .command('commit')
  .description('Commit changes with intent alignment check')
  .action(async () => {
    await commitWithIntent();
  });

// Preview intent and changes
program
  .command('preview')
  .description('Preview intent and staged changes before committing')
  .action(async () => {
    await previewIntent();
  });

// Show intent log
program
  .command('log')
  .description('Show intent history')
  .option('-f, --file <path>', 'Show intent history for specific file')
  .action(async (options) => {
    await showIntentLog(options.file);
  });

// Show intent statistics
program
  .command('stats')
  .description('Show intent statistics and patterns')
  .option('--team', 'Show team performance analytics')
  .action(async (options) => {
    await showIntentStats(options);
  });

// Explain a commit
program
  .command('explain <commit-hash>')
  .description('Explain the intent behind a specific commit')
  .action(async (commitHash) => {
    await explainCommit(commitHash);
  });

// Install Git hooks
program
  .command('install-hooks')
  .description('Install Git hooks to enforce intent capture')
  .action(async () => {
    await installHooks();
  });

// Uninstall Git hooks
program
  .command('uninstall-hooks')
  .description('Uninstall Intent2Commit Git hooks')
  .action(async () => {
    await uninstallHooks();
  });

// Suggest intent
program
  .command('suggest')
  .description('Suggest intent based on staged changes (optional helper)')
  .action(async () => {
    await suggestIntent();
  });

// Level 1 Features: Intent branching
program
  .command('branch <intent-message>')
  .description('Create a new Git branch with intent metadata')
  .action(async (intentMessage) => {
    const { createIntentBranch } = require('../src/branching');
    const { captureIntent } = require('../src/capture');
    
    // First capture intent
    const intent = await captureIntent(intentMessage);
    
    // Then create branch
    await createIntentBranch(intentMessage, intent.id);
  });

// Level 1 Features: Edit intent
program
  .command('edit <new-message>')
  .description('Edit current intent')
  .option('-r, --reason <reason>', 'Reason for editing')
  .action(async (newMessage, options) => {
    const { editIntent } = require('../src/capture');
    await editIntent(newMessage, options.reason);
  });

// Level 1 Features: Undo intent
program  
  .command('undo')
  .description('Undo current intent (restore previous)')
  .action(async () => {
    const { undoIntent } = require('../src/capture');
    await undoIntent();
  });

// Level 1 Features: View history
program
  .command('history')
  .description('View intent edit history')
  .action(async () => {
    const { displayIntentHistory } = require('../src/capture');
    displayIntentHistory();
  });

// Level 1 Features: List intent branches
program
  .command('branches')
  .description('List all intent-based branches')
  .action(async () => {
    const { listIntentBranches } = require('../src/branching');
    await listIntentBranches();
  });

program.parse();
