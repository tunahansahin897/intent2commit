const { execSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function checkIntentFulfillment() {
  try {
    // Get inputs
    const minScore = parseInt(core.getInput('min-fulfillment-score') || '70');
    const failOnLow = core.getInput('fail-on-low-fulfillment') === 'true';
    const failOnDrift = core.getInput('fail-on-drift') === 'true';
    const commentOnPR = core.getInput('comment-on-pr') !== 'false';
    const token = core.getInput('github-token');

    // Get PR context
    const context = github.context;
    const pr = context.payload.pull_request;

    if (!pr) {
      core.setFailed('This action only works on pull requests');
      return;
    }

    core.info(`Checking intent fulfillment for PR #${pr.number}`);

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

    core.info(`PR has ${files.length} changed files`);

    // Extract intent from PR
    const intentMessage = extractIntentFromPR(pr);

    if (!intentMessage) {
      const comment = generateNoIntentComment();
      
      if (commentOnPR) {
        await postComment(octokit, context, pr.number, comment);
      }

      if (failOnLow) {
        core.setFailed('No intent found in PR');
      } else {
        core.warning('No intent found in PR');
      }
      return;
    }

    core.info(`Intent: ${intentMessage}`);

    // Calculate fulfillment
    const fulfillment = calculateFulfillment(intentMessage, files);

    core.info(`Fulfillment Score: ${fulfillment.score}/100`);
    core.info(`Drift Detected: ${fulfillment.driftDetected}`);

    // Set outputs
    core.setOutput('fulfillment-score', fulfillment.score);
    core.setOutput('fulfillment-level', fulfillment.level);
    core.setOutput('drift-detected', fulfillment.driftDetected);

    // Generate comprehensive report
    const report = generateFulfillmentReport(intentMessage, fulfillment, files);

    // Post comment
    if (commentOnPR) {
      await postComment(octokit, context, pr.number, report);
    }

    // Generate badge
    const badgeUrl = generateBadgeUrl(fulfillment.score);
    core.setOutput('badge-url', badgeUrl);

    // Fail conditions
    if (failOnDrift && fulfillment.driftDetected) {
      core.setFailed(`Intent drift detected: ${fulfillment.driftFiles.length} file(s) outside scope`);
      return;
    }

    if (failOnLow && fulfillment.score < minScore) {
      core.setFailed(`Fulfillment score (${fulfillment.score}) below threshold (${minScore})`);
      return;
    }

    core.info('✅ Intent fulfillment check passed');

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

function extractIntentFromPR(pr) {
  // Priority 1: Intent in PR description
  const bodyMatch = pr.body?.match(/Intent:\s*(.+)/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  // Priority 2: Intent in PR title
  const titleMatch = pr.title.match(/Intent:\s*(.+)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Priority 3: First line of PR description
  if (pr.body) {
    const firstLine = pr.body.split('\n')[0].trim();
    if (firstLine.length > 10 && firstLine.length < 200) {
      return firstLine;
    }
  }

  return null;
}

function calculateFulfillment(intent, files) {
  const intentKeywords = intent.toLowerCase().split(/\s+/);
  
  let score = 70; // Base score
  const warnings = [];
  const driftFiles = [];
  
  // 1. File relevance check
  const relevantFiles = files.filter(file => {
    const fileName = file.filename.toLowerCase();
    return intentKeywords.some(keyword => 
      fileName.includes(keyword) || keyword.length < 4
    );
  });
  
  const relevanceRatio = relevantFiles.length / files.length;
  
  if (relevanceRatio >= 0.8) {
    score += 20;
  } else if (relevanceRatio >= 0.5) {
    score += 10;
  } else {
    score -= 10;
    warnings.push({
      type: 'low-relevance',
      message: `Only ${Math.round(relevanceRatio * 100)}% of files match intent keywords`,
      severity: 'medium'
    });
  }

  // 2. Detect drift (files with no keyword match)
  const irrelevantFiles = files.filter(file => {
    const fileName = file.filename.toLowerCase();
    return !intentKeywords.some(kw => fileName.includes(kw));
  });

  if (irrelevantFiles.length > 0) {
    driftFiles.push(...irrelevantFiles.map(f => f.filename));
    
    if (irrelevantFiles.length > 3) {
      warnings.push({
        type: 'intent-drift',
        message: `${irrelevantFiles.length} files outside declared intent scope`,
        severity: 'high'
      });
      score -= Math.min(20, irrelevantFiles.length * 3);
    } else {
      warnings.push({
        type: 'minor-drift',
        message: `${irrelevantFiles.length} file(s) may be outside intent scope`,
        severity: 'low'
      });
      score -= irrelevantFiles.length * 2;
    }
  }

  // 3. Change volume
  const totalChanges = files.reduce((sum, f) => sum + f.changes, 0);
  
  if (totalChanges > 500) {
    warnings.push({
      type: 'large-changeset',
      message: `${totalChanges} lines changed - consider splitting`,
      severity: 'medium'
    });
    score -= 10;
  }

  // 4. File count
  if (files.length > 10) {
    warnings.push({
      type: 'many-files',
      message: `${files.length} files changed - verify scope`,
      severity: 'low'
    });
    score -= 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level;
  if (score >= 90) level = 'excellent';
  else if (score >= 75) level = 'good';
  else if (score >= 60) level = 'fair';
  else level = 'poor';

  return {
    score,
    level,
    warnings,
    driftDetected: driftFiles.length > 0,
    driftFiles,
    totalFiles: files.length,
    relevantFiles: relevantFiles.length,
    totalChanges
  };
}

function generateNoIntentComment() {
  return `## ⚠️ No Intent Found

This PR is missing an intent declaration.

**To fix:**
Add your intent to the PR description:

\`\`\`
Intent: <describe what you're trying to achieve>
\`\`\`

**Example:**
\`\`\`
Intent: reduce login latency by 40% via token caching
\`\`\`

**Why this matters:**
Intent2Commit tracks the "why" behind code changes, ensuring decisions are preserved for future developers.

---
*Powered by [Intent2Commit](https://github.com/tunahansahin897/intent2commit)*`;
}

function generateFulfillmentReport(intent, fulfillment, files) {
  const emoji = fulfillment.score >= 90 ? '✅' : 
                fulfillment.score >= 75 ? '✔️' : 
                fulfillment.score >= 60 ? '⚠️' : '❌';
  
  const scoreColor = fulfillment.score >= 90 ? '🟢' : 
                     fulfillment.score >= 75 ? '🟡' : 
                     fulfillment.score >= 60 ? '🟠' : '🔴';

  let report = `## ${emoji} Intent Fulfillment Report

**Declared Intent:** "${intent}"

**Fulfillment Score:** ${scoreColor} **${fulfillment.score}/100** (${fulfillment.level})

### 📊 Analysis

| Metric | Value |
|--------|-------|
| Files Changed | ${fulfillment.totalFiles} |
| Relevant Files | ${fulfillment.relevantFiles} (${Math.round((fulfillment.relevantFiles/fulfillment.totalFiles)*100)}%) |
| Total Changes | ${fulfillment.totalChanges} lines |
| Drift Detected | ${fulfillment.driftDetected ? '⚠️ Yes' : '✅ No'} |

`;

  // Drift warning
  if (fulfillment.driftDetected) {
    report += `
### 🚨 Intent Drift Detected

The following files appear to be outside the declared intent scope:

${fulfillment.driftFiles.map(f => `- \`${f}\``).join('\n')}

**Recommendation:** Consider splitting this PR or updating the intent to include these changes.

`;
  }

  // Warnings
  if (fulfillment.warnings.length > 0) {
    report += `
### ⚠️ Warnings

`;
    fulfillment.warnings.forEach(w => {
      const icon = w.severity === 'high' ? '🔴' : w.severity === 'medium' ? '🟡' : 'ℹ️';
      report += `${icon} ${w.message}\n`;
    });
    report += '\n';
  }

  // Recommendations
  if (fulfillment.score < 75) {
    report += `
### 💡 Recommendations

`;
    if (fulfillment.score < 60) {
      report += `- **Review scope:** This PR may be trying to do too much\n`;
      report += `- **Split commits:** Consider breaking into smaller, focused changes\n`;
    }
    if (fulfillment.driftDetected) {
      report += `- **Address drift:** Remove unrelated changes or update intent\n`;
    }
    if (fulfillment.totalChanges > 500) {
      report += `- **Reduce size:** Large changesets are harder to review\n`;
    }
    report += '\n';
  }

  report += `---
*Powered by [Intent2Commit](https://github.com/tunahansahin897/intent2commit) - Preserving the "why" in Git history*`;

  return report;
}

async function postComment(octokit, context, prNumber, body) {
  // Check if we already commented
  const { data: comments } = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber
  });

  const existingComment = comments.find(c => 
    c.body?.includes('Intent Fulfillment Report') || 
    c.body?.includes('No Intent Found')
  );

  if (existingComment) {
    // Update existing comment
    await octokit.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existingComment.id,
      body
    });
  } else {
    // Create new comment
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      body
    });
  }
}

function generateBadgeUrl(score) {
  const color = score >= 90 ? 'brightgreen' :
                score >= 75 ? 'green' :
                score >= 60 ? 'yellow' :
                score >= 40 ? 'orange' : 'red';
  
  const label = 'intent-fulfillment';
  const value = `${score}%25`; // URL encoded %
  
  return `https://img.shields.io/badge/${label}-${value}-${color}`;
}

checkIntentFulfillment();


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
