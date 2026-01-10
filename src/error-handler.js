const chalk = require('chalk');

/**
 * Smart error handler with contextual help
 * Transforms technical errors into actionable messages
 */

/**
 * Handle Git-related errors
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
function handleGitError(error) {
  const errorMsg = error.message || '';
  
  // Git not installed
  if (errorMsg.includes('spawn git') || errorMsg.includes('ENOENT')) {
    return formatError({
      title: 'Git not found',
      problem: 'Intent2Commit requires Git to be installed and available in PATH.',
      solutions: [
        'Install Git: https://git-scm.com/downloads',
        'After installation, add Git to your system PATH',
        'Restart your terminal',
        'Verify installation: git --version'
      ],
      alternative: 'Use Intent2Commit in GitHub Codespaces or a Git-enabled environment'
    });
  }
  
  // Not a Git repository
  if (errorMsg.includes('not a git repository')) {
    return formatError({
      title: 'Not in a Git repository',
      problem: 'This command must be run from within a Git repository.',
      solutions: [
        'Initialize Git: git init',
        'Or navigate to your Git repository: cd your-project'
      ]
    });
  }
  
  // No staged changes
  if (errorMsg.includes('No staged changes')) {
    return formatError({
      title: 'No staged changes found',
      problem: 'You need to stage your changes before committing with intent.',
      solutions: [
        'Stage all changes: git add .',
        'Stage specific files: git add <file1> <file2>',
        'Check status: git status'
      ]
    });
  }
  
  // Generic Git error
  return formatError({
    title: 'Git operation failed',
    problem: errorMsg,
    solutions: [
      'Check your Git repository status: git status',
      'Ensure you have necessary permissions',
      'Verify Git is working: git --version'
    ]
  });
}

/**
 * Handle intent-related errors
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
function handleIntentError(error) {
  const errorMsg = error.message || '';
  
  // No intent captured
  if (errorMsg.includes('No intent found')) {
    return formatError({
      title: 'No intent captured',
      problem: 'You must capture your intent before committing.',
      solutions: [
        'Capture intent: intent "your intent message"',
        'Or use a template: intent --template <name>',
        'List templates: intent --template list'
      ],
      tip: 'Intent should describe WHY you\'re making changes, not WHAT changes'
    });
  }
  
  // Generic intent error
  return formatError({
    title: 'Intent operation failed',
    problem: errorMsg
  });
}

/**
 * Format error message with consistent styling
 * @param {Object} options - Error formatting options
 * @returns {string} Formatted error message
 */
function formatError(options) {
  const {
    title,
    problem,
    solutions = [],
    alternative,
    tip
  } = options;
  
  let output = '\n';
  
  // Title
  output += chalk.red.bold(`✗ ${title}\n`);
  output += '\n';
  
  // Problem
  if (problem) {
    output += chalk.white(problem) + '\n';
    output += '\n';
  }
  
  // Solutions
  if (solutions.length > 0) {
    output += chalk.cyan('Quick fix:\n');
    solutions.forEach((solution, index) => {
      output += chalk.cyan(`  ${index + 1}. ${solution}\n`);
    });
    output += '\n';
  }
  
  // Alternative
  if (alternative) {
    output += chalk.yellow('Alternative:\n');
    output += chalk.yellow(`  ${alternative}\n`);
    output += '\n';
  }
  
  // Tip
  if (tip) {
    output += chalk.gray(`💡 Tip: ${tip}\n`);
    output += '\n';
  }
  
  return output;
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} errorType - Type of error ('git' or 'intent')
 * @returns {Function} Wrapped function
 */
function withErrorHandling(fn, errorType = 'git') {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      const handler = errorType === 'git' ? handleGitError : handleIntentError;
      console.error(handler(error));
      process.exit(1);
    }
  };
}

module.exports = {
  handleGitError,
  handleIntentError,
  formatError,
  withErrorHandling
};
