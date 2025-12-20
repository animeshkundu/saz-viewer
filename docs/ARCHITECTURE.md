# SAZ Viewer Architecture

## Overview

SAZ Viewer is a client-side web application for inspecting Telerik Fiddler .saz files. The architecture is designed with three core principles:

1. **Privacy First**: 100% client-side processing - no data transmission
2. **Simplicity**: Single-page application with no backend infrastructure
3. **Accessibility**: Works on any platform with a modern browser

## Architectural Style

**Client-Side Single-Page Application (SPA)**

The application follows a modern SPA architecture where:
- All code runs in the user's browser
- State is managed in-memory (no persistence)
- File processing is entirely JavaScript-based
- No server-side API or backend services

This architectural style was chosen to:
- Guarantee user privacy and data security
- Eliminate infrastructure costs and complexity
- Maximize cross-platform compatibility
- Enable simple deployment via static hosting

See [ADR-0001: Client-Side Architecture](./ADR/ADR-0001-client-side-architecture.md) for detailed rationale.

## System Context

```
┌─────────────────────────────────────────────────────────┐
│                        User's Browser                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │              SAZ Viewer Application               │ │
│  │                                                   │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │ │
│  │  │   UI Layer  │  │ Business     │  │  Data   │ │ │
│  │  │  (React)    │◄─┤ Logic Layer  │◄─┤ Layer   │ │ │
│  │  └─────────────┘  └──────────────┘  └─────────┘ │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                          ▲                              │
│                          │ File API                     │
│                          │                              │
│                  ┌───────┴────────┐                     │
│                  │ .saz File      │                     │
│                  │ (Local File)   │                     │
│                  └────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### External Dependencies

**User Interactions:**
- User selects .saz file via drag-drop or file picker
- User interacts with UI to view and filter sessions
- User inspects request/response data

**No External Services:**
- No API calls to external services
- No analytics or tracking
- No data transmission of any kind

## Container Architecture

The application consists of a single container - the web application running in the browser.

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 19 | Component-based UI with modern hooks |
| **Language** | TypeScript | Type safety and developer experience |
| **Build Tool** | Vite | Fast development and optimized builds |
| **UI Components** | shadcn/ui + Radix UI | Professional, accessible components |
| **Styling** | Tailwind CSS | Utility-first styling |
| **ZIP Parsing** | JSZip | Client-side .saz file extraction |
| **Syntax Highlighting** | highlight.js | Code formatting for JSON/XML |
| **Testing** | Vitest + Testing Library | Unit and component tests |
| **Deployment** | GitHub Pages | Static hosting |

See:
- [ADR-0002: React + TypeScript Stack](./ADR/ADR-0002-react-typescript-stack.md)
- [ADR-0003: JSZip for Parsing](./ADR/ADR-0003-jszip-for-parsing.md)

## Component Architecture

The application is structured in three main layers:

### 1. Presentation Layer (UI Components)

**Responsibility**: Render UI and handle user interactions

**Key Components:**

```
src/
├── App.tsx                    # Root component, main layout
├── components/
│   ├── FileDropZone.tsx       # File upload interface
│   ├── SessionGrid.tsx        # Session list with filtering
│   ├── Inspector.tsx          # Tabbed request/response viewer
│   ├── HeadersView.tsx        # HTTP headers display
│   ├── RawView.tsx            # Raw HTTP text display
│   ├── JsonView.tsx           # Formatted JSON display
│   ├── XmlView.tsx            # Formatted XML display
│   └── HexView.tsx            # Binary hex viewer
└── ui/                        # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── table.tsx
    ├── tabs.tsx
    └── ...
```

**Component Hierarchy:**

```
App
├── FileDropZone (if no file loaded)
└── MainLayout (if file loaded)
    ├── GlobalHeader
    │   └── LoadNewFileButton
    ├── ResizableLayout
    │   ├── SessionGrid
    │   │   ├── SearchFilter
    │   │   ├── MethodFilter
    │   │   └── SessionTable
    │   ├── RequestInspector
    │   │   └── Tabs (Headers/Raw/JSON/XML/Hex)
    │   └── ResponseInspector
    │       └── Tabs (Headers/Raw/JSON/XML/Hex)
```

### 2. Business Logic Layer

**Responsibility**: Parse files, manage state, implement business rules

**Key Modules:**

```
src/
├── hooks/
│   ├── useSazParser.ts        # Parse .saz files with JSZip
│   ├── useSessionData.ts      # Manage session state
│   ├── useContentDetection.ts # Detect content types
│   └── useFiltering.ts        # Filter and search logic
├── lib/
│   ├── sazParser.ts           # SAZ file parsing logic
│   ├── httpParser.ts          # HTTP message parsing
│   ├── contentDetector.ts     # Content-Type detection
│   └── formatters.ts          # JSON/XML formatting
└── types/
    ├── sazTypes.ts            # SAZ file type definitions
    └── httpTypes.ts           # HTTP message types
```

**Data Flow:**

```
User selects file
    ↓
useSazParser hook
    ↓
JSZip extracts files
    ↓
httpParser parses HTTP messages
    ↓
contentDetector identifies types
    ↓
State updated (sessions array)
    ↓
UI re-renders with data
```

### 3. Data Layer

**Responsibility**: Type definitions and data structures

**Key Types:**

```typescript
interface SazSession {
  id: number;
  clientPort: number;
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  request: HttpMessage;
  response: HttpMessage;
}

interface HttpMessage {
  headers: Record<string, string>;
  body: string | ArrayBuffer;
  contentType: string;
  rawText: string;
}
```

**State Management:**

- **Local Component State**: For UI-only state (selected tab, filter text)
- **Lifted State**: For shared data (sessions, selected session)
- **No Global Store**: Application is simple enough to use React's built-in state

## Data Flow Architecture

### File Loading Flow

```
┌──────────────┐
│ User drops   │
│ .saz file    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ FileDropZone component   │
│ - Validates file type    │
│ - Checks .saz extension  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useSazParser hook        │
│ - Reads file as blob     │
│ - Passes to JSZip        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ JSZip                    │
│ - Extracts ZIP structure │
│ - Finds raw/ folder      │
│ - Lists session files    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ httpParser               │
│ - Parses each file       │
│ - Extracts HTTP data     │
│ - Builds session objects │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ State Update             │
│ - Sessions array set     │
│ - UI re-renders          │
└──────────────────────────┘
```

### Session Inspection Flow

```
┌──────────────┐
│ User clicks  │
│ session row  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ SessionGrid              │
│ - Calls onSelect handler │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ App state update         │
│ - selectedSession = id   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Inspector components     │
│ - Receive session data   │
│ - Detect content type    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Auto-select tab          │
│ - JSON → JsonView        │
│ - XML → XmlView          │
│ - Binary → HexView       │
│ - Default → RawView      │
└──────────────────────────┘
```

## Security Architecture

### Threat Model

**Primary Asset**: User's .saz file containing sensitive HTTP traffic data

**Threats Mitigated:**

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Data exfiltration to server | No server-side code; no network requests | ✅ Mitigated |
| XSS via malicious .saz content | Content sanitization; Content Security Policy | ✅ Mitigated |
| Malicious file execution | Sandboxed parsing; no eval() or dangerous APIs | ✅ Mitigated |
| Dependency vulnerabilities | Regular dependency updates; Dependabot enabled | ✅ Monitored |
| Man-in-the-middle during file load | Files loaded via browser File API (never transmitted) | ✅ N/A |

### Security Principles

1. **Zero Trust Network**: Application never makes network requests with user data
2. **Content Sandboxing**: All content rendered with React's XSS protection
3. **Dependency Hygiene**: Regular updates, minimal dependencies
4. **Transparency**: Open source code for audit

See [SECURITY.md](./SECURITY.md) for detailed security considerations.

## Performance Architecture

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load Time | < 2s | ~1.5s |
| File Parse Time (10MB) | < 2s | ~1.5s |
| Session Grid Render | < 100ms | ~50ms |
| Tab Switch | < 50ms | ~30ms |
| Memory Usage (50MB file) | < 200MB | ~150MB |

### Performance Strategies

**1. Code Splitting**
- Dynamic imports for syntax highlighters
- Lazy load hex viewer component
- Separate vendor bundles

**2. Efficient Rendering**
- Virtual scrolling for large session lists (if needed)
- React.memo for expensive components
- Debounced search filtering

**3. Async Operations**
- File parsing doesn't block UI
- Loading states during operations
- Progress indicators for large files

**4. Memory Management**
- Release file references after parsing
- Clear session data when loading new file
- Efficient data structures (typed arrays for hex data)

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│             GitHub Repository               │
│  ┌─────────────────────────────────────┐   │
│  │  main branch push                   │   │
│  └──────────────┬──────────────────────┘   │
│                 │                           │
│                 ▼                           │
│  ┌─────────────────────────────────────┐   │
│  │  GitHub Actions Workflow            │   │
│  │  - npm ci                           │   │
│  │  - npm run build                    │   │
│  │  - npm run test                     │   │
│  │  - npm run lint                     │   │
│  └──────────────┬──────────────────────┘   │
│                 │                           │
│                 ▼                           │
│  ┌─────────────────────────────────────┐   │
│  │  Deploy to GitHub Pages             │   │
│  │  - Upload dist/ folder              │   │
│  │  - Update GitHub Pages deployment   │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            GitHub Pages CDN                 │
│  - Global distribution                      │
│  - HTTPS enabled                            │
│  - Fast edge serving                        │
│  - Zero cost                                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          Users' Browsers                    │
│  - Download static assets                   │
│  - Run application client-side              │
└─────────────────────────────────────────────┘
```

### Build Process

```bash
# Development
npm run dev          # Vite dev server with HMR

# Production
npm run build        # TypeScript compilation + Vite build
  ├─ tsc             # Type checking
  ├─ vite build      # Bundle optimization
  │   ├─ Tree shaking
  │   ├─ Minification
  │   ├─ Code splitting
  │   └─ Asset optimization
  └─ dist/           # Output directory
      ├─ index.html
      ├─ assets/
      │   ├─ index-[hash].js
      │   ├─ index-[hash].css
      │   └─ ...
      └─ ...
```

### CI/CD Pipeline

See `.github/workflows/`:
- `ci.yml`: Runs tests, linting, coverage on every push/PR
- `deploy.yml`: Deploys to GitHub Pages on main branch push

## Scalability Considerations

### Current Scale

- **File Size**: Handles up to ~100MB .saz files comfortably
- **Sessions**: Efficiently renders 1000+ sessions
- **Concurrent Users**: Unlimited (no server)

### Scaling Limitations

**Memory**: 
- Large files (>200MB) may cause memory issues
- Mitigation: Document file size limits; warn users

**Performance**:
- Very large session lists (>5000) may need virtual scrolling
- Currently acceptable with pagination/filtering

**Browser Compatibility**:
- Requires modern browser with File API, ES6+
- No legacy browser support planned

### Future Scaling Options

If needed:
1. **Web Workers**: Offload parsing to background thread
2. **Virtual Scrolling**: For massive session lists
3. **IndexedDB**: Cache parsed sessions for reopening
4. **Streaming**: Parse large files incrementally

## Technology Decisions Summary

| Decision | Rationale | ADR |
|----------|-----------|-----|
| Client-side only | Privacy, simplicity, cost | [ADR-0001](./ADR/ADR-0001-client-side-architecture.md) |
| React + TypeScript | Type safety, ecosystem, maintainability | [ADR-0002](./ADR/ADR-0002-react-typescript-stack.md) |
| JSZip | Reliability, API, community support | [ADR-0003](./ADR/ADR-0003-jszip-for-parsing.md) |

## Architecture Principles

1. **Privacy by Design**: No data transmission is architectural law
2. **Simplicity First**: Avoid complexity unless clearly needed
3. **Progressive Enhancement**: Core features work; advanced features enhance
4. **Fail Gracefully**: Invalid data shouldn't crash the app
5. **Optimize for Common Case**: 10-50MB files, 100-500 sessions
6. **Maintainability**: Clear code > clever code

## Future Architecture Considerations

Potential future enhancements to evaluate:

- **Offline Support**: Service Worker for offline functionality
- **Export Features**: Save filtered/modified sessions
- **Compare Mode**: Side-by-side session comparison
- **Plugins**: Allow user extensions for custom parsing
- **Multi-file**: Compare multiple .saz files

Each would require careful consideration of impact on core architecture and principles.

## References

- [C4 Model for Architecture Documentation](https://c4model.com/)
- [Architectural Decision Records](./ADR/)
- [Security Documentation](./SECURITY.md)
- [Testing Strategy](./TESTING.md)
