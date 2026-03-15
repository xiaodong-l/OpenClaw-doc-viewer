import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/config/*.js'],
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 10000,
    setupFiles: ['./tests/setup.js'],
    reporters: ['verbose'],
    outputFile: {
      junit: './tests/results/junit.xml',
      json: './tests/results/results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
