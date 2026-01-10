const chalk = require('chalk');
const { checkAlignment } = require('./alignment');

/**
 * Visual diff display for intent preview
 * Shows side-by-side: Intent vs Code Changes with alignment highlighting
 */

/**
 * Render visual diff with alignment indicators
 * @param {Object} intent - The captured intent
 * @param {Object} analysis - Code change analysis
 * @param {Object} alignmentResult - Alignment check result
 */
function renderVisualDiff(intent, analysis, alignmentResult) {
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('           INTENT → CODE ALIGNMENT PREVIEW'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log();

  // Left side: Intent
  console.log(chalk.bold('┌─ INTENT ────────────────────────────────────┐'));
  console.log(chalk.cyan(`│ "${intent.message}"`));
  console.log(chalk.gray(`│ Captured: ${new Date(intent.timestamp).toLocaleString()}`));
  console.log(chalk.bold('└─────────────────────────────────────────────┘'));
  console.log();

  // Alignment indicator
  const score = alignmentResult.score;
  const barLength = 40;
  const filledLength = Math.floor((score / 100) * barLength);
  const emptyLength = barLength - filledLength;
  
  const scoreColor = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';
  const bar = chalk[scoreColor]('█'.repeat(filledLength)) + chalk.gray('░'.repeat(emptyLength));
  
  console.log(chalk.bold(' ALIGNMENT SCORE'));
  console.log(` ${bar} ${chalk[scoreColor](score + '/100')}`);
  console.log();

  // Right side: Code Changes
  console.log(chalk.bold('┌─ CODE CHANGES ──────────────────────────────┐'));
  
  analysis.diffStats.forEach(file => {
    const isAligned = !alignmentResult.warnings.some(w => w.file === file.file);
    const icon = isAligned ? chalk.green('✓') : chalk.yellow('⚠');
    const fileName = file.file.length > 35 ? '...' + file.file.slice(-32) : file.file;
    
    console.log(`│ ${icon} ${fileName}`);
    console.log(chalk.gray(`│   +${file.insertions} -${file.deletions}`));
  });
  
  console.log(chalk.bold('└─────────────────────────────────────────────┘'));
  console.log();

  // Warnings section
  if (alignmentResult.warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠ MISALIGNMENT WARNINGS:'));
    console.log();
    
    alignmentResult.warnings.forEach((warning, index) => {
      const severity = warning.severity === 'high' ? chalk.red('HIGH') : 
                      warning.severity === 'medium' ? chalk.yellow('MEDIUM') : 
                      chalk.gray('LOW');
      
      console.log(`  ${index + 1}. [${severity}] ${warning.message}`);
      if (warning.file !== 'multiple') {
        console.log(chalk.gray(`     File: ${warning.file}`));
      }
    });
    console.log();
  }

  // Breakdown if available
  if (alignmentResult.breakdown) {
    console.log(chalk.cyan.bold('📊 ALIGNMENT BREAKDOWN:'));
    console.log();
    
    const b = alignmentResult.breakdown;
    renderBreakdownBar('Intent Clarity', b.intentClarity);
    renderBreakdownBar('File Scope', b.fileScope);
    renderBreakdownBar('Code Volume', b.codeVolume);
    
    if (b.riskPatterns < 0) {
      console.log(chalk.yellow(`  Risk Penalties: ${b.riskPatterns} points`));
    }
    console.log();
  }

  // Top issue
  if (alignmentResult.topIssue) {
    console.log(chalk.yellow.bold(`🎯 PRIMARY CONCERN: ${alignmentResult.topIssue}`));
    console.log();
  }

  // Summary
  const totalFiles = analysis.diffStats.length;
  const totalLines = analysis.insertions + analysis.deletions;
  
  console.log(chalk.bold('SUMMARY:'));
  console.log(`  Files Changed: ${totalFiles}`);
  console.log(`  Lines Changed: ${totalLines} (+${analysis.insertions}/-${analysis.deletions})`);
  console.log(`  Alignment: ${alignmentResult.alignment.toUpperCase()}`);
  console.log();
  
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
}

/**
 * Render individual breakdown bar
 */
function renderBreakdownBar(label, value) {
  const barLength = 20;
  const filledLength = Math.floor((value / 100) * barLength);
  const emptyLength = barLength - filledLength;
  
  const color = value >= 90 ? 'green' : value >= 70 ? 'yellow' : 'red';
  const bar = chalk[color]('█'.repeat(filledLength)) + chalk.gray('░'.repeat(emptyLength));
  
  const paddedLabel = label.padEnd(15);
  console.log(`  ${paddedLabel} ${bar} ${chalk[color](value + '%')}`);
}

/**
 * Render compact view (original preview style)
 */
function renderCompactView(intent, analysis, alignmentResult) {
  // This is the existing preview functionality
  // Keep for backwards compatibility
  console.log();
  console.log(chalk.bold('┌─────────────────────────────────────────┐'));
  console.log(chalk.bold('│ INTENT PREVIEW                          │'));
  console.log(chalk.bold('└─────────────────────────────────────────┘'));
  console.log();

  console.log(chalk.cyan('Intent:'));
  console.log(`  "${intent.message}"`);
  console.log();

  // Show alignment results
  const scoreColor = alignmentResult.score >= 90 ? 'green' : 
                     alignmentResult.score >= 70 ? 'yellow' : 'red';
  
  console.log(`  Alignment: ${chalk[scoreColor](alignmentResult.score + '/100')} (${alignmentResult.alignment})`);
  console.log();

  // Show staged changes
  console.log(chalk.cyan('Staged Changes:'));
  analysis.diffStats.forEach(file => {
    console.log(`  • ${file.file} (+${file.insertions}/-${file.deletions})`);
  });
  console.log();

  // Show warnings
  if (alignmentResult.warnings.length > 0) {
    console.log(chalk.yellow('⚠ Warnings:'));
    alignmentResult.warnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning.message}`));
    });
    console.log();
  }
}

module.exports = {
  renderVisualDiff,
  renderCompactView
};
