const chalk = require('chalk');

/**
 * The Intent-Change Alignment Engine - Core innovation of Intent2Commit
 * Validates whether code changes match stated intent
 */

/**
 * Analyzes alignment between intent and actual code changes
 * @param {Object} intent - The stated intent object
 * @param {Object} analysis - Code change analysis
 * @returns {Object} Alignment result with score and warnings
 */
function checkAlignment(intent, analysis) {
  const result = {
    score: 100,
    warnings: [],
    suggestions: [],
    alignment: 'excellent',
    breakdown: {
      intentClarity: 100,
      fileScope: 100,
      riskPatterns: 0,
      codeVolume: 100
    },
    topIssue: null
  };

  const intentLower = intent.message.toLowerCase();
  const { diffStats, insertions, deletions, filesChanged } = analysis;

  // Rule 1: Check for suspicious patterns based on intent keywords
  const performanceIntent = /performance|speed|latency|optimize|faster|slow/i.test(intent.message);
  const securityIntent = /security|auth|permission|validate|sanitize/i.test(intent.message);
  const bugfixIntent = /fix|bug|error|issue|crash/i.test(intent.message);
  const featureIntent = /add|new|feature|implement|create/i.test(intent.message);

  // Rule 2: Detect common anti-patterns
  diffStats.forEach(file => {
    const fileName = file.file.toLowerCase();
    
    // Performance intent but adding logging
    if (performanceIntent && analysis.diff.includes('console.log')) {
      const penalty = 10;
      result.warnings.push({
        severity: 'medium',
        message: `Added logging may impact performance (intent: improve performance)`,
        file: file.file
      });
      result.score -= penalty;
      result.breakdown.riskPatterns -= penalty;
      if (!result.topIssue) result.topIssue = 'Logging conflicts with performance goal';
    }

    // Performance intent but adding database queries
    if (performanceIntent && (analysis.diff.includes('db.query') || analysis.diff.includes('SELECT') || analysis.diff.includes('await'))) {
      const penalty = 15;
      result.warnings.push({
        severity: 'high',
        message: `New async operations detected while optimizing for performance`,
        file: file.file
      });
      result.score -= penalty;
      result.breakdown.riskPatterns -= penalty;
      if (!result.topIssue) result.topIssue = 'Async operations added in performance optimization';
    }

    // Security intent but no validation added
    if (securityIntent && file.insertions > 10 && !analysis.diff.includes('validate') && !analysis.diff.includes('sanitize')) {
      const penalty = 10;
      result.warnings.push({
        severity: 'medium',
        message: `Large changes in security-related code without validation`,
        file: file.file
      });
      result.score -= penalty;
      result.breakdown.riskPatterns -= penalty;
      if (!result.topIssue) result.topIssue = 'Security changes without validation';
    }

    // Bugfix but changing many files (scope creep)
    if (bugfixIntent && filesChanged > 5) {
      const penalty = 5;
      result.warnings.push({
        severity: 'low',
        message: `Bug fix affects ${filesChanged} files - consider splitting into multiple commits`,
        file: 'multiple'
      });
      result.score -= penalty;
      result.breakdown.fileScope -= penalty;
      if (!result.topIssue) result.topIssue = 'Bugfix affects too many files';
    }
  });

  // Rule 3: Check for excessive changes
  if (insertions + deletions > 500 && !featureIntent) {
    const penalty = 10;
    result.warnings.push({
      severity: 'medium',
      message: `Large changeset (${insertions + deletions} lines) - intent may be too broad`,
      file: 'multiple'
    });
    result.score -= penalty;
    result.breakdown.codeVolume -= penalty;
    if (!result.topIssue) result.topIssue = 'Changeset too large for stated intent';
  }

  // Rule 4: Check for unrelated file changes
  const coreFiles = diffStats.filter(f => 
    !f.file.includes('test') && 
    !f.file.includes('README') && 
    !f.file.includes('.md')
  );
  
  if (coreFiles.length > 8 && !featureIntent) {
    const penalty = 20;
    result.warnings.push({
      severity: 'high',
      message: `${coreFiles.length} files changed - may contain unrelated changes`,
      file: 'multiple'
    });
    result.score -= penalty;
    result.breakdown.fileScope -= penalty;
    if (!result.topIssue) result.topIssue = 'Too many files modified';
  }

  // Determine alignment level
  if (result.score >= 90) {
    result.alignment = 'excellent';
  } else if (result.score >= 70) {
    result.alignment = 'good';
  } else if (result.score >= 50) {
    result.alignment = 'fair';
  } else {
    result.alignment = 'poor';
  }

  // Add suggestions based on warnings
  if (result.warnings.length > 0) {
    result.suggestions.push('Review warnings before committing');
    result.suggestions.push('Consider splitting into multiple focused commits');
  }

  if (result.score < 70) {
    result.suggestions.push('Your changes may not fully align with stated intent');
    result.suggestions.push('Update your intent or refine your changes');
  }

  return result;
}

/**
 * Displays alignment results to the user
 * @param {Object} alignmentResult - Result from checkAlignment
 */
function displayAlignment(alignmentResult) {
  console.log();
  console.log(chalk.bold('Intent-Change Alignment Check:'));
  console.log();

  // Display score with color
  const scoreColor = alignmentResult.score >= 90 ? 'green' : 
                     alignmentResult.score >= 70 ? 'yellow' : 'red';
  
  console.log(`  Score: ${chalk[scoreColor](alignmentResult.score + '/100')} (${alignmentResult.alignment})`);
  console.log();

  // Display breakdown if available
  if (alignmentResult.breakdown) {
    console.log(chalk.cyan('  Breakdown:'));
    const b = alignmentResult.breakdown;
    
    const clarityIcon = b.intentClarity >= 90 ? '✓' : b.intentClarity >= 70 ? '○' : '✗';
    const scopeIcon = b.fileScope >= 90 ? '✓' : b.fileScope >= 70 ? '○' : '✗';
    const volumeIcon = b.codeVolume >= 90 ? '✓' : b.codeVolume >= 70 ? '○' : '✗';
    
    console.log(chalk.cyan(`    ${clarityIcon} Intent clarity:    ${b.intentClarity >= 90 ? chalk.green(b.intentClarity + '%') : b.intentClarity >= 70 ? chalk.yellow(b.intentClarity + '%') : chalk.red(b.intentClarity + '%')}`));
    console.log(chalk.cyan(`    ${scopeIcon} File scope match:  ${b.fileScope >= 90 ? chalk.green(b.fileScope + '%') : b.fileScope >= 70 ? chalk.yellow(b.fileScope + '%') : chalk.red(b.fileScope + '%')}`));
    console.log(chalk.cyan(`    ${volumeIcon} Code volume:       ${b.codeVolume >= 90 ? chalk.green('Normal') : b.codeVolume >= 70 ? chalk.yellow('Acceptable') : chalk.red('Too large')}`));
    
    if (b.riskPatterns < 0) {
      console.log(chalk.yellow(`    ⚠ Risk patterns:    ${b.riskPatterns} points`));
    }
    console.log();
    
    // Display top issue if present
    if (alignmentResult.topIssue) {
      console.log(chalk.yellow(`  Top Issue: ${alignmentResult.topIssue}`));
      console.log();
    }
  }

  // Display warnings
  if (alignmentResult.warnings.length > 0) {
    console.log(chalk.yellow('  ⚠ Warnings:'));
    alignmentResult.warnings.forEach(warning => {
      const icon = warning.severity === 'high' ? '●' : 
                   warning.severity === 'medium' ? '○' : '·';
      console.log(chalk.yellow(`    ${icon} ${warning.message}`));
      if (warning.file !== 'multiple') {
        console.log(chalk.gray(`      in ${warning.file}`));
      }
    });
    console.log();
  } else {
    console.log(chalk.green('  ✓ No alignment issues detected'));
    console.log();
  }

  // Display suggestions
  if (alignmentResult.suggestions.length > 0) {
    console.log(chalk.cyan('  Suggestions:'));
    alignmentResult.suggestions.forEach(suggestion => {
      console.log(chalk.cyan(`    • ${suggestion}`));
    });
    console.log();
  }
}

module.exports = {
  checkAlignment,
  displayAlignment
};
