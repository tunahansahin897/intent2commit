const chalk = require('chalk');

/**
 * Intent templates for common development scenarios
 */

const templates = {
  performance: {
    name: 'Performance Optimization',
    prompts: [
      { question: 'What metric are you optimizing?', key: 'metric' },
      { question: 'Target improvement (%)?', key: 'target' },
      { question: 'Approach/method?', key: 'approach' }
    ],
    generate: (answers) => 
      `reduce ${answers.metric} by ${answers.target}% via ${answers.approach}`
  },

  security: {
    name: 'Security Enhancement',
    prompts: [
      { question: 'Security concern being addressed?', key: 'concern' },
      { question: 'Mitigation approach?', key: 'mitigation' }
    ],
    generate: (answers) =>
      `fix ${answers.concern} vulnerability by ${answers.mitigation}`
  },

  feature: {
    name: 'Feature Implementation',
    prompts: [
      { question: 'Feature name?', key: 'feature' },
      { question: 'User benefit?', key: 'benefit' }
    ],
    generate: (answers) =>
      `add ${answers.feature} to ${answers.benefit}`
  },

  bugfix: {
    name: 'Bug Fix',
    prompts: [
      { question: 'Bug description?', key: 'bug' },
      { question: 'Root cause?', key: 'cause' }
    ],
    generate: (answers) =>
      `fix ${answers.bug} caused by ${answers.cause}`
  },

  refactor: {
    name: 'Code Refactoring',
    prompts: [
      { question: 'What are you refactoring?', key: 'target' },
      { question: 'Why (improve what)?', key: 'reason' }
    ],
    generate: (answers) =>
      `refactor ${answers.target} to improve ${answers.reason}`
  },

  cleanup: {
    name: 'Code Cleanup',
    prompts: [
      { question: 'What are you cleaning up?', key: 'target' }
    ],
    generate: (answers) =>
      `remove unused ${answers.target}`
  },

  // NEW Templates v2
  docs: {
    name: 'Documentation',
    prompts: [
      { question: 'What are you documenting?', key: 'target' },
      { question: 'Why is this documentation needed?', key: 'reason' }
    ],
    generate: (answers) =>
      `document ${answers.target} for ${answers.reason}`
  },

  test: {
    name: 'Add Tests',
    prompts: [
      { question: 'What are you testing?', key: 'target' },
      { question: 'Test type (unit/integration/e2e)?', key: 'type' }
    ],
    generate: (answers) =>
      `add ${answers.type} tests for ${answers.target}`
  },

  hotfix: {
    name: 'Hotfix (Production)',
    prompts: [
      { question: 'Critical issue description?', key: 'issue' },
      { question: 'Immediate fix approach?', key: 'fix' }
    ],
    generate: (answers) =>
      `HOTFIX: ${answers.issue} - ${answers.fix}`
  },

  dependency: {
    name: 'Dependency Update',
    prompts: [
      { question: 'Package name?', key: 'package' },
      { question: 'Update reason (security/feature/bugfix)?', key: 'reason' }
    ],
    generate: (answers) =>
      `update ${answers.package} for ${answers.reason}`
  },

  migration: {
    name: 'Data/Code Migration',
    prompts: [
      { question: 'What are you migrating from?', key: 'from' },
      { question: 'What are you migrating to?', key: 'to' },
      { question: 'Migration reason?', key: 'reason' }
    ],
    generate: (answers) =>
      `migrate ${answers.from} to ${answers.to} for ${answers.reason}`
  },

  experiment: {
    name: 'Experimental Feature',
    prompts: [
      { question: 'Experiment name?', key: 'name' },
      { question: 'Hypothesis being tested?', key: 'hypothesis' }
    ],
    generate: (answers) =>
      `EXPERIMENT: ${answers.name} - testing ${answers.hypothesis}`
  }
};


/**
 * Lists available intent templates
 */
function listTemplates() {
  console.log(chalk.bold('\nAvailable Intent Templates:\n'));
  
  Object.entries(templates).forEach(([key, template]) => {
    console.log(chalk.cyan(`  ${key.padEnd(15)}`), chalk.gray(template.name));
  });
  
  console.log();
  console.log(chalk.gray('Usage: intent --template <name>'));
  console.log();
}

/**
 * Gets a specific template
 * @param {string} templateName - Template key
 * @returns {Object|null} Template object or null
 */
function getTemplate(templateName) {
  return templates[templateName] || null;
}

/**
 * Create a custom template
 * @param {string} name - Template name
 * @param {Array} prompts - Array of prompt objects
 * @param {Function|string} generator - Generator function or template string
 */
function createCustomTemplate(name, prompts, generator) {
  const fs = require('fs');
  const path = require('path');
  
  // Custom templates directory
  const customDir = path.join(process.cwd(), '.intent-cache', 'templates');
  
  if (!fs.existsSync(customDir)) {
    fs.mkdirSync(customDir, { recursive: true });
  }
  
  const template = {
    name,
    prompts,
    generate: typeof generator === 'function' 
      ? generator.toString() 
      : `(answers) => \`${generator}\``
  };
  
  const templateFile = path.join(customDir, `${name.toLowerCase().replace(/\s+/g, '-')}.json`);
  fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));
  
  console.log(chalk.green(`✓ Custom template '${name}' created`));
  console.log(chalk.gray(`  Saved to: ${templateFile}`));
  
  return template;
}

/**
 * Load custom templates
 * @returns {Object} Custom templates object
 */
function loadCustomTemplates() {
  const fs = require('fs');
  const path = require('path');
  
  const customDir = path.join(process.cwd(), '.intent-cache', 'templates');
  
  if (!fs.existsSync(customDir)) {
    return {};
  }
  
  const customTemplates = {};
  const files = fs.readdirSync(customDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    try {
      const templateData = JSON.parse(fs.readFileSync(path.join(customDir, file), 'utf8'));
      const key = file.replace('.json', '');
      
      // Reconstruct the generator function
      if (typeof templateData.generate === 'string') {
        // eslint-disable-next-line no-eval
        templateData.generate = eval(templateData.generate);
      }
      
      customTemplates[key] = templateData;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to load template ${file}`));
    }
  });
  
  return customTemplates;
}

/**
 * Get all templates (built-in + custom)
 */
function getAllTemplates() {
  const custom = loadCustomTemplates();
  return { ...templates, ...custom };
}

/**
 * Export template to file
 * @param {string} templateName - Template to export
 * @param {string} outputPath - Export path
 */
function exportTemplate(templateName, outputPath) {
  const fs = require('fs');
  const template = getAllTemplates()[templateName];
  
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }
  
  const exportData = {
    name: template.name,
    prompts: template.prompts,
    generate: template.generate.toString()
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(chalk.green(`✓ Template exported to ${outputPath}`));
}

/**
 * Import template from file
 * @param {string} filePath - Template file path
 */
function importTemplate(filePath) {
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const templateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Validate structure
  if (!templateData.name || !templateData.prompts || !templateData.generate) {
    throw new Error('Invalid template format');
  }
  
  const key = path.basename(filePath, '.json');
  
  // eslint-disable-next-line no-eval
  const generator = typeof templateData.generate === 'string' 
    ? eval(templateData.generate) 
    : templateData.generate;
  
  return createCustomTemplate(templateData.name, templateData.prompts, generator);
}

module.exports = {
  listTemplates,
  getTemplate,
  templates,
  createCustomTemplate,
  loadCustomTemplates,
  getAllTemplates,
  exportTemplate,
  importTemplate
};
