import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/app/author/(.*)$': '<rootDir>/src/app/(bookman)/author/$1',
    '^@/app/book/(.*)$': '<rootDir>/src/app/(bookman)/book/$1',
    '^@/app/branch/(.*)$': '<rootDir>/src/app/(bookman)/branch/$1',
    '^@/app/category/(.*)$': '<rootDir>/src/app/(bookman)/category/$1',
    '^@/app/customer/(.*)$': '<rootDir>/src/app/(bookman)/customer/$1',
    '^@/app/dashboard/(.*)$': '<rootDir>/src/app/(bookman)/dashboard/$1',
    '^@/app/lending/(.*)$': '<rootDir>/src/app/(bookman)/lending/$1',
    '^@/app/reservation/(.*)$': '<rootDir>/src/app/(bookman)/reservation/$1',
    '^@/app/staff/(.*)$': '<rootDir>/src/app/(bookman)/staff/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
