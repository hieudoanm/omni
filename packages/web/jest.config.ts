import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  displayName: 'web',
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!\\.pnpm|@codemirror|@lezer|marked|dompurify|d3-force|d3-dispatch|d3-quadtree|d3-timer)/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lodashx/ts$': '<rootDir>/src/lib/lodashx/index.ts',
    '^@/lib/office/keynotes/idb$': '<rootDir>/src/lib/office/keynotes/__mocks__/idb.ts',
  },
};

export default createJestConfig(config);
