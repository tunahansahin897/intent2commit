const { execSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function checkAlignment() {
  try {
    // Get inputs
    const minScore = parseInt(core.getInput('min-alignment-score'));
    const failOnLow = core.getInput('fail-on-low-alignment') === 'true';
    const commentOnPR = core.getInput('comment-on-pr') === 'true';
    const token = core.getInput('github-token');

    // Get PR context
    const context = github.context;
    const pr = context.payload.pull_request;

    if (!pr) {
      core.setFailed('This action only works on pull requests');
      return;
    }

    // Install Intent2Commit if not already installed
    try {
      execSync('intent --version', { stdio: 'ignore' });
    } catch {
      core.info('Installing Intent2Commit...');
      execSync('npm install -g intent2commit', { stdio: 'inherit' });
    }

    // Get PR files
    const octokit = github.getOctokit(token);
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number
    });

    core.info(`PR FILES: ${files.length}`);

    // Look for intent in PR body or commits
    const intentMessage = extractIntentFromPR(pr);

    if (!intentMessage) {
      const comment = `## ⚠️ No Intent Found\n\nPlease add your intent to the PR description using:\n\`\`\`\nIntent: <your intent message>\n\`\`\``;
      
      if (commentOnPR) {
        await postComment(octokit, context, pr.number, comment);
      }

      core.setFailed('No intent found in PR');
      return;
    }

    core.info(`Intent: ${intentMessage}`);

    // Calculate alignment
    const alignment = calculateAlignment(intentMessage, files);

    core.info(`Alignment Score: ${alignment.score}`);

    // Set outputs
    core.setOutput('alignment-score', alignment.score);
    core.setOutput('alignment-status', alignment.status);

    // Generate report
    const report = generateReport(intentMessage, alignment, files);

    // Post comment
    if (commentOnPR) {
      await postComment(octokit, context, pr.number, report);
    }

    // Generate badge
    const badgeUrl = `https://img.shields.io/badge/alignment-${alignment.score}%25-${getBadgeColor(alignment.score)}`;
    core.setOutput('badge-url', badgeUrl);

    // Fail if below threshold
    if (failOnLow && alignment.score < minScore) {
      core.setFailed(`Alignment score (${alignment.score}) below threshold (${minScore})`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

function extractIntentFromPR(pr) {
  // Look for "Intent: " in PR body
  const intentMatch = pr.body?.match(/Intent:\s*(.+)/i);
  if (intentMatch) {
    return intentMatch[1].trim();
  }

  // Look in commit messages
  if (pr.title.includes('Intent:')) {
    return pr.title.split('Intent:')[1].trim();
  }

  return null;
}

function calculateAlignment(intent, files) {
  const intentKeywords = intent.toLowerCase().split(/\s+/);
  
  let score = 70; // Base score
  
  // Check file relevance
  const relevantFiles = files.filter(file => {
    const fileName = file.filename.toLowerCase();
    return intentKeywords.some(keyword => fileName.includes(keyword));
  });
  
  const relevanceRatio = relevantFiles.length / files.length;
  score += relevanceRatio * 20;

  // File count factor
  if (files.length > 10) {
    score -= 10; // Too many files
  }

  // Change size factor
  const totalChanges = files.reduce((sum, f) => sum + f.changes, 0);
  if (totalChanges > 500) {
    score -= 15; // Too large
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status = 'poor';
  if (score >= 90) status = 'excellent';
  else if (score >= 75) status = 'good';
  else if (score >= 60) status = 'fair';

  return {
    score,
    status,
    totalFiles: files.length,
    relevantFiles: relevantFiles.length,
    totalChanges
  };
}

function generateReport(intent, alignment, files) {
  const emoji = alignment.score >= 90 ? '✅' : alignment.score >= 70 ? '⚠️' : '❌';
  
  return `## ${emoji} Intent-Change Alignment Report

**Intent:** "${intent}"

**Alignment Score:** ${alignment.score}/100 (${alignment.status})

### Details
- **Files Changed:** ${alignment.totalFiles}
- **Relevant Files:** ${alignment.relevantFiles}
- **Total Changes:** ${alignment.totalChanges} lines

### Breakdown
\`\`\`
Score: ${'█'.repeat(Math.floor(alignment.score / 10))}${'░'.repeat(10 - Math.floor(alignment.score / 10))} ${alignment.score}%
\`\`\`

${alignment.score < 70 ? `
### 💡 Recommendations
- Consider splitting this PR into smaller, focused changes
- Ensure all file changes align with stated intent
- Remove unrelated changes
` : ''}

---
*Powered by [Intent2Commit](https://github.com/yourusername/intent2commit)*
`;
}

async function postComment(octokit, context, prNumber, body) {
  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body
  });
}

function getBadgeColor(score) {
  if (score >= 90) return 'brightgreen';
  if (score >= 70) return 'yellow';
  return 'red';
}

checkAlignment();
