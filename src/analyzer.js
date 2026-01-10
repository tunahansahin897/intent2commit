const simpleGit = require('simple-git');
const chalk = require('chalk');

const git = simpleGit();

/**
 * Analyzes staged changes in Git
 * @returns {Object} Analysis of staged changes
 */
async function analyzeChanges() {
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }

    // Get staged files
    const status = await git.status();
    const stagedFiles = [...status.staged, ...status.modified].filter(
      file => status.staged.includes(file)
    );

    if (stagedFiles.length === 0) {
      throw new Error('No staged changes found. Use "git add" to stage your changes first.');
    }

    // Get diff of staged changes
    const diff = await git.diff(['--cached']);
    
    // Parse diff for statistics
    const diffStats = await git.diffSummary(['--cached']);

    const analysis = {
      stagedFiles,
      filesChanged: diffStats.files.length,
      insertions: diffStats.insertions,
      deletions: diffStats.deletions,
      diff,
      diffStats: diffStats.files.map(file => ({
        file: file.file,
        changes: file.changes,
        insertions: file.insertions,
        deletions: file.deletions
      }))
    };

    return analysis;
  } catch (error) {
    console.error(chalk.red('✗ Failed to analyze changes:'), error.message);
    throw error;
  }
}

/**
 * Gets the list of recent commits
 * @param {number} limit - Number of commits to retrieve
 * @returns {Array} List of recent commits
 */
async function getRecentCommits(limit = 10) {
  try {
    const log = await git.log({ maxCount: limit });
    return log.all;
  } catch (error) {
    console.error(chalk.red('✗ Failed to get commits:'), error.message);
    return [];
  }
}

/**
 * Creates a Git commit with the generated message
 * @param {string} message - Commit message
 * @returns {Object} Commit result
 */
async function createCommit(message) {
  try {
    const result = await git.commit(message);
    return result;
  } catch (error) {
    console.error(chalk.red('✗ Failed to create commit:'), error.message);
    throw error;
  }
}

module.exports = {
  analyzeChanges,
  getRecentCommits,
  createCommit
};
