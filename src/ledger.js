const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const LEDGER_DIR = '.intent-ledger';
const LEDGER_INDEX = path.join(LEDGER_DIR, 'index.json');

/**
 * Ensures ledger directory exists
 */
function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

/**
 * Saves intent to permanent ledger linked to commit
 * @param {Object} intent - Intent object
 * @param {string} commitHash - Git commit hash
 * @param {Object} analysis - Code analysis
 * @param {Object} alignment - Alignment result
 */
function saveToLedger(intent, commitHash, analysis, alignment) {
  ensureLedgerDir();
  
  const entry = {
    intentId: intent.id,
    commitHash: commitHash.substring(0, 7),
    fullHash: commitHash,
    intent: intent.message,
    timestamp: intent.timestamp,
    files: analysis.diffStats.map(f => f.file),
    stats: {
      filesChanged: analysis.filesChanged,
      insertions: analysis.insertions,
      deletions: analysis.deletions
    },
    alignment: {
      score: alignment.score,
      level: alignment.alignment,
      warningCount: alignment.warnings.length
    }
  };

  // Save individual entry
  const entryFile = path.join(LEDGER_DIR, `${commitHash.substring(0, 7)}.json`);
  fs.writeFileSync(entryFile, JSON.stringify(entry, null, 2));

  // Update index
  let index = [];
  if (fs.existsSync(LEDGER_INDEX)) {
    const data = fs.readFileSync(LEDGER_INDEX, 'utf8');
    index = JSON.parse(data);
  }
  
  index.unshift(entry); // Add to beginning
  fs.writeFileSync(LEDGER_INDEX, JSON.stringify(index, null, 2));

  console.log(chalk.green('✓ Intent saved to ledger'));
}

/**
 * Retrieves intent from ledger by commit hash
 * @param {string} commitHash - Git commit hash (short or full)
 * @returns {Object|null} Intent entry or null
 */
function getFromLedger(commitHash) {
  ensureLedgerDir();
  
  const shortHash = commitHash.substring(0, 7);
  const entryFile = path.join(LEDGER_DIR, `${shortHash}.json`);
  
  if (fs.existsSync(entryFile)) {
    const data = fs.readFileSync(entryFile, 'utf8');
    return JSON.parse(data);
  }
  
  return null;
}

/**
 * Gets all intents from ledger
 * @param {string} filePath - Optional file path to filter
 * @returns {Array} Array of intent entries
 */
function getAllIntents(filePath = null) {
  ensureLedgerDir();
  
  if (!fs.existsSync(LEDGER_INDEX)) {
    return [];
  }
  
  const data = fs.readFileSync(LEDGER_INDEX, 'utf8');
  let intents = JSON.parse(data);
  
  // Filter by file if specified
  if (filePath) {
    intents = intents.filter(entry => 
      entry.files.some(f => f.includes(filePath))
    );
  }
  
  return intents;
}

/**
 * Gets intent statistics
 * @returns {Object} Statistics about intents
 */
function getIntentStats() {
  const intents = getAllIntents();
  
  if (intents.length === 0) {
    return {
      total: 0,
      avgAlignment: 0,
      byType: {},
      topFiles: []
    };
  }
  
  // Calculate statistics
  const totalAlignment = intents.reduce((sum, i) => sum + i.alignment.score, 0);
  const avgAlignment = Math.round(totalAlignment / intents.length);
  
  // Count by intent keywords
  const byType = {};
  intents.forEach(entry => {
    const intent = entry.intent.toLowerCase();
    let type = 'other';
    
    if (/performance|speed|optimize/i.test(intent)) type = 'performance';
    else if (/fix|bug/i.test(intent)) type = 'bugfix';
    else if (/add|new|feature/i.test(intent)) type = 'feature';
    else if (/refactor|clean/i.test(intent)) type = 'refactor';
    else if (/security|auth/i.test(intent)) type = 'security';
    
    byType[type] = (byType[type] || 0) + 1;
  });
  
  // Find most frequently changed files
  const fileMap = {};
  intents.forEach(entry => {
    entry.files.forEach(file => {
      fileMap[file] = (fileMap[file] || 0) + 1;
    });
  });
  
  const topFiles = Object.entries(fileMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([file, count]) => ({ file, count }));
  
  return {
    total: intents.length,
    avgAlignment,
    byType,
    topFiles
  };
}

module.exports = {
  saveToLedger,
  getFromLedger,
  getAllIntents,
  getIntentStats
};
