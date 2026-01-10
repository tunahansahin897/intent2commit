const fs = require('fs');
const path = require('path');

/**
 * Configuration management for Intent2Commit
 * Allows teams to customize rules and thresholds
 */

const DEFAULT_CONFIG = {
  rules: {
    minAlignment: 50,
    maxFiles: 8,
    maxLines: 500,
    maxFilesForBugfix: 5
  },
  penalties: {
    'performance+logging': 10,
    'performance+async': 15,
    'security+noValidation': 10,
    'bugfix+manyFiles': 5,
    'largeScopeNonFeature': 10,
    'tooManyFiles': 20
  },
  ignore: [
    '*.test.js',
    '*.spec.js',
    '__tests__/**',
    'test/**',
    '*.md'
  ],
  display: {
    showBreakdown: true,
    showSuggestions: true,
    verboseWarnings: true
  }
};

/**
 * Load configuration from .intent2commit.json if exists
 * @returns {Object} Merged configuration
 */
function loadConfig() {
  const configPath = path.join(process.cwd(), '.intent2commit.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Deep merge with defaults
      return {
        rules: { ...DEFAULT_CONFIG.rules, ...(userConfig.rules || {}) },
        penalties: { ...DEFAULT_CONFIG.penalties, ...(userConfig.penalties || {}) },
        ignore: userConfig.ignore || DEFAULT_CONFIG.ignore,
        display: { ...DEFAULT_CONFIG.display, ...(userConfig.display || {}) }
      };
    } catch (error) {
      console.warn('Warning: Could not parse .intent2commit.json, using defaults');
      return DEFAULT_CONFIG;
    }
  }
  
  return DEFAULT_CONFIG;
}

/**
 * Check if file should be ignored based on config
 * @param {string} filename - File to check
 * @param {Object} config - Configuration object
 * @returns {boolean} True if file should be ignored
 */
function shouldIgnoreFile(filename, config) {
  const ignorePatterns = config.ignore || DEFAULT_CONFIG.ignore;
  
  return ignorePatterns.some(pattern => {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    return new RegExp(regexPattern).test(filename);
  });
}

/**
 * Get penalty value for specific rule
 * @param {string} ruleKey - Rule identifier (e.g., 'performance+logging')
 * @param {Object} config - Configuration object
 * @returns {number} Penalty value
 */
function getPenalty(ruleKey, config) {
  return (config.penalties && config.penalties[ruleKey]) || 
         DEFAULT_CONFIG.penalties[ruleKey] || 
         0;
}

/**
 * Create example config file
 * @param {string} outputPath - Where to create the file
 */
function createExampleConfig(outputPath = '.intent2commit.example.json') {
  const exampleConfig = {
    ...DEFAULT_CONFIG,
    _comments: {
      rules: "Customize alignment thresholds and limits",
      penalties: "Adjust penalty values for specific patterns",
      ignore: "Files to exclude from analysis (glob patterns)",
      display: "Control what information is shown"
    }
  };
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(exampleConfig, null, 2),
    'utf8'
  );
}

module.exports = {
  loadConfig,
  shouldIgnoreFile,
  getPenalty,
  createExampleConfig,
  DEFAULT_CONFIG
};
