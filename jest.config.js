module.exports = {
  roots: ['src/'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts?(x)', '!**/*.d.ts'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
};
