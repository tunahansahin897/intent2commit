const minimatch = require('minimatch');

/**
 * Get template expectations by name
 * @param {string} templateName - Template identif ier
 * @returns {Object|null} Template expectations
 */
function getTemplateExpectations(templateName) {
  // Import templates dynamically to avoid circular dependency
  const templates = {
    performance: {
      files: ['**/performance*', '**/cache*', '**/query*', '**/api*', '**/optimize*'],
      tests: 'required',
      risk: 'medium',
      changeTypes: ['optimization', 'caching', 'indexing']
    },
    security: {
      files: ['**/auth*', '**/middleware*', '**/security*', '**/crypto*', '**/validation*'],
      tests: 'required',
      risk: 'high',
      changeTypes: ['validation', 'sanitization', 'encryption']
    },
    feature: {
      files: ['**/routes*', '**/controllers*', '**/services*', '**/components*', '**/pages*'],
      tests: 'recommended',
      risk: 'medium',
      changeTypes: ['new-feature', 'api-endpoint', 'ui-component']
    },
    bugfix: {
      files: ['**/*'],
      tests: 'required',
      risk: 'low',
      changeTypes: ['bug-fix', 'edge-case', 'validation']
    },
    refactor: {
      files: ['**/*'],
      tests: 'optional',
      risk: 'low',
      changeTypes: ['refactor', 'cleanup', 'simplification']
    },
    cleanup: {
      files: ['**/*'],
      tests: 'optional',
      risk: 'low',
      changeTypes: ['removal', 'cleanup']
    },
    docs: {
      files: ['**/*.md', '**/docs/**', '**README*', '**/*.txt'],
      tests: 'optional',
      risk: 'low',
      changeTypes: ['documentation']
    },
    test: {
      files: ['**/test/**', '**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
      tests: 'required',
      risk: 'low',
      changeTypes: ['test-addition', 'test-fix']
    },
    hotfix: {
      files: ['**/*'],
      tests: 'required',
      risk: 'high',
      changeTypes: ['critical-fix', 'production-bug']
    },
    dependency: {
      files: ['**/package.json', '**/package-lock.json', '**/yarn.lock', '**/requirements.txt', '**/Gemfile*'],
      tests: 'recommended',
      risk: 'medium',
      changeTypes: ['dependency-update', 'security-patch']
    },
    migration: {
      files: ['**/migrations/**', '**/db/**', '**/schema*'],
      tests: 'required',
      risk: 'high',
      changeTypes: ['schema-change', 'data-migration']
    },
    experiment: {
      files: ['**/*'],
      tests: 'optional',
      risk: 'low',
      changeTypes: ['experiment', 'poc', 'prototype']
    }
  };

  return templates[templateName] || null;
}

module.exports = {
  getTemplateExpectations
};
