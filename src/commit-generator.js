const chalk = require('chalk');

/**
 * Generates decision-aware commit messages based on intent and code changes
 */

/**
 * Determines commit type from intent
 * @param {string} intent - Intent message
 * @returns {string} Conventional commit type
 */
function determineCommitType(intent) {
  const intentLower = intent.toLowerCase();
  
  if (/fix|bug|error|issue|crash|resolve/i.test(intent)) return 'fix';
  if (/performance|speed|optimize|faster|latency/i.test(intent)) return 'perf';
  if (/add|new|feature|implement|create/i.test(intent)) return 'feat';
  if (/refactor|restructure|reorganize|clean/i.test(intent)) return 'refactor';
  if (/document|readme|comment|doc/i.test(intent)) return 'docs';
  if (/style|format|lint/i.test(intent)) return 'style';
  if (/test|spec|coverage/i.test(intent)) return 'test';
  if (/build|ci|deploy|config/i.test(intent)) return 'chore';
  if (/security|auth|permission|validate/i.test(intent)) return 'security';
  
  return 'chore';
}

/**
 * Extracts scope from changed files
 * @param {Array} diffStats - File change statistics
 * @returns {string} Scope for commit
 */
function extractScope(diffStats) {
  if (diffStats.length === 0) return '';
  
  // Get most common directory
  const dirs = diffStats.map(f => {
    const parts = f.file.split('/');
    return parts.length > 1 ? parts[0] : '';
  }).filter(d => d && d !== 'src');
  
  if (dirs.length === 0) return '';
  
  // Find most common
  const counts = {};
  dirs.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const mostCommon = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  
  return mostCommon || '';
}

/**
 * Generates a commit title
 * @param {Object} intent - Intent object
 * @param {Object} analysis - Code analysis
 * @returns {string} Commit title
 */
function generateTitle(intent, analysis) {
  const type = determineCommitType(intent.message);
  const scope = extractScope(analysis.diffStats);
  
  // Create a concise title from intent
  let title = intent.message;
  
  // Truncate if too long
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  // Format: type(scope): title
  return scope ? `${type}(${scope}): ${title}` : `${type}: ${title}`;
}

/**
 * Generates the full commit message with decision context
 * @param {Object} intent - Intent object
 * @param {Object} analysis - Code analysis
 * @param {Object} alignment - Alignment result
 * @returns {string} Full commit message
 */
function generateCommitMessage(intent, analysis, alignment) {
  const title = generateTitle(intent, analysis);
  
  const sections = [];
  
  // Intent section
  sections.push('Intent:');
  sections.push(`- ${intent.message}`);
  sections.push('');
  
  // Changes section
  sections.push('Changes:');
  if (analysis.diffStats.length <= 5) {
    analysis.diffStats.forEach(file => {
      const change = file.insertions > 0 && file.deletions > 0 ? 'Modified' :
                     file.insertions > 0 ? 'Added' : 'Removed';
      sections.push(`- ${change}: ${file.file} (+${file.insertions}/-${file.deletions})`);
    });
  } else {
    sections.push(`- Modified ${analysis.filesChanged} files`);
    sections.push(`- +${analysis.insertions}/-${analysis.deletions} lines changed`);
  }
  sections.push('');
  
  // Impact section (based on alignment)
  if (alignment.score >= 90) {
    sections.push('Impact:');
    sections.push('- Changes align with stated intent');
    sections.push('');
  }
  
  // Warnings/Risks section
  if (alignment.warnings.length > 0) {
    sections.push('Risks:');
    alignment.warnings.forEach(warning => {
      sections.push(`- ${warning.message}`);
    });
    sections.push('');
  }
  
  // Metadata
  sections.push(`Intent ID: ${intent.id}`);
  sections.push(`Alignment Score: ${alignment.score}/100`);
  
  return `${title}\n\n${sections.join('\n')}`;
}

/**
 * Displays the generated commit message for review
 * @param {string} message - Commit message
 */
function displayCommitMessage(message) {
  console.log(chalk.bold('\nGenerated Commit Message:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(message);
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

module.exports = {
  generateCommitMessage,
  displayCommitMessage,
  determineCommitType,
  generateTitle
};
