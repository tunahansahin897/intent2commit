const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const git = simpleGit();

/**
 * Intent-based Git branching
 * Auto-creates branches with intent-derived names and metadata
 */

/**
 * Create a new branch with intent
 * @param {string} intentMessage - The intent message
 * @param {string} intentId - Intent ID to link
 * @returns {Promise<Object>} Branch info
 */
async function createIntentBranch(intentMessage, intentId) {
  try {
    // Generate branch name from intent
    const branchName = generateBranchName(intentMessage);
    
    // Check if branch already exists
    const branches = await git.branch();
    if (branches.all.includes(branchName)) {
      throw new Error(`Branch ${branchName} already exists`);
    }
    
    // Create branch
    await git.checkoutLocalBranch(branchName);
    
    // Store metadata
    const metadata = {
      intentId,
      intentMessage,
      branchName,
      createdAt: new Date().toISOString(),
      baseBranch: branches.current
    };
    
    saveBranchMetadata(branchName, metadata);
    
    console.log();
    console.log(chalk.green('✓ Intent branch created'));
    console.log(chalk.cyan(`  Branch: ${branchName}`));
    console.log(chalk.gray(`  Intent: "${intentMessage}"`));
    console.log(chalk.gray(`  ID: ${intentId}`));
    console.log();
    
    return metadata;
  } catch (error) {
    throw new Error(`Failed to create intent branch: ${error.message}`);
  }
}

/**
 * Generate branch name from intent message
 * @param {string} intentMessage - Intent message
 * @returns {string} Branch name
 */
function generateBranchName(intentMessage) {
  // Slugify: lowercase, remove special chars, replace spaces with hyphens
  const slug = intentMessage
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50); // Max 50 chars
  
  return `intent/${slug}`;
}

/**
 * Save branch metadata
 */
function saveBranchMetadata(branchName, metadata) {
  const metadataDir = path.join(process.cwd(), '.intent-cache', 'branches');
  
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  
  const metadataFile = path.join(metadataDir, `${branchName.replace(/\//g, '_')}.json`);
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

/**
 * Get branch metadata
 */
function getBranchMetadata(branchName) {
  const metadataDir = path.join(process.cwd(), '.intent-cache', 'branches');
  const metadataFile = path.join(metadataDir, `${branchName.replace(/\//g, '_')}.json`);
  
  if (fs.existsSync(metadataFile)) {
    return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  }
  
  return null;
}

/**
 * Get alignment summary for current branch
 * Called during merge/PR creation
 */
async function getBranchAlignmentSummary() {
  try {
    const branches = await git.branch();
    const currentBranch = branches.current;
    
    const metadata = getBranchMetadata(currentBranch);
    
    if (!metadata) {
      return null;
    }
    
    // Get commits on this branch
    const log = await git.log([`${metadata.baseBranch}..${currentBranch}`]);
    const commits = log.all;
    
    // Calculate average alignment (if tracked)
    // This would require storing alignment scores per commit
    // For now, just return commit count
    
    return {
      intentMessage: metadata.intentMessage,
      branchName: currentBranch,
      createdAt: metadata.createdAt,
      commitCount: commits.length,
      commits: commits.map(c => ({
        hash: c.hash.substring(0, 7),
        message: c.message,
        date: c.date
      }))
    };
  } catch (error) {
    return null;
  }
}

/**
 * Display alignment summary
 */
function displayAlignmentSummary(summary) {
  if (!summary) {
    return;
  }
  
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════'));
  console.log(chalk.bold.cyan('        BRANCH ALIGNMENT SUMMARY'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════'));
  console.log();
  
  console.log(chalk.bold('Original Intent:'));
  console.log(chalk.cyan(`  "${summary.intentMessage}"`));
  console.log();
  
  console.log(chalk.bold('Branch Activity:'));
  console.log(`  Branch: ${summary.branchName}`);
  console.log(`  Commits: ${summary.commitCount}`);
  console.log(`  Duration: ${new Date(summary.createdAt).toLocaleDateString()} - today`);
  console.log();
  
  if (summary.commits.length > 0) {
    console.log(chalk.bold('Recent Commits:'));
    summary.commits.slice(0, 5).forEach(commit => {
      console.log(`  ${chalk.gray(commit.hash)} ${commit.message}`);
    });
    console.log();
  }
  
  console.log(chalk.yellow('💡 Tip: Review if all commits align with the original intent'));
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════'));
}

/**
 * List all intent branches
 */
async function listIntentBranches() {
  try {
    const branches = await git.branch();
    const intentBranches = branches.all.filter(b => b.startsWith('intent/'));
    
    if (intentBranches.length === 0) {
      console.log(chalk.gray('No intent branches found'));
      return [];
    }
    
    console.log();
    console.log(chalk.bold('Intent Branches:'));
    console.log();
    
    const branchesWithMetadata = [];
    
    for (const branch of intentBranches) {
      const metadata = getBranchMetadata(branch);
      const isCurrent = branch === branches.current;
      const marker = isCurrent ? chalk.green('*') : ' ';
      
      if (metadata) {
        console.log(`${marker} ${chalk.cyan(branch)}`);
        console.log(`  ${chalk.gray(`Intent: "${metadata.intentMessage}"`)}`);
        console.log(`  ${chalk.gray(`Created: ${new Date(metadata.createdAt).toLocaleDateString()}`)}`);
        branchesWithMetadata.push({ branch, metadata });
      } else {
        console.log(`${marker} ${chalk.cyan(branch)} ${chalk.gray('(no metadata)')}`);
      }
      console.log();
    }
    
    return branchesWithMetadata;
  } catch (error) {
    throw new Error(`Failed to list branches: ${error.message}`);
  }
}

module.exports = {
  createIntentBranch,
  getBranchAlignmentSummary,
  displayAlignmentSummary,
  listIntentBranches,
  generateBranchName
};
