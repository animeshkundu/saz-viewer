import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test.ts,test.tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      exclude: [
        'src/components/ui/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/node_modules/**',
      ],
      thresholds: {
        lines: 80,
        functions: 70,
        branches: 75,
        statements: 80,
        perFile: true,
      },
    },
  },
})

