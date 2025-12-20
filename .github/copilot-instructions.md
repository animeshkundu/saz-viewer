# GitHub Copilot Instructions for SAZ Viewer

## Project Context

SAZ Viewer is a privacy-first, client-side web application for inspecting Fiddler .saz files. Built with React 19 + TypeScript, it processes all data locally in the browser without any server-side communication.

## Essential Documentation

Read these before making changes:

- [`docs/AGENT.md`](../docs/AGENT.md) - Complete AI agent instructions
- [`docs/PRD.md`](../docs/PRD.md) - Product requirements
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) - System architecture
- [`docs/DESIGN.md`](../docs/DESIGN.md) - UI/UX design specifications
- [`docs/TESTING.md`](../docs/TESTING.md) - Testing requirements
- [`docs/ADR/`](../docs/ADR/) - Architectural decisions

## Core Constraints

### Non-Negotiable Rules

1. **Privacy First**: NEVER add code that transmits user data to servers
2. **Type Safety**: ALWAYS use strict TypeScript (no `any` without justification)
3. **Test Coverage**: MAINTAIN 90%+ coverage on all code
4. **Code Quality**: FOLLOW ESLint rules without disabling

### Quality Gates

Every change must pass:
```bash
npm run lint           # Must pass
npm run test:coverage  # Unit tests must maintain >90%
npm run e2e            # E2E tests for UI changes
npm run build          # Must succeed
```

## Development Standards

### TypeScript

- **Strict Mode**: Enabled, don't disable
- **No Any**: Use proper types
- **Full Typing**: All props, state, functions typed

```typescript
// ✅ Good
interface Props {
  sessions: SazSession[];
  onSelect: (id: number) => void;
}

export function Component({ sessions, onSelect }: Props) {
  // Implementation
}

// ❌ Bad
export function Component(props: any) {
  // Don't do this
}
```

### React Patterns

- **Functional Components**: Use hooks, not classes
- **TypeScript Props**: Always type props interfaces
- **State Management**: Use useState/useReducer, lift state up
- **Error Boundaries**: Wrap components that might fail

```typescript
// ✅ Good: Custom hook pattern
export function useSazParser() {
  const [sessions, setSessions] = useState<SazSession[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const parseFile = async (file: File) => {
    try {
      const sessions = await parseSazFile(file);
      setSessions(sessions);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Parse failed'));
    }
  };
  
  return { sessions, error, parseFile };
}
```

### Testing Requirements

SAZ Viewer uses **two types of tests**, both targeting **90%+ coverage**:

- **Unit Tests** (Vitest): Test functions, components, integration
- **E2E Tests** (Playwright): Test complete user workflows in browser

- **Write Tests First**: TDD approach when possible
- **Coverage >90%**: Required for unit tests; E2E must cover 90%+ of user workflows
- **Test Behavior**: Not implementation details
- **Use Testing Library**: Follow best practices for unit tests
- **Use Playwright**: For E2E user workflow tests

```typescript
// ✅ Good: Unit test - tests behavior
describe('SessionGrid', () => {
  it('highlights selected session when clicked', async () => {
    const onSelect = vi.fn();
    render(<SessionGrid sessions={mockSessions} onSelect={onSelect} />);
    
    await userEvent.click(screen.getByText('Session 1'));
    
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(screen.getByRole('row', { selected: true })).toHaveClass('bg-accent/15');
  });
});

// ✅ Good: E2E test - tests complete workflow
test('should upload and display SAZ file', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'fixtures/sample.saz');
  await expect(page.getByText('GET')).toBeVisible();
});

// ❌ Bad: Tests implementation
it('sets state correctly', () => {
  // Don't test internal state
});
```

### Styling

- **Tailwind CSS**: Use utility classes
- **Design Tokens**: Follow spacing/color system
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

```typescript
// ✅ Good: Tailwind utilities
<div className="flex items-center gap-4 px-6 py-2.5 bg-card border-b">
  <h1 className="text-xl font-semibold">SAZ Viewer</h1>
</div>

// ❌ Bad: Inline styles
<div style={{ display: 'flex', padding: '10px' }}>
```

## Common Tasks

### Adding a Feature

1. Check if it aligns with PRD and architecture
2. Write tests first
3. Implement minimally
4. Verify: lint, test, build
5. Update documentation if needed
6. Create ADR if architectural decision

### Fixing a Bug

1. Write failing test that reproduces bug
2. Fix with minimal change
3. Verify test passes
4. Run full test suite
5. Ensure coverage maintained

### Refactoring

1. Ensure tests cover code being refactored
2. Make incremental changes
3. Keep tests passing throughout
4. Verify no behavior changes

## File Organization

```
src/
├── components/       # React components + tests
├── hooks/           # Custom hooks + tests
├── lib/             # Utilities + tests
├── types/           # TypeScript definitions
├── ui/              # shadcn/ui components
└── App.tsx          # Root component
```

## Code Patterns

### Error Handling

```typescript
// ✅ Good: Specific errors, user messages
try {
  const result = await parseFile(file);
  return result;
} catch (error) {
  if (error instanceof ZipError) {
    throw new Error('Invalid SAZ file structure');
  }
  throw new Error('Failed to parse file');
}
```

### Async Operations

```typescript
// ✅ Good: Loading states, error handling
async function loadData() {
  setLoading(true);
  setError(null);
  
  try {
    const data = await fetchData();
    setData(data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
}
```

## Security

- **No Server Calls**: With user data (privacy guarantee)
- **Content Sanitization**: React handles by default
- **Dependencies**: Audit before adding
- **No eval()**: Or similar dangerous APIs

## Documentation

### When to Create ADR

- Adding/replacing major dependencies
- Architectural changes
- Breaking changes
- Technology decisions

### Code Comments

- Self-documenting code preferred
- Comment why, not what
- Complex logic only
- JSDoc for public APIs

## Quick Reference

### Commands

```bash
# Development
npm run dev              # Start dev server

# Quality Checks
npm run lint            # ESLint
npm run test:coverage   # Tests + coverage
npm run build          # Production build

# Testing
npm test               # Watch mode
npm run test:run       # Single run
npm run test:ui        # Visual UI
```

### Key Files

- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration
- `eslint.config.js` - Linting rules
- `tsconfig.json` - TypeScript settings
- `tailwind.config.js` - Styling configuration

## Anti-Patterns to Avoid

```typescript
// ❌ Don't use any
function process(data: any) { }

// ❌ Don't disable linting without reason
// eslint-disable-next-line

// ❌ Don't ignore errors
try { } catch (e) { }

// ❌ Don't test implementation
expect(component.state).toBe(value);

// ❌ Don't violate privacy guarantee
fetch('https://api.example.com', { body: userData });
```

## Completion Checklist

Before considering work complete:

- [ ] Tests written/updated (>90% coverage)
- [ ] Linter passes (npm run lint)
- [ ] Build succeeds (npm run build)
- [ ] Manual verification (if UI change)
- [ ] Documentation updated (if needed)
- [ ] No privacy violations
- [ ] No security issues

## Resources

- Full instructions: [`docs/AGENT.md`](../docs/AGENT.md)
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Testing Library: https://testing-library.com/
- Tailwind CSS: https://tailwindcss.com/

## Remember

1. **Privacy is paramount** - Client-side only
2. **Quality over speed** - 90% coverage required
3. **Follow patterns** - Consistency matters
4. **Test thoroughly** - Tests enable refactoring
5. **Document decisions** - Future maintainers will thank you

Read [`docs/AGENT.md`](../docs/AGENT.md) for complete instructions.
