module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  testPathIgnorePatterns: ['/node_modules/', '/_site/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jsdom|parse5)/)'
  ]
};
