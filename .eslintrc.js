const main = require('./src')

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    'jest/globals': true
  },
  extends: [
    'standard',
    'plugin:jest/style'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
  },
  plugins: ['jest']
}
