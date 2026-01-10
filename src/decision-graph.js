const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Decision Graph - Visualize intent dependencies and relationships
 */

/**
 * Build decision graph from intent ledger
 * @returns {Object} Graph data structure
 */
function buildDecisionGraph() {
  const ledgerPath = path.join(process.cwd(), '.intent-ledger', 'intent-commits.json');
  
  if (!fs.existsSync(ledgerPath)) {
    throw new Error('No intent ledger found');
  }

  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  
  const nodes = [];
  const edges = [];
  
  ledger.forEach((entry, index) => {
    // Create node
    nodes.push({
      id: entry.intentId,
      label: entry.intent.substring(0, 30) + '...',
      type: detectIntentType(entry.intent),
      score: entry.alignmentScore || 0,
      timestamp: entry.timestamp
    });
    
    // Find dependencies (intents that reference similar files)
    if (index > 0) {
      const prevEntry = ledger[index - 1];
      const commonFiles = entry.filesChanged.filter(f => 
        prevEntry.filesChanged.includes(f)
      );
      
      if (commonFiles.length > 0) {
        edges.push({
          from: prevEntry.intentId,
          to: entry.intentId,
          weight: commonFiles.length,
          files: commonFiles
        });
      }
    }
  });

  return { nodes, edges };
}

/**
 * Detect intent type from message
 */
function detectIntentType(intentMessage) {
  const msg = intentMessage.toLowerCase();
  
  if (msg.includes('fix') || msg.includes('bug')) return 'bugfix';
  if (msg.includes('performance') || msg.includes('optimize')) return 'performance';
  if (msg.includes('security')) return 'security';
  if (msg.includes('refactor')) return 'refactor';
  if (msg.includes('test')) return 'test';
  if (msg.includes('add') || msg.includes('implement')) return 'feature';
  
  return 'other';
}

/**
 * Render decision graph as ASCII
 */
function renderDecisionGraph(graph) {
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('              DECISION GRAPH'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
  console.log();

  const { nodes, edges } = graph;

  // Group by type
  const byType = nodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {});

  console.log(chalk.bold('Node Distribution:'));
  Object.entries(byType).forEach(([type, typeNodes]) => {
    const icon = getTypeIcon(type);
    console.log(`  ${icon} ${type.padEnd(12)} ${typeNodes.length} intents`);
  });
  
  console.log();
  console.log(chalk.bold('Recent Decision Chain:'));
  console.log();

  // Show last 5 nodes with connections
  const recentNodes = nodes.slice(-5);
  
  recentNodes.forEach((node, index) => {
    const icon = getTypeIcon(node.type);
    const connector = index < recentNodes.length - 1 ? '↓' : '·';
    
    console.log(`${icon} ${node.label}`);
    console.log(chalk.gray(`   Score: ${node.score}/100`));
    
    // Show edges
    const outgoingEdges = edges.filter(e => e.from === node.id);
    if (outgoingEdges.length > 0) {
      const edge = outgoingEdges[0];
      console.log(chalk.gray(`   ${connector} Affects: ${edge.files.join(', ')}`));
    }
    
    console.log();
  });

  console.log(chalk.bold('Graph Stats:'));
  console.log(`  Total Nodes: ${nodes.length}`);
  console.log(`  Total Edges: ${edges.length}`);
  console.log(`  Avg Connections: ${(edges.length / nodes.length).toFixed(1)}`);
  
  console.log();
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════'));
}

/**
 * Export graph to JSON
 */
function exportGraph(graph, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
  console.log(chalk.green(`✓ Decision graph exported to ${outputPath}`));
}

/**
 * Get type icon
 */
function getTypeIcon(type) {
  const icons = {
    feature: '🚀',
    bugfix: '🐛',
    performance: '⚡',
    security: '🔒',
    refactor: '♻️',
    test: '🧪',
    other: '📝'
  };
  return icons[type] || '📝';
}

module.exports = {
  buildDecisionGraph,
  renderDecisionGraph,
  exportGraph
};
