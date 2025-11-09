# SAZ Viewer - Testing Documentation

This document provides comprehensive information about the testing infrastructure for the SAZ Viewer application.

## Overview

The SAZ Viewer has comprehensive test coverage including:
- **Unit Tests**: Testing individual functions and utilities
- **Component Tests**: Testing React components in isolation
- **Integration Tests**: Testing complete user flows

**Coverage Target**: 90%+ coverage across all metrics (lines, functions, branches, statements)

## Test Stack

- **Test Runner**: [Vitest](https://vitest.dev/) - Fast, Vite-native test runner
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) - React component testing utilities
- **Coverage Provider**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - V8 coverage provider
- **Mocking**: Vitest's built-in mocking capabilities

## Running Tests

### Run all tests in watch mode
```bash
npm test
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- `coverage/coverage-final.json` - JSON format

## Test Structure

```
src/
├── test/
│   └── setup.ts                    # Global test setup
├── lib/
│   ├── http-parser.test.ts         # HTTP parser unit tests
│   ├── saz-parser.test.ts          # SAZ parser unit tests
│   ├── syntax-util.test.ts         # Syntax highlighting tests
│   └── utils.test.ts               # Utility function tests
├── components/
│   ├── FileDropZone.test.tsx       # File drop component tests
│   ├── SessionGrid.test.tsx        # Session grid component tests
│   ├── InspectorPanel.test.tsx     # Inspector panel tests
│   └── KeyboardShortcuts.test.tsx  # Keyboard shortcuts tests
└── App.test.tsx                    # Integration tests
```

## Test Categories

### 1. Unit Tests

#### HTTP Parser (`http-parser.test.ts`)
Tests the HTTP request/response parsing logic:
- ✅ Request parsing (GET, POST, PUT, DELETE, PATCH, CONNECT)
- ✅ Response parsing (various status codes)
- ✅ Header parsing and normalization
- ✅ Body handling (text and binary)
- ✅ Edge cases (malformed data, empty bodies, etc.)

#### SAZ Parser (`saz-parser.test.ts`)
Tests the SAZ archive parsing:
- ✅ Valid SAZ file parsing
- ✅ Multiple session handling
- ✅ Session ordering (numeric sort)
- ✅ Incomplete session handling
- ✅ Invalid archive detection
- ✅ URL construction with host headers
- ✅ Binary content handling

#### Syntax Utilities (`syntax-util.test.ts`)
Tests syntax highlighting and hex view rendering:
- ✅ JSON syntax highlighting
- ✅ XML syntax highlighting
- ✅ Hex dump generation
- ✅ ASCII representation
- ✅ Large buffer handling

#### Utils (`utils.test.ts`)
Tests the `cn()` class name utility:
- ✅ Class merging
- ✅ Conditional classes
- ✅ Tailwind class conflict resolution
- ✅ Multiple input types (arrays, objects, strings)

### 2. Component Tests

#### FileDropZone (`FileDropZone.test.tsx`)
Tests the file upload interface:
- ✅ Initial render state
- ✅ Loading state
- ✅ Error display
- ✅ File selection via button
- ✅ Drag and drop functionality
- ✅ File validation

#### SessionGrid (`SessionGrid.test.tsx`)
Tests the session list/grid:
- ✅ Session rendering
- ✅ Session selection
- ✅ Active session highlighting
- ✅ Search/filter functionality
- ✅ Sorting (by ID, status, method, URL)
- ✅ Method filtering
- ✅ Status code coloring
- ✅ Empty state handling

#### InspectorPanel (`InspectorPanel.test.tsx`)
Tests the request/response inspector:
- ✅ Tab rendering (Headers, Raw, JSON, XML, Hex)
- ✅ Content-type based tab selection
- ✅ Header display
- ✅ Status code display and coloring
- ✅ Content size formatting
- ✅ Tab switching
- ✅ Empty content handling

#### KeyboardShortcuts (`KeyboardShortcuts.test.tsx`)
Tests keyboard navigation:
- ✅ Arrow up/down navigation
- ✅ Cmd/Ctrl+O shortcut
- ✅ Event cleanup on unmount
- ✅ Handler updates

### 3. Integration Tests

#### App (`App.test.tsx`)
Tests complete user workflows:
- ✅ Initial file drop zone display
- ✅ File loading and parsing
- ✅ Error handling (invalid files, malformed SAZ)
- ✅ Session list display
- ✅ Default session selection
- ✅ Keyboard navigation between sessions
- ✅ "Load New File" functionality
- ✅ Panel layout rendering

## Coverage Thresholds

The project enforces minimum coverage thresholds:

```javascript
coverage: {
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 90,
    statements: 90,
  }
}
```

Builds will fail if coverage drops below 90% in any category.

## Excluded from Coverage

The following are excluded from coverage requirements:
- Type definition files (`*.d.ts`)
- Test files themselves (`*.test.ts`, `*.test.tsx`)
- Test setup (`src/test/**`)
- Main entry point (`src/main.tsx`)
- Vite environment types (`src/vite-env.d.ts`)
- UI component library (`src/components/ui/**`) - pre-built shadcn components

## Mocking Strategy

### Global Mocks (test/setup.ts)
- `ResizeObserver` - Required for Radix UI components
- `matchMedia` - Required for responsive components
- `TextEncoder/TextDecoder` - For binary data handling

### Component-Specific Mocks
- `sonner` (toast notifications) - Mocked in integration tests to avoid side effects

## Writing New Tests

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Utility tests: `utility-name.test.ts`
- Place test files adjacent to the code they test

### Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Best Practices
1. **Use descriptive test names**: "should display error when file is invalid"
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test user behavior**: Focus on what users see and do, not implementation details
4. **Use data-testid sparingly**: Prefer queries by role, text, or label
5. **Clean up**: Use `beforeEach`/`afterEach` for setup/teardown
6. **Mock external dependencies**: Keep tests isolated and fast
7. **Test edge cases**: Empty states, errors, boundary conditions

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployment

The GitHub Actions workflow:
1. Installs dependencies
2. Runs `npm run test:run`
3. Generates coverage report
4. Uploads coverage to artifacts
5. Fails if coverage is below thresholds

## Debugging Tests

### Run a single test file
```bash
npm test -- http-parser.test.ts
```

### Run tests matching a pattern
```bash
npm test -- -t "should parse"
```

### Debug in VS Code
Add a breakpoint and use the "Debug Test" option in the test file, or use this launch configuration:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### View coverage details
After running `npm run test:coverage`, open `coverage/index.html` in a browser to see:
- Line-by-line coverage
- Uncovered branches
- Function coverage details

## Common Issues

### "Cannot find module" errors
- Ensure `vitest.config.ts` has the correct path alias configuration
- Check that imports use `@/` prefix for src files

### "ResizeObserver is not defined"
- This is mocked in `test/setup.ts`
- Ensure setup file is configured in `vitest.config.ts`

### Tests timing out
- Increase timeout for async operations: `waitFor(() => {...}, { timeout: 5000 })`
- Check for unresolved promises

### Flaky tests
- Avoid time-dependent logic
- Use `waitFor` for async state changes
- Properly clean up event listeners and timers

## Future Enhancements

Potential testing improvements:
- [ ] Visual regression tests (e.g., with Percy or Chromatic)
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Accessibility tests (axe-core)
- [ ] Snapshot tests for complex UI states
