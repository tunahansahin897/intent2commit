const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const CACHE_DIR = '.intent-cache';
const CACHE_FILE = path.join(CACHE_DIR, 'current-intent.json');

/**
 * Generates unique ID
 */
function generateId() {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Captures developer intent before code changes
 * @param {string} intentMessage - The stated intent
 * @param {Object} options - Options like template
 * @returns {Object} Intent object with ID and timestamp
 */
async function captureIntent(intentMessage, options = {}) {
  try {
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const intent = {
      id: generateId(),
      message: intentMessage,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
      template: options.template || null
    };

    // Save to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(intent, null, 2));

    console.log(chalk.green('✓ Intent captured'));
    console.log(chalk.gray(`  ID: ${intent.id}`));
    console.log(chalk.gray(`  "${intentMessage}"`));
    if (options.template) {
      console.log(chalk.gray(`  Template: ${options.template}`));
    }
    console.log();
    console.log(chalk.yellow('→ Make your code changes, then run:'));
    console.log(chalk.cyan('  intent commit'));
    
    return intent;
  } catch (error) {
    console.error(chalk.red('✗ Failed to capture intent:'), error.message);
    process.exit(1);
  }
}

/**
 * Captures intent using a template
 * @param {Object} template - Template object
 * @param {string} templateName - Name of template
 * @returns {Object} Intent object
 */
async function captureIntentFromTemplate(template, templateName) {
  try {
    console.log(chalk.bold(`\n${template.name} Template\n`));
    
    const answers = {};
    
    // Ask template questions
    for (const prompt of template.prompts) {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'answer',
          message: prompt.question
        }
      ]);
      answers[prompt.key] = response.answer;
    }
    
    // Generate intent from template
    const intentMessage = template.generate(answers);
    
    console.log();
    console.log(chalk.cyan('Generated intent:'), chalk.white(`"${intentMessage}"`));
    console.log();
    
    const { confirm } = await inquirer.prompt([
        {
        type: 'confirm',
        name: 'confirm',
        message: 'Use this intent?',
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('\n✗ Intent cancelled'));
      process.exit(0);
    }
    
    return await captureIntent(intentMessage, { template: templateName });
  } catch (error) {
    console.error(chalk.red('✗ Failed to create intent from template:'), error.message);
    process.exit(1);
  }
}

/**
 * Retrieves the current cached intent
 * @returns {Object|null} Current intent or null if not found
 */
function getCurrentIntent() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }

    const data = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.red('✗ Failed to read intent:'), error.message);
    return null;
  }
}

/**
 * Clears the current intent cache
 */
function clearIntent() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch (error) {
    console.error(chalk.yellow('⚠ Failed to clear intent cache:'), error.message);
  }
}

/**
 * Get intent history
 * @returns {Array} Array of previous intents
 */
function getIntentHistory() {
  const historyFile = path.join(CACHE_DIR, 'history.json');
  
  if (fs.existsSync(historyFile)) {
    return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  }
  
  return [];
}

/**
 * Save to history
 * @param {Object} intent - Intent to archive
 */
function saveToHistory(intent) {
  const historyFile = path.join(CACHE_DIR, 'history.json');
  const history = getIntentHistory();
  
  history.unshift({
    ...intent,
    archivedAt: new Date().toISOString()
  });
  
  // Keep last 50 intents
  const trimmedHistory = history.slice(0, 50);
  
  fs.writeFileSync(historyFile, JSON.stringify(trimmedHistory, null, 2));
}

/**
 * Edit current intent
 * @param {string} newMessage - New intent message
 * @param {string} reason - Reason for editing
 * @returns {Object} Updated intent
 */
async function editIntent(newMessage, reason) {
  try {
    const currentIntent = getCurrentIntent();
    
    if (!currentIntent) {
      throw new Error('No current intent to edit');
    }
    
    // Save current to history
    saveToHistory({
      ...currentIntent,
      editReason: 'Replaced by edit'
    });
    
    // Create new intent with edit metadata
    const updatedIntent = {
      id: generateId(), // New ID
      message: newMessage,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
      template: currentIntent.template,
      editedFrom: currentIntent.id,
      editReason: reason || 'User correction'
    };
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedIntent, null, 2));
    
    console.log();
    console.log(chalk.green('✓ Intent updated'));
    console.log(chalk.gray(`  Old: "${currentIntent.message}"`));
    console.log(chalk.cyan(`  New: "${newMessage}"`));
    if (reason) {
      console.log(chalk.gray(`  Reason: ${reason}`));
    }
    console.log();
    
    return updatedIntent;
  } catch (error) {
    throw new Error(`Failed to edit intent: ${error.message}`);
  }
}

/**
 * Undo current intent (revert to previous)
 * @returns {Object|null} Previous intent or null
 */
async function undoIntent() {
  try {
    const currentIntent = getCurrentIntent();
    
    if (!currentIntent) {
      throw new Error('No current intent to undo');
    }
    
    // Save current to history
    saveToHistory({
      ...currentIntent,
      editReason: 'Undone'
    });
    
    // Get history
    const history = getIntentHistory();
    
    if (history.length === 0) {
      // No history, just clear current
      clearCurrentIntent();
      console.log(chalk.yellow('✓ Intent cleared (no previous intent available)'));
      return null;
    }
    
    // Restore most recent from history
    const previousIntent = history[0];
    
    // Remove the undo-specific fields
    delete previousIntent.archivedAt;
    delete previousIntent.editReason;
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(previousIntent, null, 2));
    
    console.log();
    console.log(chalk.green('✓ Intent restored'));
    console.log(chalk.cyan(`  "${previousIntent.message}"`));
    console.log(chalk.gray(`  From: ${new Date(previousIntent.timestamp).toLocaleString()}`));
    console.log();
    
    // Remove from history
    history.shift();
    const historyFile = path.join(CACHE_DIR, 'history.json');
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    
    return previousIntent;
  } catch (error) {
    throw new Error(`Failed to undo intent: ${error.message}`);
  }
}

/**
 * Display intent history
 */
function displayIntentHistory() {
  const history = getIntentHistory();
  const current = getCurrentIntent();
  
  console.log();
  console.log(chalk.bold.cyan('INTENT HISTORY'));
  console.log();
  
  if (current) {
    console.log(chalk.green('* Current:'));
    console.log(chalk.cyan(`  "${current.message}"`));
    console.log(chalk.gray(`  ${new Date(current.timestamp).toLocaleString()}`));
    if (current.editedFrom) {
      console.log(chalk.gray(`  Edited (reason: ${current.editReason})`));
    }
    console.log();
  }
  
  if (history.length > 0) {
    console.log(chalk.bold('Previous:'));
    history.slice(0, 10).forEach((intent, index) => {
      console.log(`  ${index + 1}. "${intent.message}"`);
      console.log(chalk.gray(`     ${new Date(intent.timestamp).toLocaleString()}`));
      if (intent.editReason) {
        console.log(chalk.gray(`     ${intent.editReason}`));
      }
    });
    
    if (history.length > 10) {
      console.log(chalk.gray(`  ... and ${history.length - 10} more`));
    }
  } else {
    console.log(chalk.gray('No previous intents'));
  }
  
  console.log();
}

module.exports = {
  captureIntent,
  getCurrentIntent,
  clearCurrentIntent,
  captureWithTemplate,
  editIntent,
  undoIntent,
  getIntentHistory,
  displayIntentHistory
};
