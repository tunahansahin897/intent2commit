const simpleGit = require('simple-git');
const chalk = require('chalk');
const git = simpleGit();

/**
 * Intent Diff - Track intent evolution across commits
 */

/**
 * Get intent diff between two commits
 * @param {string} fromCommit - Starting commit
 * @param {string} toCommit - Ending commit
 * @returns {Promise<Object>} Intent evolution data
 */
async function getIntentDiff(fromCommit = 'HEAD~5', toCommit = 'HEAD') {
  try {
    const log = await git.log([`${fromCommit}..${toCommit}`]);
    
    const intents = log.all.map(commit => {
      // Extract intent from commit message
      const intentMatch = commit.message.match(/Intent:\s*(.+)/);
      return {
        hash: commit.hash.substring(0, 7),
        date: commit.date,
        author: commit.author_name,
        intent: intentMatch ? intentMatch[1] : 'No intent recorded',
        message: commit.message.split('\n')[0]
      };
    });

    // Analyze evolution
    const analysis = analyzeIntentEvolution(intents);

    return {
      commits: intents,
      analysis
    };
  } catch (error) {
    throw new Error(`Failed to get intent diff: ${error.message}`);
  }
}

/**
 * Analyze intent evolution patterns
 */
function analyzeIntentEvolution(intents) {
  const keywords = {};
  let scopeChanges = 0;
  
  intents.forEach((intent, index) => {
    // Track keyword frequency
    const words = intent.intent.toLowerCase().split(/\s+/);
    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
    
    // Detect scope changes
    if (index > 0) {
      const prevWords = new Set(intents[index - 1].intent.toLowerCase().split(/\s+/));
      const currWords = new Set(intent.intent.toLowerCase().split(/\s+/));
      
      const overlap = [...currWords].filter(w => prevWords.has(w)).length;
      if (overlap < currWords.size / 2) {
        scopeChanges++;
      }
    }
  });

  return {
    totalCommits: intents.length,
    scopeChanges,
    topKeywords: Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count })),
    featureCreep: scopeChanges > intents.length / 3
  };
}

/**
 * Display intent diff
 */
function displayIntentDiff(diffData) {
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('           INTENT EVOLUTION ANALYSIS'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log();

  // Timeline
  console.log(chalk.bold('Timeline:'));
  console.log();
  
  diffData.commits.forEach((commit, index) => {
    const connector = index < diffData.commits.length - 1 ? '│' : '└';
    console.log(`${connector}─ ${chalk.yellow(commit.hash)} ${commit.message}`);
    console.log(`${index < diffData.commits.length - 1 ? '│' : ' '}  Intent: ${chalk.cyan(commit.intent)}`);
    console.log(`${index < diffData.commits.length - 1 ? '│' : ' '}  ${chalk.gray(commit.date.substring(0, 10))}`);
    console.log(index < diffData.commits.length - 1 ? '│' : '');
  });
  
  console.log();
  
  // Analysis
  console.log(chalk.bold('Analysis:'));
  console.log(`  Total Commits: ${diffData.analysis.totalCommits}`);
  console.log(`  Scope Changes: ${diffData.analysis.scopeChanges}`);
  
  if (diffData.analysis.featureCreep) {
    console.log(chalk.yellow('  ⚠ Feature Creep Detected'));
  } else {
    console.log(chalk.green('  ✓ Consistent Scope'));
  }
  
  console.log();
  console.log(chalk.bold('Top Keywords:'));
  diffData.analysis.topKeywords.forEach(({ word, count }) => {
    console.log(`  ${word.padEnd(15)} ${'█'.repeat(count)}`);
  });
  
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
}

module.exports = {
  getIntentDiff,
  displayIntentDiff
};
