const chalk = require('chalk');
const minimatch = require('minimatch');

/**
 * Intent Fulfillment Scorer
 * 
 * Tracks how well code changes fulfill the declared intent.
 * Replaces "alignment" with more meaningful "fulfillment" terminology.
 */

/**
 * Calculate Intent Fulfillment Score
 * @param {Object} intent - The intent object with template expectations
 * @param {Array} changedFiles - List of changed file paths
 * @param {Object} diffStats - Diff statistics
 * @returns {Object} Fulfillment analysis
 */
function calculateFulfillment(intent, changedFiles, diffStats) {
  const template = intent.template || null;
  const expectations = template ? getTemplateExpectations(template) : null;
  
  let score = 70; // Base score
  const warnings = [];
  const driftFiles = [];
  
  // 1. File Pattern Matching
  if (expectations && expectations.files) {
    const expectedFiles = changedFiles.filter(file =>
      expectations.files.some(pattern => minimatch(file, pattern))
    );
    
    const fileMatchRatio = expectedFiles.length / changedFiles.length;
    
    if (fileMatchRatio >= 0.8) {
      score += 20;
    } else if (fileMatchRatio >= 0.5) {
      score += 10;
    } else {
      score -= 10;
      warnings.push({
        type: 'file-mismatch',
        message: 'Changed files don\'t match expected pattern',
        severity: 'medium'
      });
    }
    
    // Detect drift: files outside expected patterns
    const unexpectedFiles = changedFiles.filter(file =>
      !expectations.files.some(pattern => minimatch(file, pattern))
    );
    
    if (unexpectedFiles.length > 0) {
      driftFiles.push(...unexpectedFiles);
      warnings.push({
        type: 'intent-drift',
        message: `${unexpectedFiles.length} file(s) outside declared intent`,
        files: unexpectedFiles,
        severity: unexpectedFiles.length > 3 ? 'high' : 'medium'
      });
      score -= Math.min(20, unexpectedFiles.length * 5);
    }
  }
  
  // 2. Change Volume Assessment
  const totalChanges = diffStats.insertions + diffStats.deletions;
  
  if (totalChanges > 500) {
    warnings.push({
      type: 'scope-too-large',
      message: 'Change volume exceeds recommended scope',
      severity: 'medium'
    });
    score -= 10;
  }
  
  // 3. Risk Level Check
  if (expectations && expectations.risk === 'high') {
    // High-risk intents should have tests
    const hasTests = changedFiles.some(f => 
      f.includes('test') || f.includes('spec')
    );
    
    if (!hasTests && expectations.tests === 'required') {
      warnings.push({
        type: 'missing-tests',
        message: 'High-risk change requires tests',
        severity: 'high'
      });
      score -= 15;
    }
  }
  
  // 4. Keyword Correlation
  const intentKeywords = intent.message.toLowerCase().split(/\s+/);
  const fileKeywords = changedFiles.join(' ').toLowerCase();
  
  const matchedKeywords = intentKeywords.filter(kw => 
    fileKeywords.includes(kw) || kw.length < 4
  );
  
  const keywordRatio = matchedKeywords.length / intentKeywords.length;
  score += Math.round(keywordRatio * 10);
  
  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine fulfillment level
  let level;
  if (score >= 90) level = 'excellent';
  else if (score >= 75) level = 'good';
  else if (score >= 60) level = 'fair';
  else level = 'poor';
  
  return {
    score,
    level,
    warnings,
    driftDetected: driftFiles.length > 0,
    driftFiles,
    expectations: expectations || null,
    breakdown: {
      filePatternMatch: fileMatchRatio ? Math.round(fileMatchRatio * 100) : null,
      keywordCorrelation: Math.round(keywordRatio * 100),
      riskAssessment: expectations ? expectations.risk : 'unknown',
      testCoverage: expectations && expectations.tests
    }
  };
}

/**
 * Get template expectations
 */
function getTemplateExpectations(templateName) {
  const { templates } = require('./templates');
  const template = templates[templateName];
  return template ? template.expectations : null;
}

/**
 * Display Intent Fulfillment report
 */
function displayFulfillment(intent, fulfillment) {
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('         INTENT FULFILLMENT ANALYSIS'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log();
  
  // Intent
  console.log(chalk.bold('Declared Intent:'));
  console.log(`  "${intent.message}"`);
  if (intent.template) {
    console.log(chalk.gray(`  Template: ${intent.template}`));
  }
  console.log();
  
  // Score
  const scoreColor = fulfillment.score >= 90 ? 'green' : 
                     fulfillment.score >= 75 ? 'yellow' : 'red';
  
  const barLength = 50;
  const filled = Math.round((fulfillment.score / 100) * barLength);
  const bar = chalk[scoreColor]('█'.repeat(filled)) + chalk.gray('░'.repeat(barLength - filled));
  
  console.log(chalk.bold('Fulfillment Score:'));
  console.log(`  ${bar} ${chalk[scoreColor](fulfillment.score + '/100')} (${fulfillment.level})`);
  console.log();
  
  // Drift Warning
  if (fulfillment.driftDetected) {
    console.log(chalk.yellow.bold('⚠ INTENT DRIFT DETECTED'));
    console.log();
    console.log(chalk.yellow('This commit touches files outside declared intent:'));
    fulfillment.driftFiles.forEach(file => {
      console.log(chalk.yellow(`  - ${file}`));
    });
    console.log();
    console.log(chalk.gray('Consider:'));
    console.log(chalk.gray('  1. Split this commit into separate intents'));
    console.log(chalk.gray('  2. Update intent to include broader scope'));
    console.log();
  }
  
  // Warnings
  if (fulfillment.warnings.length > 0) {
    console.log(chalk.bold('Warnings:'));
    fulfillment.warnings.forEach(w => {
      const icon = w.severity === 'high' ? '❌' : w.severity === 'medium' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${w.message}`);
    });
    console.log();
  }
  
  // Breakdown
  if (fulfillment.breakdown) {
    console.log(chalk.bold('Breakdown:'));
    if (fulfillment.breakdown.filePatternMatch !== null) {
      console.log(`  File Pattern Match: ${fulfillment.breakdown.filePatternMatch}%`);
    }
    console.log(`  Keyword Correlation: ${fulfillment.breakdown.keywordCorrelation}%`);
    if (fulfillment.breakdown.riskAssessment) {
      console.log(`  Risk Level: ${fulfillment.breakdown.riskAssessment}`);
    }
    console.log();
  }
  
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
}

module.exports = {
  calculateFulfillment,
  displayFulfillment
};
