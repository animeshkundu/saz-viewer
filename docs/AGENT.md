# AI Agent Instructions for SAZ Viewer

## Project Overview

SAZ Viewer is a 100% client-side web application for inspecting Telerik Fiddler .saz files. The application prioritizes user privacy through client-side processing, professional developer tool aesthetics, and high code quality.

**Key Characteristics:**
- React 19 + TypeScript SPA
- Client-side only (no backend)
- Privacy-first architecture
- Professional debugging tool UX
- 90%+ test coverage requirement

## Essential Reading

Before making any changes, **ALWAYS** read these documents in order:

### 1. Start Here
- [`docs/README.md`](./README.md) - Documentation index
- [`docs/PRD.md`](./PRD.md) - Product requirements and features
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) - System architecture

### 2. For Code Changes
- [`docs/DESIGN.md`](./DESIGN.md) - UI/UX design specifications
- [`docs/APP_README.md`](./APP_README.md) - Implementation details
- [`docs/ADR/`](./ADR/) - Architectural decisions

### 3. For Testing
- [`docs/TESTING.md`](./TESTING.md) - Testing strategy and requirements

### 4. For Deployment
- [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) - Deployment process
- [`docs/SECURITY.md`](./SECURITY.md) - Security considerations

## Core Principles

These principles are **NON-NEGOTIABLE**:

### 1. Privacy First
- **NEVER** add code that transmits user data to any server
- **NEVER** add analytics, tracking, or telemetry
- All file processing must remain client-side
- Violating this principle is a critical security issue

### 2. Type Safety
- **ALWAYS** use TypeScript with strict mode
- **NEVER** use `any` type without explicit justification
- All data structures must have proper type definitions
- Props must be fully typed

### 3. Test Coverage
- **MAINTAIN** 90%+ code coverage at all times
- **WRITE** tests before or alongside code changes
- **RUN** tests after every change
- Coverage below 90% blocks deployment

### 4. Code Quality
- **FOLLOW** existing patterns and conventions
- **USE** ESLint rules without disabling them
- **WRITE** self-documenting code with TypeScript types
- Comments only when absolutely necessary

## Development Workflow

### For Every Change

Follow this workflow **WITHOUT EXCEPTION**:

```
1. Read relevant documentation (see Essential Reading)
2. Understand existing code patterns
3. Plan minimal changes
4. Write/update tests
5. Implement changes
6. Run linter: npm run lint
7. Run tests: npm run test:coverage
8. Verify 90%+ coverage maintained
9. Build: npm run build
10. Manual verification (if UI changes)
11. Update documentation (if needed)
12. Record ADR (if architectural decision)
```

### Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload

# Code Quality
npm run lint            # Run ESLint (must pass)
npm run lint --fix      # Auto-fix linting issues

# Testing
npm test                # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Generate coverage report (must be >90%)
npm run test:ui         # Visual test UI

# Build
npm run build           # TypeScript compile + Vite build (must succeed)
npm run preview         # Preview production build

# Type Checking
npx tsc --noEmit       # Type check without build
```

## Testing Requirements

### Coverage Thresholds (NON-NEGOTIABLE)

```json
{
  "lines": 90,
  "functions": 90,
  "branches": 90,
  "statements": 90
}
```

### Test Types Required

**1. Unit Tests**
- Test individual functions and utilities
- Mock external dependencies
- Fast execution (<1ms per test)
- Example: `sazParser.test.ts`, `httpParser.test.ts`

**2. Component Tests**
- Test React components in isolation
- Use Testing Library patterns
- Test user interactions
- Example: `SessionGrid.test.tsx`, `Inspector.test.tsx`

**3. Integration Tests**
- Test feature workflows end-to-end
- Test component interactions
- Use realistic data
- Example: `App.test.tsx`

### Test Writing Guidelines

```typescript
// ✅ GOOD: Descriptive, tests behavior
describe('SessionGrid', () => {
  it('highlights selected session with accent background', () => {
    render(<SessionGrid sessions={mockSessions} selectedId={1} />);
    const row = screen.getByRole('row', { name: /session 1/i });
    expect(row).toHaveClass('bg-accent/15');
  });
});

// ❌ BAD: Implementation detail, unclear purpose
describe('SessionGrid', () => {
  it('sets state correctly', () => {
    // Testing implementation instead of behavior
  });
});
```

**Test Naming:**
- Use: `it('does something when condition')`
- Avoid: `it('test 1')` or `it('works')`

**Assertions:**
- Use Testing Library queries (`getByRole`, `getByLabelText`)
- Avoid: `getByClassName` or `getByTestId` unless necessary
- Test accessibility: components should be findable by role/label

### Running Tests

```bash
# During development
npm test                    # Watch mode, fast feedback

# Before commit
npm run test:coverage       # Verify coverage >90%

# Check specific file
npm test -- SessionGrid     # Run tests matching "SessionGrid"
```

## Code Patterns & Conventions

### File Organization

```
src/
├── components/           # React components
│   ├── [Component].tsx
│   └── [Component].test.tsx
├── hooks/               # Custom React hooks
│   ├── use[Hook].ts
│   └── use[Hook].test.ts
├── lib/                 # Utilities and business logic
│   ├── [utility].ts
│   └── [utility].test.ts
├── types/               # TypeScript type definitions
│   └── [domain]Types.ts
├── ui/                  # shadcn/ui components
│   └── [component].tsx
└── App.tsx              # Root component
```

### Component Patterns

**Functional Components with TypeScript:**

```typescript
// ✅ GOOD: Full typing, clear props
interface SessionGridProps {
  sessions: SazSession[];
  selectedId?: number;
  onSelectSession: (id: number) => void;
}

export function SessionGrid({ 
  sessions, 
  selectedId, 
  onSelectSession 
}: SessionGridProps) {
  // Component implementation
}

// ❌ BAD: No types, any usage
export function SessionGrid(props: any) {
  // Don't do this
}
```

**Custom Hooks:**

```typescript
// ✅ GOOD: Single responsibility, typed
export function useSazParser() {
  const [sessions, setSessions] = useState<SazSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const parseFile = async (file: File) => {
    // Implementation
  };

  return { sessions, loading, error, parseFile };
}
```

### State Management

**Use React built-in state:**
- `useState` for component state
- `useReducer` for complex state logic
- Lift state up for sharing between components
- **NO** global state libraries (Redux, Zustand) unless absolutely necessary

**Data Flow:**
```
App.tsx (owns session data)
  ↓ (props)
SessionGrid + Inspector (receive data)
  ↓ (callbacks)
App.tsx (updates state)
```

### Error Handling

```typescript
// ✅ GOOD: Specific errors, user-friendly messages
try {
  const zip = await JSZip.loadAsync(file);
  const rawFolder = zip.folder('raw');
  
  if (!rawFolder) {
    throw new Error('Invalid SAZ Structure. File must contain a "raw/" folder.');
  }
} catch (error) {
  if (error instanceof Error) {
    setError(error);
  } else {
    setError(new Error('Failed to parse .saz file'));
  }
}

// ❌ BAD: Silent failures, generic errors
try {
  // something
} catch (e) {
  console.log(e); // Don't just log
}
```

### Async Operations

```typescript
// ✅ GOOD: Loading states, error handling
async function loadSazFile(file: File) {
  setLoading(true);
  setError(null);
  
  try {
    const sessions = await parseSazFile(file);
    setSessions(sessions);
  } catch (error) {
    setError(error instanceof Error ? error : new Error('Parse failed'));
  } finally {
    setLoading(false);
  }
}
```

## Styling Conventions

### Use Tailwind CSS

```typescript
// ✅ GOOD: Tailwind utility classes
<div className="flex items-center gap-4 px-6 py-2.5 bg-card border-b">
  <h1 className="text-xl font-semibold">SAZ Viewer</h1>
</div>

// ❌ BAD: Inline styles
<div style={{ display: 'flex', padding: '10px' }}>
  <h1 style={{ fontSize: '20px' }}>SAZ Viewer</h1>
</div>
```

### Design Tokens

Use consistent spacing and colors:

```typescript
// Spacing (4px base unit)
className="p-4 gap-3 mt-2"  // 16px, 12px, 8px

// Colors
className="bg-background text-foreground"  // Base colors
className="bg-accent text-accent-foreground"  // Interactive
className="text-muted-foreground"  // Secondary text
```

### Component Classes

```typescript
// Use clsx or cn helper for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "px-3 py-2.5 hover:bg-muted/40",
  isSelected && "bg-accent/15 border-l-2 border-accent"
)}>
```

## Documentation Requirements

### Code Documentation

**Components:**
```typescript
/**
 * Displays HTTP session data in a sortable, filterable table.
 * 
 * Features:
 * - Search filtering across all columns
 * - Multi-select method filtering
 * - Sortable columns with direction indicators
 * - Keyboard navigation
 */
export function SessionGrid({ sessions, selectedId, onSelectSession }: SessionGridProps) {
```

**Complex Logic:**
```typescript
/**
 * Detects content type from HTTP headers and body.
 * Falls back to body inspection if Content-Type header missing.
 * 
 * @param headers - HTTP headers object
 * @param body - Response body (string or binary)
 * @returns Content type: 'json' | 'xml' | 'text' | 'binary'
 */
export function detectContentType(
  headers: Record<string, string>,
  body: string | ArrayBuffer
): ContentType {
```

### When to Create ADR

Create an Architectural Decision Record for:

1. **Technology Choices**
   - Adding new major dependency
   - Replacing existing library
   - Choosing between alternatives

2. **Architectural Changes**
   - Changing state management approach
   - Adding new major feature (e.g., export, comparison)
   - Modifying client-side guarantee

3. **Breaking Changes**
   - Removing features
   - Changing data structures
   - API modifications

**ADR Process:**
1. Copy `docs/ADR/ADR-TEMPLATE.md`
2. Name: `ADR-XXXX-short-title.md` (increment number)
3. Fill in all sections thoroughly
4. Update `docs/ADR/README.md` index
5. Reference ADR in code comments where relevant

### When to Update History

Document in `docs/history/` when:

1. **Removing Features**
   - Explain why and what replaces it
   - Provide migration guidance

2. **Deprecating APIs**
   - Timeline for removal
   - Alternative approaches

3. **Failed Experiments**
   - What was tried and why it failed
   - Lessons learned

**History Process:**
1. Create `docs/history/YYYY-MM-DD-feature-name.md`
2. Follow structure in `docs/history/README.md`
3. Link from relevant documentation

## Security Guidelines

### Critical Rules

1. **No Server Calls with User Data**
   ```typescript
   // ❌ FORBIDDEN: Never send user data to servers
   fetch('https://api.example.com/parse', {
     body: JSON.stringify(userData)
   });
   
   // ✅ ALLOWED: External resources (CDN, fonts)
   <script src="https://cdn.example.com/highlight.js">
   ```

2. **Content Sanitization**
   ```typescript
   // ✅ GOOD: React automatically escapes
   <div>{session.url}</div>
   
   // ❌ BAD: dangerouslySetInnerHTML without sanitization
   <div dangerouslySetInnerHTML={{ __html: unsafeContent }} />
   ```

3. **Dependency Security**
   - Review dependencies before adding
   - Run `npm audit` regularly
   - Update dependencies promptly
   - Never disable security warnings

### Security Checklist

Before merging:
- [ ] No new network requests with user data
- [ ] No new dependencies without review
- [ ] Content properly sanitized
- [ ] No eval() or Function() usage
- [ ] No localStorage of sensitive data

## Common Tasks

### Adding a New Feature

1. **Read Documentation**
   - PRD: Does this align with product vision?
   - Architecture: How does it fit?
   - Design: What should it look like?

2. **Plan Changes**
   - Identify affected components
   - Design data flow
   - Consider edge cases

3. **Write Tests First** (TDD approach)
   ```typescript
   describe('NewFeature', () => {
     it('should do expected behavior', () => {
       // Write test before implementation
     });
   });
   ```

4. **Implement Minimally**
   - Add only necessary code
   - Follow existing patterns
   - Keep it simple

5. **Verify Quality**
   ```bash
   npm run lint
   npm run test:coverage  # Must stay >90%
   npm run build
   ```

6. **Update Documentation**
   - ADR if architectural decision
   - README if user-facing
   - Code comments if complex

### Fixing a Bug

1. **Write Failing Test**
   ```typescript
   it('should handle empty session list', () => {
     render(<SessionGrid sessions={[]} />);
     expect(screen.getByText(/no sessions/i)).toBeInTheDocument();
   });
   ```

2. **Fix Bug**
   - Minimal change to pass test
   - Don't over-engineer

3. **Verify**
   ```bash
   npm run test:coverage
   npm run build
   ```

### Adding a Dependency

1. **Check if Necessary**
   - Can it be implemented in a few lines?
   - Is there already a similar dependency?

2. **Research Options**
   - Bundle size impact
   - Active maintenance
   - License compatibility
   - Security track record

3. **Document Decision**
   - Create ADR for major dependencies
   - Note reasoning in commit message

4. **Install and Test**
   ```bash
   npm install <package>
   npm run test:coverage
   npm run build
   npm audit  # Check for vulnerabilities
   ```

### Refactoring

1. **Ensure Test Coverage**
   - Tests must cover refactored code
   - Add tests if coverage insufficient

2. **Refactor Incrementally**
   - Small, testable changes
   - Run tests after each change
   - Keep tests passing

3. **Verify No Behavior Change**
   ```bash
   npm run test:coverage  # All tests pass
   npm run build          # Still builds
   ```

## Troubleshooting

### TypeScript Errors

```bash
# Check types without building
npx tsc --noEmit

# Common issues:
# - Missing type definitions: npm i -D @types/<package>
# - Strict mode errors: Fix don't disable
# - Any usage: Add proper types
```

### Test Failures

```bash
# Run specific test file
npm test -- SessionGrid

# Debug test in UI
npm run test:ui

# Common issues:
# - Async not awaited: use waitFor, findBy queries
# - Missing mock: Add proper mocks for dependencies
# - Flaky tests: Avoid timers, use fake timers
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Common issues:
# - Import errors: Check file paths
# - Missing types: Ensure all deps typed
# - Vite config: Check base path
```

### Coverage Below 90%

```bash
# Identify uncovered code
npm run test:coverage
# Opens coverage/index.html

# Add tests for:
# - Untested functions
# - Uncovered branches (if/else)
# - Edge cases
```

## Quality Gates

All of these must pass before code is complete:

```bash
✅ npm run lint          # No linting errors
✅ npm run test:coverage # >90% coverage
✅ npm run build         # Successful build
✅ Manual verification   # UI works as expected
✅ Documentation updated # If needed
✅ ADR created          # If architectural decision
```

## Anti-Patterns to Avoid

### Code Anti-Patterns

```typescript
// ❌ Any type
function process(data: any) { }

// ❌ Non-null assertion without validation
const value = data!.property!.value;

// ❌ Disabling ESLint
// eslint-disable-next-line

// ❌ Empty catch blocks
try { } catch (e) { }

// ❌ God components (>300 lines)
function MassiveComponent() { /* 500 lines */ }

// ❌ Prop drilling >3 levels deep
<A><B><C><D data={data} /></C></B></A>
```

### Testing Anti-Patterns

```typescript
// ❌ Testing implementation details
expect(component.state.value).toBe(5);

// ❌ Snapshot testing without review
expect(wrapper).toMatchSnapshot();

// ❌ No assertions
it('renders', () => {
  render(<Component />);
  // Missing expect()
});

// ❌ Testing multiple things
it('loads data, filters it, sorts it, and displays it', () => {
  // Split into separate tests
});
```

## Getting Help

### Internal Resources

1. **Documentation** (`docs/` folder)
   - Start here for context

2. **Existing Code**
   - Look for similar patterns
   - Follow established conventions

3. **Tests**
   - Examples of usage
   - Edge cases handled

### External Resources

1. **React Documentation**: https://react.dev/
2. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
3. **Testing Library**: https://testing-library.com/
4. **Tailwind CSS**: https://tailwindcss.com/
5. **Vite**: https://vitejs.dev/

## Summary Checklist

Before considering any work complete:

- [ ] Read relevant documentation
- [ ] Followed existing patterns
- [ ] Tests written/updated
- [ ] Coverage >90% maintained
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Manually verified (if UI change)
- [ ] Documentation updated (if needed)
- [ ] ADR created (if architectural decision)
- [ ] No privacy violations (no user data transmission)
- [ ] No security issues introduced

## Remember

1. **Privacy is paramount** - Never compromise the client-side guarantee
2. **Quality over speed** - 90% coverage is required, not optional
3. **Follow patterns** - Consistency makes the codebase maintainable
4. **Document decisions** - Future you will thank present you
5. **Test thoroughly** - Tests are the safety net for refactoring

When in doubt, read the documentation first. The answer is probably there.
