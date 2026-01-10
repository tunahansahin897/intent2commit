const chalk = require('chalk');
const readline = require('readline');

/**
 * Progress indicators and loading animations for better UX
 */

/**
 * Simple spinner animation
 */
class Spinner {
  constructor(message = 'Loading...') {
    this.message = message;
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.frameIndex = 0;
    this.intervalId = null;
    this.stream = process.stderr;
  }

  start() {
    // Hide cursor
    this.stream.write('\x1B[?25l');
    
    this.intervalId = setInterval(() => {
      const frame = this.frames[this.frameIndex];
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
      this.stream.write(chalk.cyan(frame) + ' ' + this.message);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage = null) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
      
      if (finalMessage) {
        this.stream.write(finalMessage + '\n');
      }
      
      // Show cursor
      this.stream.write('\x1B[?25h');
    }
  }

  succeed(message) {
    this.stop(chalk.green('✓') + ' ' + message);
  }

  fail(message) {
    this.stop(chalk.red('✗') + ' ' + message);
  }

  warn(message) {
    this.stop(chalk.yellow('⚠') + ' ' + message);
  }

  info(message) {
    this.stop(chalk.blue('ℹ') + ' ' + message);
  }
}

/**
 * Progress bar for operations with known steps
 */
class ProgressBar {
  constructor(total, message = 'Progress') {
    this.total = total;
    this.current = 0;
    this.message = message;
    this.stream = process.stderr;
    this.width = 40;
  }

  update(current, message = null) {
    this.current = current;
    if (message) this.message = message;
    this.render();
  }

  increment(message = null) {
    this.current++;
    if (message) this.message = message;
    this.render();
  }

  render() {
    const percentage = Math.round((this.current / this.total) * 100);
    const filled = Math.round((this.current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    readline.clearLine(this.stream, 0);
    readline.cursorTo(this.stream, 0);
    this.stream.write(`${this.message}: ${bar} ${percentage}%`);
    
    if (this.current >= this.total) {
      this.stream.write('\n');
    }
  }

  complete(message = null) {
    this.current = this.total;
    if (message) this.message = message;
    this.render();
  }
}

/**
 * Dots animation for indeterminate progress
 */
class DotsAnimation {
  constructor(message = 'Processing') {
    this.message = message;
    this.dotCount = 0;
    this.maxDots = 3;
    this.intervalId = null;
    this.stream = process.stderr;
  }

  start() {
    this.stream.write('\x1B[?25l'); // Hide cursor
    
    this.intervalId = setInterval(() => {
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
      
      const dots = '.'.repeat(this.dotCount + 1);
      const spaces = ' '.repeat(this.maxDots - this.dotCount);
      this.stream.write(chalk.cyan(this.message + dots + spaces));
      
      this.dotCount = (this.dotCount + 1) % this.maxDots;
    }, 500);
  }

  stop(finalMessage = null) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
      
      if (finalMessage) {
        this.stream.write(finalMessage + '\n');
      }
      
      this.stream.write('\x1B[?25h'); // Show cursor
    }
  }
}

/**
 * Helper: Run async operation with spinner
 * @param {string} message - Loading message
 * @param {Function} operation - Async operation to run
 * @returns {Promise} Operation result
 */
async function withSpinner(message, operation) {
  const spinner = new Spinner(message);
  spinner.start();
  
  try {
    const result = await operation();
    spinner.succeed(message.replace('...', '') + ' ✓');
    return result;
  } catch (error) {
    spinner.fail(message.replace('...', '') + ' ✗');
    throw error;
  }
}

/**
 * Helper: Run async operation with progress bar
 * @param {string} message - Operation message
 * @param {number} totalSteps - Total steps
 * @param {Function} operation - Async operation (receives progress updater)
 * @returns {Promise} Operation result
 */
async function withProgressBar(message, totalSteps, operation) {
  const bar = new ProgressBar(totalSteps, message);
  bar.render();
  
  const updateProgress = (step, stepMessage) => {
    bar.update(step, stepMessage || message);
  };
  
  try {
    const result = await operation(updateProgress);
    bar.complete(message + ' - Complete');
    return result;
  } catch (error) {
    bar.complete(chalk.red(message + ' - Failed'));
    throw error;
  }
}

/**
 * Estimate operation time
 * @param {string} operation - Operation name
 * @returns {string} Estimated time
 */
function estimateTime(operation) {
  const estimates = {
    'analyze': '1-2 seconds',
    'commit': '2-3 seconds',
    'preview': '1 second',
    'alignment': '1-2 seconds',
    'matrix': '2-3 seconds',
    'export': '1 second'
  };
  
  return estimates[operation] || '1-2 seconds';
}

/**
 * Show step indicator
 * @param {number} current - Current step
 * @param {number} total - Total steps
 * @param {string} stepName - Step name
 */
function showStep(current, total, stepName) {
  const progress = `[${current}/${total}]`;
  console.log(chalk.gray(progress) + ' ' + chalk.cyan(stepName));
}

module.exports = {
  Spinner,
  ProgressBar,
  DotsAnimation,
  withSpinner,
  withProgressBar,
  estimateTime,
  showStep
};
