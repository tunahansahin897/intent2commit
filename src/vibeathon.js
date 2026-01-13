const chalk = require('chalk');

/**
 * Vibeathon Mode
 * 
 * Agresif drift kontrolü ve minimal setup için özel mod.
 * Hackathon'lar için optimize edilmiş.
 */

const VIBEATHON_CONFIG = {
  // Daha düşük tolerans
  minFulfillmentScore: 75,
  
  // Drift = anında uyarı
  strictDrift: true,
  
  // Tek dosya = muhtemelen drift
  singleFileDriftWarning: true,
  
  // Renkli, dikkat çekici output
  loudWarnings: true,
  
  // Hızlı mode - az soru
  quickMode: true
};

/**
 * Vibeathon mode ile intent yakala
 * @param {string} message - Intent mesajı
 */
async function captureVibeathonIntent(message) {
  console.log(chalk.magenta.bold('\n🔥 VIBEATHON MODE ACTIVE\n'));
  
  const { captureIntent } = require('./capture');
  
  // Intent'i kaydet
  const intent = await captureIntent(message, {
    vibeathon: true,
    strictMode: true
  });
  
  console.log(chalk.green('✓ Intent captured in Vibeathon mode'));
  console.log(chalk.yellow('⚡ Aggressive drift detection: ON'));
  console.log(chalk.yellow('🚨 Scope violations: BLOCKED'));
  console.log();
  
  return intent;
}

/**
 * Vibeathon mode preview
 * Daha agresif uyarılar
 */
async function previewVibeathon() {
  const { analyzeChanges } = require('./analyzer');
  const { getCurrentIntent } = require('./capture');
  const { calculateFulfillment, displayFulfillment } = require('./fulfillment');
  
  console.log(chalk.magenta.bold('\n🔥 VIBEATHON PREVIEW\n'));
  
  const intent = getCurrentIntent();
  if (!intent) {
    console.log(chalk.red.bold('❌ NO INTENT! Vibeathon mode requires intent first.'));
    console.log(chalk.yellow('Run: intent --vibeathon "your intent"'));
    process.exit(1);
  }
  
  const analysis = await analyzeChanges();
  
  if (!analysis.filesChanged) {
    console.log(chalk.yellow('No staged changes.'));
    process.exit(0);
  }
  
  const changedFiles = analysis.files || [];
  const diffStats = {
    insertions: analysis.insertions || 0,
    deletions: analysis.deletions || 0
  };
  
  const fulfillment = calculateFulfillment(intent, changedFiles, diffStats);
  
  // Vibeathon mode: Daha agresif threshold
  if (fulfillment.score < VIBEATHON_CONFIG.minFulfillmentScore) {
    console.log(chalk.red.bold('🚨🚨🚨 VIBEATHON ALERT 🚨🚨🚨'));
    console.log(chalk.red(`Score ${fulfillment.score}/100 - TOO LOW!`));
    console.log(chalk.yellow('Fix your changes before committing!'));
    console.log();
  }
  
  // Drift detection
  if (fulfillment.driftDetected) {
    console.log(chalk.red.bold('\n⚠️⚠️⚠️ DRIFT DETECTED ⚠️⚠️⚠️'));
    console.log(chalk.red('These files are OUTSIDE your intent:'));
    fulfillment.driftFiles.forEach(f => {
      console.log(chalk.red(`  ❌ ${f}`));
    });
    console.log();
    console.log(chalk.yellow.bold('In Vibeathon mode, this would BLOCK your commit!'));
    console.log(chalk.yellow('Options:'));
    console.log(chalk.gray('  1. Remove these files from staged'));
    console.log(chalk.gray('  2. Update your intent to include them'));
    console.log(chalk.gray('  3. Split into separate commits'));
    console.log();
  }
  
  // Display standard fulfillment
  displayFulfillment(intent, fulfillment);
  
  // Vibeathon summary
  console.log(chalk.magenta.bold('─'.repeat(50)));
  if (fulfillment.score >= VIBEATHON_CONFIG.minFulfillmentScore && !fulfillment.driftDetected) {
    console.log(chalk.green.bold('✅ VIBEATHON APPROVED - Ready to commit!'));
  } else {
    console.log(chalk.red.bold('❌ VIBEATHON BLOCKED - Fix issues first!'));
  }
  console.log(chalk.magenta.bold('─'.repeat(50)));
  console.log();
}

/**
 * Vibeathon config'i intent'e ekle
 */
function getVibeathonConfig() {
  return VIBEATHON_CONFIG;
}

module.exports = {
  captureVibeathonIntent,
  previewVibeathon,
  getVibeathonConfig,
  VIBEATHON_CONFIG
};
