#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { 
  captureIntent, 
  commitWithIntent, 
  showIntentLog, 
  showIntentStats, 
  explainCommit, 
  previewIntent,
  installHooks,
  uninstallHooks,
  suggestIntent
} = require('../src/index');

program
  .name('intent')
  .description('AI kod yazıyor. Kontrol sende kalıyor.')
  .version('2.0.0');

// Capture intent command
program
  .argument('[intent-message]', 'Niyetini tanımla')
  .option('-t, --template <name>', 'Template kullan (list için: --template list)')
  .option('-v, --vibeathon', 'Vibeathon mode - agresif drift kontrolü')
  .action(async (intentMessage, options) => {
    // Vibeathon mode
    if (options.vibeathon) {
      const { captureVibeathonIntent } = require('../src/vibeathon');
      await captureVibeathonIntent(intentMessage);
      return;
    }
    
    // Template mode
    if (options.template) {
      await captureIntent(null, { template: options.template });
      return;
    }
    
    if (!intentMessage) {
      console.log(chalk.yellow('Kullanım: intent "niyetini yaz"'));
      console.log(chalk.gray('\nÖrnek: intent "login sayfasını hızlandır"'));
      console.log(chalk.gray('\nTemplate kullan:'));
      console.log(chalk.cyan('  intent --template performance'));
      console.log(chalk.gray('\nVibeathon mode:'));
      console.log(chalk.magenta('  intent --vibeathon "feature X ekle"'));
      process.exit(1);
    }
    
    await captureIntent(intentMessage);
  });

// Commit with intent
program
  .command('commit')
  .description('Intent ile commit yap')
  .action(async () => {
    await commitWithIntent();
  });

// Preview intent and changes
program
  .command('preview')
  .description('Drift kontrolü ve preview')
  .option('--json', 'JSON output')
  .option('--vibeathon', 'Vibeathon mode preview')
  .action(async (options) => {
    if (options.vibeathon) {
      const { previewVibeathon } = require('../src/vibeathon');
      await previewVibeathon();
      return;
    }
    await previewIntent(options);
  });

// Show intent log
program
  .command('log')
  .description('Intent geçmişi')
  .option('-f, --file <path>', 'Dosyaya göre filtrele')
  .action(async (options) => {
    await showIntentLog(options.file);
  });

// Show intent statistics
program
  .command('stats')
  .description('İstatistikler')
  .option('--team', 'Takım performansı')
  .action(async (options) => {
    await showIntentStats(options);
  });

// Explain a commit
program
  .command('explain <commit-hash>')
  .description('Commit\'i açıkla')
  .action(async (commitHash) => {
    await explainCommit(commitHash);
  });

// Install Git hooks
program
  .command('install-hooks')
  .description('Git hooks kur')
  .action(async () => {
    await installHooks();
  });

// Uninstall Git hooks
program
  .command('uninstall-hooks')
  .description('Git hooks kaldır')
  .action(async () => {
    await uninstallHooks();
  });

// Suggest intent
program
  .command('suggest')
  .description('Değişikliklere göre niyet öner')
  .action(async () => {
    await suggestIntent();
  });

// Intent branching
program
  .command('branch <intent-message>')
  .description('Intent ile branch oluştur')
  .action(async (intentMessage) => {
    const { createIntentBranch } = require('../src/branching');
    const intent = await captureIntent(intentMessage);
    await createIntentBranch(intentMessage, intent.id);
  });

// Edit intent
program
  .command('edit <new-message>')
  .description('Mevcut niyeti düzenle')
  .option('-r, --reason <reason>', 'Düzenleme sebebi')
  .action(async (newMessage, options) => {
    const { editIntent } = require('../src/capture');
    await editIntent(newMessage, options.reason);
  });

// Undo intent
program  
  .command('undo')
  .description('Son niyeti geri al')
  .action(async () => {
    const { undoIntent } = require('../src/capture');
    await undoIntent();
  });

// History
program
  .command('history')
  .description('Niyet düzenleme geçmişi')
  .action(async () => {
    const { displayIntentHistory } = require('../src/capture');
    displayIntentHistory();
  });

// List branches
program
  .command('branches')
  .description('Intent branch\'lerini listele')
  .action(async () => {
    const { listIntentBranches } = require('../src/branching');
    await listIntentBranches();
  });

program.parse();
