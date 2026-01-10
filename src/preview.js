const chalk = require('chalk');
const { analyzeChanges } = require('./analyzer');
const { getCurrentIntent } = require('./capture');
const { checkAlignment, displayAlignment } = require('./alignment');

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
