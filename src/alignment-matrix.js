const chalk = require('chalk');

/**
 * Alignment Matrix - Per-file alignment scoring and visualization
 */

/**
 * Calculate per-file alignment scores
 * @param {Object} intent - The intent object
 * @param {Array} diffStats - Array of file change stats
 * @param {Object} globalAlignment - Global alignment result
 * @returns {Array} Array of file alignment objects
 */
function calculateFileAlignments(intent, diffStats, globalAlignment) {
  const intentKeywords = intent.message.toLowerCase().split(/\s+/);
  
  return diffStats.map(file => {
    // File name matching
    const fileName = file.file.toLowerCase();
    const nameMatch = intentKeywords.some(keyword => 
      fileName.includes(keyword) || keyword.includes(fileName.split('/').pop())
    );
    
    // Size factor (prefer smaller changes)
    const sizeScore = Math.max(0, 100 - (file.changes * 2));
    
    // Pattern detection
    const hasRiskPatterns = detectFileRiskPatterns(file.file, intent.message);
    
    // Calculate score
    let score = 70; // Base score
    
    if (nameMatch) score += 20;
    if (file.changes < 50) score += 10;
    if (!hasRiskPatterns) score += 10;
    else score -= 15;
    
    // Clamp
    score = Math.max(0, Math.min(100, score));
    
    return {
      file: file.file,
      insertions: file.insertions,
      deletions: file.deletions,
      changes: file.changes,
      score: Math.round(score),
      nameMatch,
      hasRiskPatterns,
      issues: hasRiskPatterns ? ['Risk pattern detected'] : []
    };
  });
}

/**
 * Detect risk patterns in individual files
 */
function detectFileRiskPatterns(filePath, intentMessage) {
  const intent = intentMessage.toLowerCase();
  const file = filePath.toLowerCase();
  
  // Performance intent + test file = OK
  if (intent.includes('performance') && file.includes('test')) {
    return false;
  }
  
  // Security intent + config file = potential issue
  if (intent.includes('security') && file.includes('config')) {
    return true;
  }
  
  // Refactor intent + new file = scope creep
  if (intent.includes('refactor') && file.includes('new')) {
    return true;
  }
  
  return false;
}

/**
 * Render alignment matrix as ASCII heatmap
 * @param {Array} fileAlignments - File alignment array
 */
function renderAlignmentMatrix(fileAlignments) {
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('              ALIGNMENT MATRIX (Per-File)'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log();
  
  // Header
  console.log(chalk.bold('FILE'.padEnd(40)) + chalk.bold('SCORE    CHANGES   STATUS'));
  console.log(chalk.gray('─'.repeat(70)));
  
  // Sort by score (lowest first to highlight issues)
  const sorted = [...fileAlignments].sort((a, b) => a.score - b.score);
  
  sorted.forEach(item => {
    const fileName = truncateFileName(item.file, 38);
    const scoreColor = getScoreColor(item.score);
    const statusIcon = getStatusIcon(item.score);
    
    // Score bar
    const barLength = 10;
    const filled = Math.round((item.score / 100) * barLength);
    const bar = chalk[scoreColor]('█'.repeat(filled)) + chalk.gray('░'.repeat(barLength - filled));
    
    console.log(
      fileName.padEnd(40) +
      `${bar} ${chalk[scoreColor](item.score.toString().padStart(3))}` +
      `  ${('+' + item.insertions + '/-' + item.deletions).padEnd(10)}` +
      statusIcon
    );
    
    // Show issues if any
    if (item.issues.length > 0) {
      item.issues.forEach(issue => {
        console.log(chalk.yellow(`    ⚠ ${issue}`));
      });
    }
  });
  
  console.log();
  console.log(chalk.bold('LEGEND:'));
  console.log(`  ${chalk.green('█')} Excellent (90-100)   ${chalk.yellow('█')} Fair (70-89)   ${chalk.red('█')} Poor (0-69)`);
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
}

/**
 * Helper: Truncate file name
 */
function truncateFileName(fileName, maxLength) {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  
  const parts = fileName.split('/');
  if (parts.length > 2) {
    return '.../' + parts.slice(-2).join('/');
  }
  
  return '...' + fileName.slice(-(maxLength - 3));
}

/**
 * Helper: Get score color
 */
function getScoreColor(score) {
  if (score >= 90) return 'green';
  if (score >= 70) return 'yellow';
  return 'red';
}

/**
 * Helper: Get status icon
 */
function getStatusIcon(score) {
  if (score >= 90) return chalk.green('✓ Excellent');
  if (score >= 70) return chalk.yellow('⚠ Fair');
  return chalk.red('✗ Poor');
}

/**
 * Export alignment matrix to CSV
 * @param {Array} fileAlignments - File alignment data
 * @param {string} outputPath - CSV output path
 */
function exportToCSV(fileAlignments, outputPath) {
  const fs = require('fs');
  
  const header = 'File,Score,Insertions,Deletions,Changes,Name Match,Has Risk Patterns,Issues\n';
  
  const rows = fileAlignments.map(item => {
    return [
      `"${item.file}"`,
      item.score,
      item.insertions,
      item.deletions,
      item.changes,
      item.nameMatch ? 'Yes' : 'No',
      item.hasRiskPatterns ? 'Yes' : 'No',
      `"${item.issues.join('; ')}"`
    ].join(',');
  }).join('\n');
  
  fs.writeFileSync(outputPath, header + rows);
  
  console.log(chalk.green(`✓ Alignment matrix exported to ${outputPath}`));
}

/**
 * Export to JSON
 * @param {Array} fileAlignments - File alignment data
 * @param {string} outputPath - JSON output path
 */
function exportToJSON(fileAlignments, outputPath) {
  const fs = require('fs');
  
  const data = {
    exportedAt: new Date().toISOString(),
    totalFiles: fileAlignments.length,
    averageScore: Math.round(
      fileAlignments.reduce((sum, f) => sum + f.score, 0) / fileAlignments.length
    ),
    files: fileAlignments
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(chalk.green(`✓ Alignment matrix exported to ${outputPath}`));
}

/**
 * Get alignment summary statistics
 */
function getAlignmentStats(fileAlignments) {
  const scores = fileAlignments.map(f => f.score);
  
  return {
    total: fileAlignments.length,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    min: Math.min(...scores),
    max: Math.max(...scores),
    excellent: fileAlignments.filter(f => f.score >= 90).length,
    fair: fileAlignments.filter(f => f.score >= 70 && f.score < 90).length,
    poor: fileAlignments.filter(f => f.score < 70).length
  };
}

module.exports = {
  calculateFileAlignments,
  renderAlignmentMatrix,
  exportToCSV,
  exportToJSON,
  getAlignmentStats
};
