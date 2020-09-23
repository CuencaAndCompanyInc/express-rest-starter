module.exports = {
  bail: 1,
  testEnvironment: 'node',
  verbose: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testTimeout: 30000,
};
