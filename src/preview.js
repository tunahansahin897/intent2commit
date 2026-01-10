const chalk = require('chalk');
const { analyzeChanges } = require('./analyzer');
const { getCurrentIntent } = require('./capture');
const { calculateFulfillment, displayFulfillment } = require('./fulfillment');

/**
 * Preview intent and changes before committing
 * Shows what will be committed and fulfillment estimate
 * @param {Object} options - Preview options
 */
async function previewIntent(options = {}) {
  try {
    // Step 1: Get current intent
    const intent = getCurrentIntent();
    if (!intent) {
      console.log(chalk.red('✗ No intent found'));
      console.log(chalk.yellow('\nCapture your intent first:'));
      console.log(chalk.cyan('  intent "your intent message"'));
      process.exit(1);
    }

    // Step 2: Analyze staged changes
    const analysis = await analyzeChanges();
    
    if (!analysis.filesChanged || analysis.filesChanged === 0) {
      console.log(chalk.yellow('\n⚠ No staged changes found'));
      console.log(chalk.gray('Use "git add" to stage your changes'));
      process.exit(0);
    }

    // Step 3: Get file list
    const changedFiles = analysis.files || [];
    const diffStats = {
      insertions: analysis.insertions || 0,
      deletions: analysis.deletions || 0
    };

    // Step 4: Calculate fulfillment (with drift detection)
    const fulfillment = calculateFulfillment(intent, changedFiles, diffStats);
    
    // Step 5: Display fulfillment report
    if (options.json) {
      // JSON output for MCP/programmatic use
      console.log(JSON.stringify({
        intent: intent.message,
        template: intent.template,
        score: fulfillment.score,
        level: fulfillment.level,
        driftDetected: fulfillment.driftDetected,
        driftFiles: fulfillment.driftFiles,
        warnings: fulfillment.warnings,
        filesChanged: analysis.filesChanged,
        insertions: diffStats.insertions,
        deletions: diffStats.deletions
      }, null, 2));
    } else {
      // Human-readable display
      displayFulfillment(intent, fulfillment);
    }

    // Step 6: Show next steps
    if (!options.json) {
      console.log(chalk.cyan('→ To commit with this intent:'));
      console.log(chalk.white('  intent commit'));
      console.log();
    }

  } catch (error) {
    const { handleGitError } = require('./error-handler');
    
    if (error.message.includes('Not a git repository') || error.message.includes('No staged changes')) {
      console.error(handleGitError(error));
    } else {
      console.error(chalk.red('\n✗ Error:'), error.message);
      if (options.debug) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

module.exports = {
  previewIntent
};


/**
 * Preview intent and changes before committing
 * Shows what will be committed and alignment estimate
 * @param {Object} options - Preview options
 */
async function previewIntent(options = {}) {
  try {
    // Step 1: Get current intent
    const intent = getCurrentIntent();
    if (!intent) {
      console.log(chalk.red('✗ No intent found'));
      console.log(chalk.yellow('\nCapture your intent first:'));
      console.log(chalk.cyan('  intent "your intent message"'));
      process.exit(1);
    }

    // Step 2: Analyze staged changes
    const analysis = await analyzeChanges();
    
    if (analysis.diffStats.length === 0) {
      console.log(chalk.yellow('\n⚠ No staged changes found'));
      console.log(chalk.gray('Use "git add" to stage your changes'));
      process.exit(0);
    }

    // Step 3: Check alignment
    const alignment = checkAlignment(intent, analysis);
    
    // Step 4: Display based on mode
    if (options.visual) {
      // Use visual diff display
      const { renderVisualDiff } = require('./visual-diff');
      renderVisualDiff(intent, analysis, alignment);
    } else {
      // Use compact display (original)
      const { renderCompactView } = require('./visual-diff');
      renderCompactView(intent, analysis, alignment);
    }

    console.log(chalk.cyan('→ To commit with this intent:'));
    console.log(chalk.white('  intent commit'));
    console.log();

  } catch (error) {
    const { handleGitError } = require('./error-handler');
    
    if (error.message.includes('Not a git repository') || error.message.includes('No staged changes')) {
      console.error(handleGitError(error));
    } else {
      console.error(chalk.red('\n✗ Error:'), error.message);
    }
    process.exit(1);
  }
}

module.exports = {
  previewIntent
};
