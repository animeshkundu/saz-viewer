# SAZ Viewer - Testing Documentation

This document provides comprehensive information about the testing infrastructure for the SAZ Viewer application.

## Overview

The SAZ Viewer has comprehensive test coverage with **two types of tests**:

### 1. Unit Tests (Vitest)
Testing individual functions, utilities, and React components:
- **Unit Tests**: Testing individual functions and utilities
- **Component Tests**: Testing React components in isolation
- **Integration Tests**: Testing complete user flows in the application

### 2. E2E Tests (Playwright)
Testing complete end-to-end user workflows in a real browser:
- **File Upload**: Drag-drop and file picker interactions
- **Session Navigation**: Browsing and selecting sessions
- **Inspector**: Viewing request/response details
- **UI Interactions**: Search, filter, keyboard shortcuts

**Coverage Target**: **90%+ coverage for BOTH unit tests and E2E tests** across all metrics (lines, functions, branches, statements)

## Test Stack

### Unit Testing
- **Test Runner**: [Vitest](https://vitest.dev/) - Fast, Vite-native test runner
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) - React component testing utilities
- **Coverage Provider**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - V8 coverage provider
- **Mocking**: Vitest's built-in mocking capabilities

### E2E Testing
- **Test Framework**: [Playwright](https://playwright.dev/) - Modern E2E testing framework
- **Browser Support**: Chromium (Chrome/Edge), with Firefox and WebKit available
- **Features**: Screenshots, video recording, trace viewer, parallel execution

## Running Tests

### Unit Tests

#### Run all unit tests in watch mode
```bash
npm test
```

#### Run unit tests once (CI mode)
```bash
npm run test:run
```

#### Run unit tests with UI
```bash
npm run test:ui
```

#### Generate unit test coverage report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- `coverage/coverage-final.json` - JSON format

### E2E Tests

#### Run E2E tests (headless)
```bash
npm run e2e
```

#### Run E2E tests with UI mode
```bash
npm run e2e:ui
```

#### Run E2E tests with visible browser
```bash
npm run e2e:headed
```

#### Debug E2E tests
```bash
npm run e2e:debug
```

#### View E2E test report
```bash
npm run e2e:report
```

E2E test artifacts are generated in the `test-results/` and `playwright-report/` directories:
- Screenshots on failure
- Videos on failure
- Trace files for debugging
- HTML test report

## Test Structure

### Unit Test Structure

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

### E2E Test Structure

```
e2e/
├── fixtures/
│   └── sample.saz                  # Test SAZ file for E2E tests
├── helpers/
│   └── test-utils.ts               # Shared E2E test utilities
├── file-upload.spec.ts             # File upload E2E tests
├── session-navigation.spec.ts      # Session browsing E2E tests
├── inspector.spec.ts               # Inspector panel E2E tests
└── ui-interactions.spec.ts         # UI interaction E2E tests
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

### 4. E2E Tests (Playwright)

#### File Upload (`file-upload.spec.ts`)
Tests end-to-end file upload workflows:
- ✅ Drag and drop SAZ file
- ✅ File picker selection
- ✅ Valid SAZ file parsing
- ✅ Invalid file rejection
- ✅ Loading states
- ✅ Error messages

#### Session Navigation (`session-navigation.spec.ts`)
Tests browsing and selecting sessions:
- ✅ Session list display
- ✅ Session selection via click
- ✅ Keyboard navigation (arrow keys)
- ✅ Session details update
- ✅ Active session highlighting
- ✅ Search and filter
- ✅ Sorting functionality

#### Inspector Panel (`inspector.spec.ts`)
Tests request/response inspection:
- ✅ Headers tab display
- ✅ Raw tab display
- ✅ JSON tab with syntax highlighting
- ✅ XML tab display
- ✅ Hex view for binary content
- ✅ Tab switching
- ✅ Status code display
- ✅ Content size display

#### UI Interactions (`ui-interactions.spec.ts`)
Tests general UI interactions:
- ✅ Search functionality
- ✅ Method filtering
- ✅ Column sorting
- ✅ Keyboard shortcuts
- ✅ Load new file button
- ✅ Panel resizing
- ✅ Responsive design

## Coverage Thresholds

The project enforces minimum coverage thresholds for **BOTH unit and E2E tests**:

### Unit Test Coverage (Vitest)
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

### E2E Test Coverage (Playwright)
E2E tests target **90%+ coverage** of user workflows and critical paths:
- All file upload scenarios
- All session navigation paths
- All inspector views and tabs
- All UI interactions and filters
- Error states and edge cases

Builds will fail if unit test coverage drops below 90% in any category. E2E test coverage is monitored to ensure comprehensive user workflow testing.

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

The GitHub Actions workflow runs **both unit and E2E tests**:

### Unit Tests
1. Installs dependencies
2. Runs `npm run test:run`
3. Generates coverage report
4. Uploads coverage to artifacts
5. Fails if coverage is below 90% thresholds

### E2E Tests
1. Installs dependencies
2. Installs Playwright browsers
3. Runs `npm run e2e`
4. Captures screenshots and videos on failure
5. Uploads test results and artifacts
6. Generates HTML test report

## Debugging Tests

### Unit Tests

#### Run a single test file
```bash
npm test -- http-parser.test.ts
```

#### Run tests matching a pattern
```bash
npm test -- -t "should parse"
```

#### Debug in VS Code
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

#### View coverage details
After running `npm run test:coverage`, open `coverage/index.html` in a browser to see:
- Line-by-line coverage
- Uncovered branches
- Function coverage details

### E2E Tests

#### Run a single E2E test file
```bash
npm run e2e -- file-upload.spec.ts
```

#### Run E2E tests matching a pattern
```bash
npm run e2e -- -g "should upload"
```

#### Debug E2E test with Playwright Inspector
```bash
npm run e2e:debug
```

#### View E2E test traces
After a test failure, view the trace file:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

#### View E2E test report
```bash
npm run e2e:report
```

The report includes:
- Test results and timing
- Screenshots on failure
- Videos on failure
- Detailed error messages

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
- [x] ~~E2E tests with Playwright~~ ✅ **COMPLETED**
- [ ] Performance benchmarks
- [ ] Accessibility tests (axe-core integration)
- [ ] Snapshot tests for complex UI states
- [ ] Cross-browser E2E testing (Firefox, WebKit)
- [ ] Mobile device E2E testing
