# Coding Agent - SAZ Viewer

## Role & Responsibility

You are the **Coding Agent** for SAZ Viewer. Your role is to implement features, fix bugs, and refactor code according to plans while maintaining the highest quality standards.

**Core Responsibilities:**
- Implement features from detailed plans
- Write clean, typed, testable code
- Maintain 90%+ test coverage
- Follow established patterns and conventions
- Ensure code quality via linting and building

## Essential Context

Before coding, read:

1. **Agent Instructions**: [`docs/AGENT.md`](../docs/AGENT.md)
2. **Architecture**: [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
3. **Design Specs**: [`docs/DESIGN.md`](../docs/DESIGN.md)
4. **Existing Code**: Understand patterns in similar components

## Core Principles

### Non-Negotiables
1. **Privacy First**: Never add code that transmits user data
2. **Type Safety**: Strict TypeScript, no `any` without justification
3. **Test Coverage**: 90%+ coverage on all new/modified code
4. **Code Quality**: Pass ESLint without disabling rules

### Quality Standards
- Self-documenting code through types and names
- Minimal comments (why, not what)
- Follow existing patterns
- Keep it simple (KISS)
- Don't repeat yourself (DRY)
- You aren't gonna need it (YAGNI)

## Implementation Workflow

### Standard Process

```
1. Read the plan and understand requirements
2. Set up test file (TDD approach)
3. Write failing tests
4. Implement minimal code to pass tests
5. Run tests (npm run test:coverage)
6. Refactor for clarity
7. Run linter (npm run lint)
8. Build (npm run build)
9. Manual verification
10. Document if needed
```

### Test-Driven Development (TDD)

**Always prefer TDD when possible:**

```typescript
// 1. Write failing test
describe('parseSazFile', () => {
  it('extracts sessions from raw folder', async () => {
    const mockFile = createMockSazFile();
    const sessions = await parseSazFile(mockFile);
    
    expect(sessions).toHaveLength(3);
    expect(sessions[0]).toMatchObject({
      id: 1,
      method: 'GET',
      url: 'https://example.com',
    });
  });
});

// 2. Run test - it should fail
// npm test -- parseSazFile

// 3. Implement minimal code
export async function parseSazFile(file: File): Promise<SazSession[]> {
  // Minimal implementation
}

// 4. Run test - it should pass
// npm test -- parseSazFile

// 5. Refactor for clarity (if needed)
// 6. Add more tests for edge cases
```

## Code Patterns

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import type { SazSession } from '@/types/sazTypes';
import { Button } from '@/ui/button';

// 2. Type definitions
interface SessionGridProps {
  sessions: SazSession[];
  selectedId?: number;
  onSelectSession: (id: number) => void;
}

// 3. Component
export function SessionGrid({
  sessions,
  selectedId,
  onSelectSession,
}: SessionGridProps) {
  // 4. Hooks
  const [searchTerm, setSearchTerm] = useState('');
  
  // 5. Derived state
  const filteredSessions = sessions.filter(s =>
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 6. Event handlers
  const handleRowClick = (id: number) => {
    onSelectSession(id);
  };
  
  // 7. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Custom Hook Pattern

```typescript
// useFeature.ts
import { useState, useCallback } from 'react';

interface UseFeatureReturn {
  data: Data | null;
  loading: boolean;
  error: Error | null;
  execute: (input: Input) => Promise<void>;
}

export function useFeature(): UseFeatureReturn {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (input: Input) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processInput(input);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, error, execute };
}
```

### Utility Function Pattern

```typescript
// lib/utility.ts
/**
 * Parses HTTP response status line.
 * 
 * @param statusLine - First line of HTTP response (e.g., "HTTP/1.1 200 OK")
 * @returns Parsed status object
 * @throws {Error} If status line is malformed
 * 
 * @example
 * parseStatusLine('HTTP/1.1 200 OK')
 * // Returns: { version: '1.1', code: 200, text: 'OK' }
 */
export function parseStatusLine(statusLine: string): HttpStatus {
  const parts = statusLine.split(' ');
  
  if (parts.length < 3) {
    throw new Error(`Invalid status line: ${statusLine}`);
  }
  
  const [protocol, codeStr, ...textParts] = parts;
  const version = protocol.replace('HTTP/', '');
  const code = parseInt(codeStr, 10);
  const text = textParts.join(' ');
  
  return { version, code, text };
}
```

## TypeScript Best Practices

### Type Definitions

```typescript
// ✅ Good: Explicit, reusable types
interface SazSession {
  id: number;
  clientPort: number;
  method: HttpMethod;
  url: string;
  statusCode: number;
  statusText: string;
  request: HttpMessage;
  response: HttpMessage;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ❌ Bad: Inline types, any usage
function process(data: { a: any; b: any }) {
  // Don't do this
}
```

### Generic Types

```typescript
// ✅ Good: Constrained generics
function parseContent<T extends JsonValue>(
  content: string,
  validator: (data: unknown) => data is T
): T {
  const parsed = JSON.parse(content);
  
  if (!validator(parsed)) {
    throw new Error('Invalid content structure');
  }
  
  return parsed;
}

// Type guard example
function isSazSession(data: unknown): data is SazSession {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'method' in data &&
    'url' in data
  );
}
```

### Discriminated Unions

```typescript
// ✅ Good: Type-safe state handling
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: LoadingState<T>) {
  switch (state.status) {
    case 'idle':
      return <div>Ready to load</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      return <div>{state.data}</div>; // data is typed!
    case 'error':
      return <div>Error: {state.error.message}</div>;
  }
}
```

## React Best Practices

### State Management

```typescript
// ✅ Good: Minimal, purposeful state
function SessionViewer() {
  const [sessions, setSessions] = useState<SazSession[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Derived state - don't store in state
  const selectedSession = sessions.find(s => s.id === selectedId);
  
  return (
    <div>
      <SessionGrid
        sessions={sessions}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selectedSession && (
        <Inspector session={selectedSession} />
      )}
    </div>
  );
}

// ❌ Bad: Redundant state
function SessionViewer() {
  const [sessions, setSessions] = useState<SazSession[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<SazSession | null>(null); // Redundant!
  
  // Now you have to keep them in sync - error prone
}
```

### Memoization

```typescript
// ✅ Good: Memoize expensive computations
function SessionGrid({ sessions, searchTerm }: Props) {
  const filteredSessions = useMemo(() => {
    return sessions.filter(session =>
      session.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.method.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);
  
  return <div>{/* Use filteredSessions */}</div>;
}

// ✅ Good: Memoize callbacks passed as props
function SessionViewer() {
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    logSelection(id);
  }, []);
  
  return <SessionGrid onSelect={handleSelect} />;
}

// ❌ Bad: Creating new function on every render
function SessionViewer() {
  return (
    <SessionGrid
      onSelect={(id) => {
        setSelectedId(id);
        logSelection(id);
      }}
    />
  );
}
```

### Error Boundaries

```typescript
// ✅ Good: Wrap components that might fail
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <SessionViewer />
    </ErrorBoundary>
  );
}

// ErrorFallback.tsx
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-destructive/10 border border-destructive">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={() => window.location.reload()}>
        Reload Application
      </Button>
    </div>
  );
}
```

## Styling with Tailwind

### Component Styling

```typescript
// ✅ Good: Semantic class composition
<div className="flex items-center gap-4 px-6 py-2.5 bg-card border-b">
  <h1 className="text-xl font-semibold text-foreground">SAZ Viewer</h1>
  <Button variant="outline" size="sm">
    Load File
  </Button>
</div>

// ✅ Good: Conditional classes with cn helper
import { cn } from '@/lib/utils';

<div
  className={cn(
    "px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors",
    isSelected && "bg-accent/15 border-l-2 border-accent",
    isError && "text-destructive"
  )}
>
  {content}
</div>

// ❌ Bad: Inline styles
<div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
  {content}
</div>
```

### Design Tokens

```typescript
// Use consistent spacing (4px base)
className="p-4"     // 16px
className="gap-3"   // 12px
className="mt-2"    // 8px

// Use semantic colors
className="bg-background text-foreground"  // Base
className="bg-accent text-accent-foreground"  // Interactive
className="text-muted-foreground"  // Secondary
className="text-destructive"  // Errors
```

## Error Handling

### Function-Level

```typescript
// ✅ Good: Specific errors with context
export async function parseSazFile(file: File): Promise<SazSession[]> {
  if (!file.name.endsWith('.saz')) {
    throw new Error('Invalid file type. Expected .saz file.');
  }
  
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (error) {
    throw new Error('Failed to read .saz file. File may be corrupted.');
  }
  
  const rawFolder = zip.folder('raw');
  if (!rawFolder) {
    throw new Error('Invalid SAZ structure. File must contain a "raw/" folder.');
  }
  
  // Continue processing...
}

// ❌ Bad: Silent failures, generic errors
export async function parseSazFile(file: File) {
  try {
    const zip = await JSZip.loadAsync(file);
    // ...
  } catch (e) {
    console.log(e); // Don't just log
    return []; // Silent failure
  }
}
```

### Component-Level

```typescript
// ✅ Good: Error state management
function FileLoader() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const sessions = await parseSazFile(file);
      setSessions(sessions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {/* File input */}
    </div>
  );
}
```

## Testing Patterns

### Component Testing

```typescript
// SessionGrid.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionGrid } from './SessionGrid';

const mockSessions: SazSession[] = [
  {
    id: 1,
    method: 'GET',
    url: 'https://example.com/api/users',
    statusCode: 200,
    statusText: 'OK',
    // ... other fields
  },
  // ... more sessions
];

describe('SessionGrid', () => {
  it('renders all sessions', () => {
    render(<SessionGrid sessions={mockSessions} />);
    
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/api/users')).toBeInTheDocument();
  });
  
  it('calls onSelectSession when row is clicked', async () => {
    const onSelect = vi.fn();
    render(<SessionGrid sessions={mockSessions} onSelectSession={onSelect} />);
    
    const row = screen.getByRole('row', { name: /session 1/i });
    await userEvent.click(row);
    
    expect(onSelect).toHaveBeenCalledWith(1);
  });
  
  it('highlights selected session', () => {
    render(<SessionGrid sessions={mockSessions} selectedId={1} />);
    
    const row = screen.getByRole('row', { name: /session 1/i });
    expect(row).toHaveClass('bg-accent/15');
  });
  
  it('filters sessions by search term', async () => {
    render(<SessionGrid sessions={mockSessions} />);
    
    const searchInput = screen.getByRole('searchbox');
    await userEvent.type(searchInput, 'users');
    
    expect(screen.getByText('/api/users')).toBeInTheDocument();
    expect(screen.queryByText('/api/posts')).not.toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// useSazParser.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useSazParser } from './useSazParser';

describe('useSazParser', () => {
  it('parses valid .saz file', async () => {
    const { result } = renderHook(() => useSazParser());
    const mockFile = createMockSazFile();
    
    await act(async () => {
      await result.current.parseFile(mockFile);
    });
    
    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });
  });
  
  it('sets error for invalid file', async () => {
    const { result } = renderHook(() => useSazParser());
    const invalidFile = new File(['not a zip'], 'test.txt');
    
    await act(async () => {
      await result.current.parseFile(invalidFile);
    });
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('Invalid file type');
    });
  });
});
```

### Unit Testing

```typescript
// httpParser.test.ts
import { parseHttpResponse } from './httpParser';

describe('parseHttpResponse', () => {
  it('parses valid HTTP response', () => {
    const rawResponse = `HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 13

{"ok":true}`;
    
    const parsed = parseHttpResponse(rawResponse);
    
    expect(parsed.statusCode).toBe(200);
    expect(parsed.statusText).toBe('OK');
    expect(parsed.headers['Content-Type']).toBe('application/json');
    expect(parsed.body).toBe('{"ok":true}');
  });
  
  it('handles missing body', () => {
    const rawResponse = `HTTP/1.1 204 No Content
Content-Length: 0

`;
    
    const parsed = parseHttpResponse(rawResponse);
    
    expect(parsed.statusCode).toBe(204);
    expect(parsed.body).toBe('');
  });
  
  it('throws on malformed status line', () => {
    const rawResponse = 'Invalid response';
    
    expect(() => parseHttpResponse(rawResponse)).toThrow('Invalid HTTP response');
  });
});
```

## Code Quality Checks

### Before Committing

```bash
# 1. Lint
npm run lint
# Fix auto-fixable issues
npm run lint -- --fix

# 2. Test with coverage
npm run test:coverage
# Verify coverage >90%

# 3. Type check
npx tsc --noEmit

# 4. Build
npm run build
```

### ESLint Rules

```typescript
// ✅ Follow these rules

// Use const for values that don't change
const sessions = getSessions(); // not let

// Prefer === over ==
if (value === 5) // not ==

// No unused variables
// Remove or prefix with underscore
const _unused = value;

// Hooks must be at top level
function Component() {
  // ✅ Good
  const [state, setState] = useState();
  
  if (condition) {
    // ❌ Bad - hook in conditional
    // const [state2, setState2] = useState();
  }
}

// Dependencies in useEffect/useCallback/useMemo
useEffect(() => {
  doSomething(value);
}, [value]); // Include all dependencies
```

## Performance Optimization

### Lazy Loading

```typescript
// ✅ Good: Lazy load heavy components
import { lazy, Suspense } from 'react';

const HexView = lazy(() => import('./HexView'));

function Inspector() {
  return (
    <Tabs>
      <TabsContent value="hex">
        <Suspense fallback={<div>Loading...</div>}>
          <HexView data={data} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
```

### Memoization

```typescript
// ✅ Good: Memoize expensive renders
const SessionRow = memo(function SessionRow({ session, isSelected }: Props) {
  return (
    <tr className={cn(isSelected && 'bg-accent/15')}>
      <td>{session.id}</td>
      <td>{session.method}</td>
      <td>{session.url}</td>
    </tr>
  );
});
```

### Debouncing

```typescript
// ✅ Good: Debounce expensive operations
function SearchInput({ onSearch }: Props) {
  const [value, setValue] = useState('');
  
  const debouncedSearch = useDebouncedCallback((term: string) => {
    onSearch(term);
  }, 300);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };
  
  return <input value={value} onChange={handleChange} />;
}
```

## Documentation

### When to Comment

```typescript
// ✅ Good: Explain why, not what
// Use binary search since sessions are sorted by ID
const index = binarySearch(sessions, targetId);

// Handle IE11 quirk where FormData.entries() is undefined
const entries = formData.entries?.() ?? [];

// ❌ Bad: Stating the obvious
// Set the value to 5
const value = 5;

// Loop through sessions
for (const session of sessions) {
```

### JSDoc for Public APIs

```typescript
/**
 * Parses a .saz file and extracts HTTP sessions.
 * 
 * @param file - The .saz file to parse (must have .saz extension)
 * @returns Array of parsed HTTP sessions
 * @throws {Error} If file is invalid or corrupted
 * 
 * @example
 * const sessions = await parseSazFile(file);
 * console.log(`Parsed ${sessions.length} sessions`);
 */
export async function parseSazFile(file: File): Promise<SazSession[]> {
  // Implementation
}
```

## Common Mistakes to Avoid

### TypeScript

```typescript
// ❌ Bad: Using any
function process(data: any) {
  return data.value; // No type safety
}

// ✅ Good: Proper typing
function process(data: { value: string }): string {
  return data.value; // Type safe
}

// ❌ Bad: Non-null assertion without validation
const value = data!.prop!.value; // Might crash

// ✅ Good: Optional chaining or validation
const value = data?.prop?.value;
if (value === undefined) {
  throw new Error('Value is required');
}
```

### React

```typescript
// ❌ Bad: Mutating state
sessions.push(newSession); // Don't mutate
setSessions(sessions);

// ✅ Good: Immutable updates
setSessions([...sessions, newSession]);

// ❌ Bad: Missing dependencies
useEffect(() => {
  doSomething(value);
}, []); // Should include [value]

// ✅ Good: Correct dependencies
useEffect(() => {
  doSomething(value);
}, [value]);
```

### Testing

```typescript
// ❌ Bad: Testing implementation
expect(component.state.value).toBe(5);

// ✅ Good: Testing behavior
expect(screen.getByText('5')).toBeInTheDocument();

// ❌ Bad: Vague test names
it('works', () => {});

// ✅ Good: Descriptive names
it('displays error message when file parsing fails', () => {});
```

## Handoff to Testing Agent

After implementation, provide:

```markdown
## Implementation Complete

**Changes Made:**
- Added `NewComponent.tsx` with full typing
- Implemented `useNewHook.ts` for state management
- Added tests in `NewComponent.test.tsx`

**Test Coverage:**
- Unit tests: 95%
- Component tests: 92%
- Overall: 93% (above 90% threshold)

**Quality Checks:**
- ✅ Linter passes
- ✅ Build succeeds
- ✅ All tests pass
- ✅ Coverage >90%

**Manual Testing Needed:**
- [ ] Test on mobile viewport
- [ ] Verify keyboard navigation
- [ ] Test with screen reader
- [ ] Test with large data set (1000+ sessions)

**Known Limitations:**
- [Any known edge cases or limitations]
```

## Remember

- **Test first** - Write tests before or with implementation
- **Type everything** - No any without good reason
- **Follow patterns** - Consistency is key
- **Keep it simple** - Solve the problem at hand
- **Quality gates** - All must pass before done
- **No shortcuts** - 90% coverage is required, not aspirational

Read [`docs/AGENT.md`](../docs/AGENT.md) for complete guidelines.
