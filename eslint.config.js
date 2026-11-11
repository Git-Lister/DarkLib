import js from '@eslint/js';

export default [
  {
    // Ignore build artifacts and generated files so lint only checks source.
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...js.configs.recommended.globals,
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        console: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      // Stub methods intentionally declare unused parameters for the interface
      // contract; bodies throw "not implemented" in Tranche 0.
      'no-unused-vars': ['error', { args: 'none' }]
    }
  },
  {
    files: ['test/**/*.test.js', 'test/**/*.spec.js'],
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        Response: 'readonly'
      }
    }
  }
];
