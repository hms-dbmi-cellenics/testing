module.exports = {
  env: {
    'cypress/globals': true,
    browser: true,
    commonjs: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    'plugin:cypress/recommended',
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
  },
  plugins: [
    'cypress',
  ],
};
