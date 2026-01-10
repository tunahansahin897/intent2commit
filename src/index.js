const inquirer = require('inquirer');
const chalk = require('chalk');
const { captureIntent: captureIntentCore, captureIntentFromTemplate, getCurrentIntent, clearIntent } = require('./capture');
const { analyzeChanges, createCommit } = require('./analyzer');
const { checkAlignment, displayAlignment } = require('./alignment');
const { generateCommitMessage, displayCommitMessage } = require('./commit-generator');
const { saveToLedger, getFromLedger, getAllIntents, getIntentStats } = require('./ledger');
const { listTemplates, getTemplate } = require('./templates');
const { previewIntent: previewIntentCore } = require('./preview');
const { installHooks, uninstallHooks, suggestIntent } = require('./hooks');

/**
 * Captures intent - CLI handler
 */
async function captureIntent(intentMessage, options = {}) {
  // Handle template mode
  if (options.template) {
    if (options.template === true || options.template === 'list') {
      listTemplates();
      return;
    }
    
    const template = getTemplate(options.template);
    if (!template) {
      console.log(chalk.red(`✗ Template "${options.template}" not found`));
      console.log();
      listTemplates();
      process.exit(1);
    }
    
    await captureIntentFromTemplate(template, options.template);
    return;
  }
  
  await captureIntentCore(intentMessage, options);
}

/**
 * Commits changes with intent alignment check - CLI handler
 */
async function commitWithIntent() {
  try {
    // Step 1: Get current intent
    const intent = getCurrentIntent();
    if (!intent) {
      console.log(chalk.red('✗ No intent found'));
      console.log(chalk.yellow('\nCapture your intent first:'));
      console.log(chalk.cyan('  intent "your intent message"'));
      process.exit(1);
    }

    console.log(chalk.bold('Intent2Commit Workflow\n'));
    console.log(chalk.gray(`Intent: "${intent.message}"`));
    console.log(chalk.gray(`Captured: ${new Date(intent.timestamp).toLocaleString()}`));
    console.log();

    // Step 2: Analyze staged changes
    console.log(chalk.cyan('→ Analyzing staged changes...'));
    const analysis = await analyzeChanges();
    
    console.log(chalk.green(`✓ Found ${analysis.filesChanged} file(s) with changes`));
    console.log(chalk.gray(`  +${analysis.insertions}/-${analysis.deletions} lines`));

    // Step 3: Check fulfillment (with drift detection)
    console.log(chalk.cyan('\n→ Checking intent fulfillment...'));
    
    const { calculateFulfillment, displayFulfillment } = require('./fulfillment');
    const changedFiles = analysis.files || [];
    const diffStats = {
      insertions: analysis.insertions || 0,
      deletions: analysis.deletions || 0
    };
    
    const fulfillment = calculateFulfillment(intent, changedFiles, diffStats);
    displayFulfillment(intent, fulfillment);

    // Step 4: Check if we should block
    if (fulfillment.score < 50) {
      console.log(chalk.red('\n❌ Fulfillment score too low'));
      console.log(chalk.yellow('Consider:'));
      console.log(chalk.yellow('  - Reviewing your changes'));
      console.log(chalk.yellow('  - Updating your intent'));
      console.log(chalk.yellow('  - Splitting into multiple commits'));
      
      const { shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldContinue',
          message: 'Continue anyway?',
          default: false
        }
      ]);
      
      if (!shouldContinue) {
        process.exit(0);
      }
    }

    // Step 5: Generate commit message
    const commitMessage = generateCommitMessage(intent, analysis, { score: fulfillment.score, level: fulfillment.level });
    displayCommitMessage(commitMessage);

    // Step 6: Confirm with user
    const { shouldCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCommit',
        message: 'Proceed with this commit?',
        default: true
      }
    ]);

    if (!shouldCommit) {
      console.log(chalk.yellow('\n✗ Commit cancelled'));
      process.exit(0);
    }

    // Step 7: Create commit
    console.log(chalk.cyan('\n→ Creating commit...'));
    const result = await createCommit(commitMessage);
    
    const commitHash = result.commit;
    console.log(chalk.green(`✓ Committed: ${commitHash}`));

    // Step 8: Save to ledger
    console.log(chalk.cyan('→ Saving to intent ledger...'));
    saveToLedger(intent, commitHash, analysis, { score: fulfillment.score, level: fulfillment.level, driftDetected: fulfillment.driftDetected });

    // Step 9: Clear intent cache
    clearIntent();

    console.log();
    console.log(chalk.green.bold('✓ Intent2Commit workflow complete!'));
    console.log();
    console.log(chalk.gray('View this commit later:'));
    console.log(chalk.cyan(`  intent explain ${commitHash.substring(0, 7)}`));
    console.log();

  } catch (error) {
    console.error(chalk.red('\n✗ Error:'), error.message);
    process.exit(1);
  }
}


/**
 * Shows intent log - CLI handler
 */
async function showIntentLog(filePath = null) {
  try {
    const intents = getAllIntents(filePath);

    if (intents.length === 0) {
      console.log(chalk.yellow('No intents found in ledger'));
      if (filePath) {
        console.log(chalk.gray(`  for file: ${filePath}`));
      }
      return;
    }

    console.log(chalk.bold('\nIntent History'));
    if (filePath) {
      console.log(chalk.gray(`Filtered by: ${filePath}`));
    }
    console.log(chalk.gray('─'.repeat(80)));
    console.log();

    intents.forEach(entry => {
      const scoreColor = entry.alignment.score >= 90 ? 'green' : 
                         entry.alignment.score >= 70 ? 'yellow' : 'red';
      
      console.log(chalk.cyan(`${entry.commitHash}`) + chalk.gray(` • ${new Date(entry.timestamp).toLocaleDateString()}`));
      console.log(`  Intent: ${entry.intent}`);
      console.log(`  Files:  ${entry.files.length} changed (+${entry.stats.insertions}/-${entry.stats.deletions})`);
      console.log(`  Align:  ${chalk[scoreColor](entry.alignment.score + '/100')} (${entry.alignment.level})`);
      console.log();
    });

  } catch (error) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Shows intent statistics - CLI handler
 */
async function showIntentStats(options = {}) {
  try {
    const stats = getIntentStats();

    if (stats.total === 0) {
      console.log(chalk.yellow('No intents found in ledger'));
      console.log(chalk.gray('\nStart using Intent2Commit:'));
      console.log(chalk.cyan('  intent "your first intent"'));
      return;
    }

    console.log(chalk.bold('\nIntent Statistics'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    console.log(chalk.cyan('Overview:'));
    console.log(`  Total Intents: ${stats.total}`);
    console.log(`  Avg Alignment: ${stats.avgAlignment}/100`);
    
    // Team mode
    if (options.team && stats.byAuthor) {
      console.log();
      console.log(chalk.cyan('Team Performance:'));
      Object.entries(stats.byAuthor)
        .sort((a, b) => b[1].avgScore - a[1].avgScore)
        .forEach(([author, data]) => {
          console.log(`  ${author.padEnd(20)} ${data.count} commits, avg ${data.avgScore}/100`);
        });
    }
    
    console.log();

    console.log(chalk.cyan('By Type:'));
    Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = Math.round((count / stats.total) * 100);
        console.log(`  ${type.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`);
      });
    console.log();

    if (stats.topFiles.length > 0) {
      console.log(chalk.cyan('Most Changed Files:'));
      stats.topFiles.forEach(({ file, count }) => {
        console.log(`  ${file.padEnd(40)} ${count} change(s)`);
      });
      console.log();
    }
    
    // Alignment trend
    if (stats.alignmentTrend) {
      console.log(chalk.cyan('Alignment Trend:'));
      console.log(`  Last 10 commits: ${stats.alignmentTrend.recent}/100`);
      console.log(`  Overall: ${stats.avgAlignment}/100`);
      const trend = stats.alignmentTrend.recent > stats.avgAlignment ? '↗' : '↘';
      console.log(`  Trend: ${trend}`);
      console.log();
    }

  } catch (error) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Explains a specific commit - CLI handler
 */
async function explainCommit(commitHash) {
  try {
    const entry = getFromLedger(commitHash);

    if (!entry) {
      console.log(chalk.red(`✗ No intent found for commit: ${commitHash}`));
      console.log(chalk.gray('\nThis commit may have been created without Intent2Commit'));
      return;
    }

    console.log(chalk.bold('\nCommit Intent Explanation'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    console.log(chalk.cyan('Commit:'));
    console.log(`  Hash: ${entry.commitHash} (${entry.fullHash})`);
    console.log(`  Date: ${new Date(entry.timestamp).toLocaleString()}`);
    console.log();

    console.log(chalk.cyan('Intent:'));
    console.log(`  "${entry.intent}"`);
    console.log();

    console.log(chalk.cyan('Changes:'));
    entry.files.forEach(file => {
      console.log(`  • ${file}`);
    });
    console.log(`  Summary: ${entry.stats.filesChanged} files, +${entry.stats.insertions}/-${entry.stats.deletions} lines`);
    console.log();

    const scoreColor = entry.alignment.score >= 90 ? 'green' : 
                       entry.alignment.score >= 70 ? 'yellow' : 'red';

    console.log(chalk.cyan('Alignment:'));
    console.log(`  Score: ${chalk[scoreColor](entry.alignment.score + '/100')} (${entry.alignment.level})`);
    if (entry.alignment.warningCount > 0) {
      console.log(`  Warnings: ${entry.alignment.warningCount}`);
    }
    console.log();

    console.log(chalk.gray('💡 This is what the developer was thinking when writing this code.'));
    console.log();

  } catch (error) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Preview intent and staged changes
 */
async function previewIntent() {
  await previewIntentCore();
}

module.exports = {
  captureIntent,
  commitWithIntent,
  showIntentLog,
  showIntentStats,
  explainCommit,
  previewIntent,
  installHooks,
  uninstallHooks,
  suggestIntent
};
