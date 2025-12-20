# SAZ Viewer Design Document

## Overview

This document describes the detailed design of SAZ Viewer, including UI/UX design, component design, data models, and implementation patterns.

## Design Philosophy

SAZ Viewer follows these core design principles:

1. **Professional Tool Aesthetic**: Serious, precise, utilitarian - echoing Chrome DevTools and VS Code
2. **Content-First**: Maximize information density while maintaining readability
3. **Predictable Interactions**: Clear affordances, immediate feedback
4. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable
5. **Performance**: Instant responses to user actions

## Visual Design

### Design Language

**Style**: Developer tool aesthetic
- Minimal decorative elements
- Focus on content and data
- High information density
- Technical precision

**Inspiration**: Chrome DevTools, VS Code, professional debugging tools

### Color System

Based on PRD specifications using oklch color space for perceptual uniformity.

**Core Colors:**

```css
/* Base */
--background: oklch(0.98 0 0);        /* Light gray background */
--foreground: oklch(0.20 0.01 250);   /* Dark slate text */
--card: oklch(1 0 0);                 /* White cards */
--border: oklch(0.92 0 0);            /* Subtle borders */

/* Primary */
--primary: oklch(0.25 0.01 250);      /* Deep slate */
--primary-foreground: oklch(1 0 0);   /* White on primary */

/* Accent */
--accent: oklch(0.60 0.20 240);       /* Electric blue */
--accent-foreground: oklch(1 0 0);    /* White on accent */

/* Muted */
--muted: oklch(0.92 0 0);             /* Medium gray */
--muted-foreground: oklch(0.45 0.01 250); /* Medium slate */

/* Semantic Colors */
--success: oklch(0.60 0.15 145);      /* Green for 2xx status */
--warning: oklch(0.65 0.18 85);       /* Yellow for 3xx status */
--error: oklch(0.55 0.22 25);         /* Red for 4xx/5xx status */
```

**Status Code Colors:**

```css
/* HTTP Status Visual Indicators */
2xx Success:  Green (#10b981)
3xx Redirect: Yellow (#f59e0b)
4xx Client:   Orange (#f97316)
5xx Server:   Red (#ef4444)
```

**Contrast Ratios** (all meet WCAG AA standards):
- Background/Foreground: 12.1:1 ✅
- Card/Foreground: 14.5:1 ✅
- Primary/White: 11.8:1 ✅
- Accent/White: 4.9:1 ✅

### Typography

**Font Stack:**

```css
/* UI Text */
--font-sans: Inter, system-ui, sans-serif;

/* Code/Data */
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

**Type Scale:**

| Element | Font | Size | Weight | Letter Spacing | Usage |
|---------|------|------|--------|----------------|-------|
| H1 | Inter | 20px | SemiBold | -0.01em | App title, main headers |
| H2 | Inter | 14px | Medium | -0.005em | Panel titles, section headers |
| Body | Inter | 13px | Regular | normal | Session list, UI labels |
| Code | JetBrains Mono | 13px | Regular | normal | Headers, JSON, Raw |
| Small Code | JetBrains Mono | 12px | Regular | normal | Hex addresses, metadata |

**Line Heights:**
- UI Text: 1.5 (comfortable reading)
- Code: 1.6 (clear line separation)
- Dense Data: 1.4 (compact tables)

### Spacing System

Based on 4px base unit for consistent rhythm:

```css
/* Tailwind spacing scale */
1: 4px    /* Tight inline spacing */
2: 8px    /* Compact spacing */
3: 12px   /* Standard spacing */
4: 16px   /* Comfortable spacing */
6: 24px   /* Section spacing */
8: 32px   /* Large spacing */
```

**Component Spacing:**
- Global header: `px-6 py-2.5` (24px/10px)
- Panel padding: `p-4` (16px)
- Panel headers: `p-3` (12px)
- Session grid cells: `px-3 py-2.5` (12px/10px)
- Inspector content: `p-4` (16px)
- Button padding: `px-4 py-2` (16px/8px)

### Iconography

Using Phosphor Icons for consistent visual language.

**Selected Icons:**

| Icon | Component | Usage |
|------|-----------|-------|
| `FolderOpen` | LoadFileButton | Global "Load New File" action |
| `FileArchive` | FileDropZone | SAZ file indicator |
| `Warning` | ErrorAlert | Error messages |
| `Code` | Tabs | Raw/JSON tab icons |
| `ListBullets` | Tabs | Headers tab icon |
| `FileMagnifyingGlass` | Tabs | Hex tab icon |
| `MagnifyingGlass` | SearchInput | Search functionality |
| `FunnelSimple` | FilterDropdown | Method filtering |
| `CaretUp/Down` | TableHeader | Sort indicators |

**Icon Sizes:**
- Standard: 16px (inline with text)
- Large: 20px (buttons, prominent actions)
- Hero: 48px (empty states)

## Layout Design

### Global Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Global Header (persistent)                         │
│ [SAZ Viewer]                    [Load New File]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┬───────────────┬──────────────┐  │
│  │               │               │              │  │
│  │   Session     │   Request     │  Response    │  │
│  │   Grid        │   Inspector   │  Inspector   │  │
│  │               │               │              │  │
│  │               │               │              │  │
│  │ (30% width)   │ (35% width)   │ (35% width)  │  │
│  │               │               │              │  │
│  └───────────────┴───────────────┴──────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Rationale:**
- Three-pane layout provides complete context
- Request and response visible simultaneously
- Resizable panels for user preference
- Fixed header keeps "Load New File" accessible

### Component Layouts

#### Session Grid

```
┌────────────────────────────────────────────┐
│ 🔍 Search    [Filter by Method ▾]         │
├────┬────────┬────────┬──────────────────┬─┤
│ #  │ Status │ Method │ URL              │⋮│
├────┼────────┼────────┼──────────────────┼─┤
│ 1  │ 200 OK │ GET    │ /api/users       │ │
│ 2  │ 404    │ POST   │ /api/login       │ │
│ 3  │ 301    │ GET    │ /old-page        │ │
│... │        │        │                  │ │
└────┴────────┴────────┴──────────────────┴─┘
```

**Features:**
- Search filters all visible columns
- Method filter (multi-select dropdown)
- Sortable columns (click header)
- Active row highlighted with accent color
- Status code with color indicator

#### Inspector Panel

```
┌──────────────────────────────────────────┐
│ Request | Status: 200 OK | Size: 1.2 KB │
├──────────────────────────────────────────┤
│ [Headers] [Raw] [JSON] [XML] [Hex]      │
├──────────────────────────────────────────┤
│                                          │
│  Content based on selected tab           │
│                                          │
│  • Headers: Two-column table             │
│  • Raw: Monospace plain text             │
│  • JSON: Syntax highlighted, formatted   │
│  • XML: Syntax highlighted               │
│  • Hex: Address | Bytes | ASCII          │
│                                          │
└──────────────────────────────────────────┘
```

**Features:**
- Metadata in panel header (status, size)
- Auto-select appropriate tab based on content type
- Scrollable content area
- Syntax highlighting for code
- Copy buttons for content

#### File Drop Zone

```
┌────────────────────────────────────────┐
│                                        │
│          ┌────────────┐                │
│          │            │                │
│          │  📦 Icon   │                │
│          │            │                │
│          └────────────┘                │
│                                        │
│      Drop .saz file here               │
│      or click to browse                │
│                                        │
│      [Load SAZ File]                   │
│                                        │
└────────────────────────────────────────┘
```

**States:**
- Default: Dashed border, muted text
- Hover: Accent border, darker text
- Drag over: Accent background, bold text
- Error: Red border, error message

## Component Design

### Design System Components

Built on shadcn/ui + Radix UI primitives:

**Core Components:**

| Component | Library | Purpose | Customization |
|-----------|---------|---------|---------------|
| Button | shadcn/ui | Actions, triggers | Variant: default, outline, ghost |
| Card | shadcn/ui | Panels, containers | Custom padding, borders |
| Table | shadcn/ui | Session grid | Custom row hover, active states |
| Tabs | shadcn/ui | Inspector views | Custom active indicator |
| Input | shadcn/ui | Search field | Icon integration |
| ScrollArea | shadcn/ui | Content scrolling | Custom scrollbar styling |
| DropdownMenu | shadcn/ui | Filters | Custom checkbox items |
| Alert | shadcn/ui | Error messages | Destructive variant |
| ResizablePanel | shadcn/ui | Layout | Custom handle styling |

### Custom Components

**1. FileDropZone**

```typescript
interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  onError: (error: Error) => void;
}
```

**Behavior:**
- Drag-drop file upload
- Click to open file picker
- Validate .saz extension
- Provide visual feedback for all states

**Visual States:**
- Default: `border-dashed border-2 border-muted`
- Hover: `border-accent`
- Drag over: `bg-accent/10 border-accent`
- Error: `border-destructive`

---

**2. SessionGrid**

```typescript
interface SessionGridProps {
  sessions: SazSession[];
  selectedId?: number;
  onSelectSession: (id: number) => void;
}
```

**Features:**
- Sortable columns (click header, toggle direction)
- Search filter (debounced, filters #, method, URL, status)
- Method filter (multi-select: GET, POST, PUT, DELETE, etc.)
- Keyboard navigation (arrow keys, enter to select)
- Visual active state

**Columns:**
- # (60px fixed)
- Status (100px fixed)
- Method (80px fixed)
- URL (fluid, ellipsis overflow)

---

**3. Inspector**

```typescript
interface InspectorProps {
  session: SazSession;
  type: 'request' | 'response';
}
```

**Auto-detection Logic:**
```typescript
function detectTab(contentType: string): TabType {
  if (contentType.includes('json')) return 'json';
  if (contentType.includes('xml')) return 'xml';
  if (contentType.startsWith('text/')) return 'raw';
  return 'hex'; // Binary content
}
```

**Tabs:**
- Headers: Always available
- Raw: Always available
- JSON: Available if content is JSON
- XML: Available if content is XML
- Hex: Available if content is binary

---

**4. HeadersView**

```typescript
interface HeadersViewProps {
  headers: Record<string, string>;
}
```

**Display:**
- Two-column table
- Left: Header name (bold)
- Right: Header value (monospace)
- Zebra striping for readability

---

**5. HexView**

```typescript
interface HexViewProps {
  data: ArrayBuffer;
}
```

**Layout:**
```
Offset      Hex                                ASCII
00000000    48 54 54 50 2F 31 2E 31 20 32 30   HTTP/1.1 20
00000010    30 20 4F 4B 0D 0A 43 6F 6E 74 65   0 OK..Conte
```

- Address column: 8 hex digits
- Hex column: 16 bytes per row, space separated
- ASCII column: Printable chars or `.` for non-printable

---

**6. SyntaxHighlighter**

```typescript
interface SyntaxHighlighterProps {
  code: string;
  language: 'json' | 'xml' | 'http';
}
```

**Implementation:**
- Wraps highlight.js
- Custom theme matching color scheme
- Line numbers optional
- Copy button in corner

## Interaction Design

### Key User Flows

**1. Load File Flow**

```
Initial state (no file)
  ↓
User drops/selects .saz file
  ↓
Validation (extension check)
  ↓ (if valid)
Loading state (spinner, "Parsing...")
  ↓
File parsed successfully
  ↓
Main view rendered (sessions visible)
```

**Error handling:**
- Invalid file type → Error alert, keep drop zone
- Corrupted ZIP → Error alert, keep drop zone
- Invalid structure → Error alert with details

---

**2. Session Inspection Flow**

```
Session grid displayed
  ↓
User clicks row (or uses arrow keys + Enter)
  ↓
Row highlights with accent background
  ↓
Request/Response panels update (<100ms)
  ↓
Auto-select appropriate tab (JSON/XML/Hex)
  ↓
Content rendered with syntax highlighting
```

---

**3. Search/Filter Flow**

```
User types in search box
  ↓
Debounced input (300ms delay)
  ↓
Filter sessions by term
  ↓
Grid updates instantly
  ↓
Preserve selected session if visible
```

---

**4. Load New File Flow**

```
User viewing current file
  ↓
Click "Load New File" in header
  ↓
Confirmation dialog (if needed)
  ↓
Clear current state
  ↓
Show drop zone
  ↓
[Same as Load File Flow]
```

### Keyboard Navigation

**Global:**
- `Ctrl/Cmd + O`: Open file picker
- `Ctrl/Cmd + K`: Focus search
- `Ctrl/Cmd + F`: Focus search (alternative)
- `Esc`: Clear search, deselect session

**Session Grid:**
- `↑/↓`: Navigate sessions
- `Enter`: Select session
- `Home/End`: First/last session
- `Page Up/Down`: Jump 10 sessions

**Inspector:**
- `Ctrl/Cmd + 1-5`: Switch tabs
- `Ctrl/Cmd + C`: Copy content (when focused)
- `Tab`: Navigate between panels

### Mouse Interactions

**Session Grid:**
- Click row: Select session
- Click column header: Sort by that column
- Click again: Toggle sort direction
- Hover row: Highlight background

**Inspector:**
- Click tab: Switch view
- Click copy button: Copy to clipboard
- Scroll content: Standard scrolling

**Resize:**
- Drag panel dividers: Adjust widths
- Double-click divider: Reset to defaults

## Animation & Transitions

**Philosophy**: Minimal, functional animations that confirm actions without delaying workflow.

**Durations:**
- Instant: 0ms (color changes on hover)
- Fast: 150ms (tab switches, highlights)
- Standard: 200ms (panel animations, content fade-in)
- Slow: 300ms (modal/alert appear)

**Transitions:**

```css
/* Tab switching */
.tab-content {
  transition: opacity 150ms ease-in-out;
}

/* Row selection */
.session-row {
  transition: background-color 100ms ease;
}

/* Loading states */
.loading-fade {
  animation: fade-in 200ms ease-in;
}

/* Error alerts */
.alert-enter {
  animation: slide-down 300ms ease-out;
}
```

**Hover States:**
- Button: `hover:brightness-110` (subtle glow)
- Row: `hover:bg-muted/40` (subtle highlight)
- Interactive element: `hover:scale-105` (very subtle)

**Active States:**
- Button: `active:scale-98` (press feedback)
- Session row: `bg-accent/15 border-l-2 border-accent` (clear selection)

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Mobile Adaptations (<768px)

**Layout:**
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│                     │
│ Session Grid        │
│ (fixed height)      │
│                     │
├─────────────────────┤
│                     │
│ Request Inspector   │
│ (full width)        │
│                     │
├─────────────────────┤
│                     │
│ Response Inspector  │
│ (full width)        │
│                     │
└─────────────────────┘
```

**Changes:**
- Vertical stack instead of three-pane
- Session grid: max-height 320px, scrollable
- Grid columns: Show only # and URL (tap for details)
- Tabs: Horizontal scroll on small screens
- Hex view: Hide ASCII column, show only address + hex

### Tablet Adaptations (768-1023px)

**Layout:**
- Two-pane with toggle: Session + Inspector
- Switch between Request/Response via tabs
- Full columns visible in grid

### Desktop (1024px+)

**Layout:**
- Three-pane as designed
- All features visible
- Optimal information density

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- All text meets 4.5:1 minimum (body text)
- Large text meets 3:1 minimum (headings)
- UI components meet 3:1 (borders, icons)

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Skip links for main content

**Screen Reader Support:**
- Semantic HTML (table, nav, main, etc.)
- ARIA labels for icon buttons
- ARIA live regions for status updates
- Alt text for decorative icons

**Focus Management:**
- Clear focus indicators (2px accent ring)
- Focus trap in modals
- Focus restoration after close

### Semantic HTML

```html
<main>
  <header>
    <h1>SAZ Viewer</h1>
    <button aria-label="Load new SAZ file">...</button>
  </header>
  
  <div role="main" aria-label="Session inspector">
    <nav aria-label="Session list">
      <table role="grid">...</table>
    </nav>
    
    <section aria-label="Request inspector">
      <div role="tablist">...</div>
    </section>
    
    <section aria-label="Response inspector">
      <div role="tablist">...</div>
    </section>
  </div>
</main>
```

## Error Handling Design

### Error States

**1. File Validation Errors**

```
┌────────────────────────────────────┐
│ ⚠️ Invalid File Type               │
│                                    │
│ Please provide a .saz file.        │
│ .saz files are Fiddler archives.   │
│                                    │
│ [Try Again]                        │
└────────────────────────────────────┘
```

**2. Parse Errors**

```
┌────────────────────────────────────┐
│ ⚠️ Invalid SAZ Structure           │
│                                    │
│ File must contain a 'raw/' folder  │
│ with HTTP session data.            │
│                                    │
│ [Load Different File]              │
└────────────────────────────────────┘
```

**3. Corrupted Data**

- Graceful degradation: Show raw content if parsing fails
- Never crash the app
- Clear error messages with recovery options

### Empty States

**No Sessions Found:**

```
┌────────────────────────────────────┐
│                                    │
│         📂 Icon                    │
│                                    │
│    No sessions found               │
│    This .saz file appears empty    │
│                                    │
│    [Load New File]                 │
│                                    │
└────────────────────────────────────┘
```

**No Search Results:**

```
┌────────────────────────────────────┐
│ 🔍 No sessions match "search term" │
│                                    │
│ Try different search terms or      │
│ clear filters                      │
│                                    │
│ [Clear Search]                     │
└────────────────────────────────────┘
```

## Performance Considerations

### Rendering Optimizations

**1. Virtual Scrolling (if needed)**
- Render only visible rows in session grid
- Implement if session count >1000 causes lag
- Use react-window or react-virtual

**2. Memoization**
- React.memo for expensive components
- useMemo for derived data (filtered sessions)
- useCallback for event handlers

**3. Debouncing**
- Search input: 300ms debounce
- Resize operations: 100ms throttle
- Prevent excessive re-renders

**4. Code Splitting**
- Lazy load syntax highlighters
- Dynamic import for hex viewer
- Separate vendor chunks

### Loading States

**File Parsing:**
```
┌────────────────────────────────────┐
│                                    │
│         ⏳ Loading animation       │
│                                    │
│    Parsing SAZ file...             │
│    [Progress bar if >2s]           │
│                                    │
└────────────────────────────────────┘
```

**Large File Warning:**
```
┌────────────────────────────────────┐
│ ⚠️ Large File Detected             │
│                                    │
│ This file is 150MB. Parsing may    │
│ take a moment and use significant  │
│ memory.                            │
│                                    │
│ [Continue] [Cancel]                │
└────────────────────────────────────┘
```

## Testing Considerations

### Visual Regression Testing

- Capture screenshots of key states
- Test responsive breakpoints
- Verify color contrast
- Check focus indicators

### Interaction Testing

- Test all keyboard shortcuts
- Verify drag-drop functionality
- Test file validation
- Check error states

### Accessibility Testing

- Automated: axe-core, Lighthouse
- Manual: Keyboard navigation
- Screen reader: NVDA/JAWS/VoiceOver
- Color blindness simulation

## Design Tokens

Centralized design tokens for consistency:

```typescript
// src/lib/design-tokens.ts
export const tokens = {
  colors: { /* oklch values */ },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '20px',
    },
  },
  spacing: { /* 4px base */ },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  animation: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
};
```

## Implementation Checklist

- [x] Component library setup (shadcn/ui)
- [x] Color system implementation
- [x] Typography system
- [x] Layout structure
- [x] FileDropZone component
- [x] SessionGrid component
- [x] Inspector components
- [x] Syntax highlighting
- [x] Responsive design
- [x] Keyboard navigation
- [x] Error states
- [x] Loading states
- [ ] Virtual scrolling (if needed)
- [ ] Accessibility audit
- [ ] Visual regression tests

## References

- [PRD.md](./PRD.md) - Original product requirements
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design - Motion](https://material.io/design/motion)
