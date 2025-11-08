# Planning Guide

A 100% client-side, serverless web application enabling macOS, Linux, and Windows users to securely inspect Telerik Fiddler .saz files in-browser without uploading data or installing desktop software.

**Experience Qualities**:
1. **Trustworthy** - All parsing happens locally; no data leaves the browser, reinforcing security and privacy for sensitive HTTP captures
2. **Effortless** - Drag-drop interaction with instant parsing and automatic content-type detection eliminates friction from the inspection workflow
3. **Professional** - Clean three-pane layout with syntax highlighting and hex views provides the technical depth required for debugging HTTP sessions

**Complexity Level**: Light Application (multiple features with basic state)
  - Handles file parsing, session management, and multiple inspector views with client-side state, but no user accounts or server integration

## Essential Features

**File Loading (Drag & Drop / File Picker)**
- Functionality: Accept .saz files via drag-drop zone or "Load New File" button in global header, validate file type and SAZ structure
- Purpose: Provide frictionless entry point that works across all platforms; global header button enables loading new files without losing current context
- Trigger: User drags .saz file over drop zone or clicks "Load New File" in header
- Progression: Hover feedback → Drop → Loading state → Session grid populated → Three-pane layout displayed
- Success criteria: Valid .saz files parse within 2 seconds; invalid files show specific error messages; "Load New File" button persistently available in global header

**Session List Display**
- Functionality: Professional data grid with sortable columns (#, Status, Method, URL), search filtering, and method filtering for rapid session location
- Purpose: Enable rapid location of target requests (e.g., "find all 404 errors") by sorting status codes or filtering by HTTP method without manual scanning
- Trigger: SAZ file successfully parsed
- Progression: Parse complete → Sessions display in grid → User sorts by status/method/URL → Clicks row to inspect → Request/Response panels update
- Success criteria: Grid displays 1000+ sessions without performance degradation; sorting is instant; active session visually highlighted; columns are clearly labeled and aligned

**Session Inspector with Auto-Detection**
- Functionality: Multi-tab inspector (Headers/Raw/JSON/XML/HexView) that auto-selects appropriate tab based on Content-Type; Response panel shows status code and size in header
- Purpose: Eliminate manual tab hunting; immediately show JSON responses in formatted view, binary content in hex view; provide at-a-glance response metadata
- Trigger: User clicks session in grid
- Progression: Click session → Parse headers → Detect content type → Auto-select inspector tab → Display formatted content with status/size visible
- Success criteria: JSON/XML auto-formatted with syntax highlighting; binary content renders in hex view; response header shows "Status: 404 Not Found | Size: 391 B"; headers display in clean two-column table

## Edge Case Handling

- **Invalid File Type** - Show error "Invalid File Type. Please provide a .saz file." and maintain drop zone
- **Corrupted SAZ Structure** - Show error "Invalid SAZ Structure. File must contain a 'raw/' folder." if zip lacks raw/ directory
- **Malformed HTTP** - Display unparsed raw content in Raw tab if header parsing fails; never crash
- **Large Files** - Use async parsing with loading indicator; maintain responsiveness for 100MB+ files
- **Missing Response Body** - Gracefully handle sessions with headers-only responses (e.g., 204 No Content)

## Design Direction

The interface should feel like a professional developer tool—serious, precise, and utilitarian—with a minimal design that maximizes content visibility and minimizes visual noise, echoing the focused efficiency of tools like Chrome DevTools or VS Code.

## Color Selection

Monochromatic scheme with strategic accent color for active states
- **Primary Color**: Deep slate gray (oklch(0.25 0.01 250)) - Communicates technical professionalism and reduces eye strain during extended debugging sessions
- **Secondary Colors**: Light neutral grays for panels and borders, creating subtle visual separation without distraction
- **Accent Color**: Electric blue (oklch(0.60 0.20 240)) - Highlights active session and selected tabs, guiding attention to current inspection target
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0 0)): Dark slate text (oklch(0.20 0.01 250)) - Ratio 12.1:1 ✓
  - Card (White oklch(1 0 0)): Dark slate text (oklch(0.20 0.01 250)) - Ratio 14.5:1 ✓
  - Primary (Deep Slate oklch(0.25 0.01 250)): White text (oklch(1 0 0)) - Ratio 11.8:1 ✓
  - Accent (Electric Blue oklch(0.60 0.20 240)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Muted (Medium Gray oklch(0.92 0 0)): Medium slate text (oklch(0.45 0.01 250)) - Ratio 5.2:1 ✓

## Font Selection

Monospaced font for code/data display ensures alignment of HTTP headers and hex bytes, while clean sans-serif for UI labels maintains readability and professional aesthetic.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter SemiBold / 20px / -0.01em letter spacing
  - H2 (Panel Titles): Inter Medium / 14px / -0.005em letter spacing
  - Body (Session List): Inter Regular / 13px / normal letter spacing
  - Code (Headers, JSON, Raw): JetBrains Mono / 13px / normal letter spacing / 1.6 line height
  - Mono Small (Hex Addresses): JetBrains Mono / 12px / normal letter spacing

## Animations

Minimal, functional animations that confirm interactions without delaying workflows—fast tab switches and subtle list item highlights that respect the user's urgency when debugging production issues.

- **Purposeful Meaning**: Quick fade transitions (150ms) for tab switching communicate responsiveness; active session highlight with subtle background color transition confirms selection
- **Hierarchy of Movement**: Session list item hover (100ms) indicates interactivity; inspector tab content fade-in (200ms) provides visual continuity during content switching

## Component Selection

- **Components**:
  - `Card` - Session grid and inspector panels with subtle borders for visual separation
  - `Tabs` - Inspector tab navigation (Headers/Raw/JSON/XML/Hex) with custom Tailwind active state using accent color
  - `ScrollArea` - Session grid and inspector content for clean overflow handling
  - `Button` - Global header "Load New File" action and filter dropdown trigger
  - `Alert` - Error message display with destructive variant for file validation failures
  - `Table` - Session grid with sortable column headers; Headers display in key-value format for scannability
  - `Input` - Search filter in session grid header
  - `DropdownMenu` - Method filter with checkbox items for multi-select filtering
  - `ResizablePanel` - Three-pane layout with adjustable panel sizes
  
- **Customizations**:
  - Custom `FileDropZone` component with dashed border and hover state for drag-over feedback
  - Custom `SessionGrid` component with sortable columns, search, and method filtering
  - Custom `HexView` component rendering address/bytes/ASCII in monospaced grid layout
  - Custom `SyntaxHighlighter` wrapper around highlight.js with theme matching color scheme
  
- **States**:
  - Buttons: Subtle hover brightness increase (hover:brightness-110), active state with slight scale (active:scale-98)
  - Session grid rows: Hover background (hover:bg-muted/40), active session with accent background (bg-accent/15)
  - Inspector tabs: Active tab with accent bottom border (border-b-accent), inactive tabs muted (text-muted-foreground)
  - Column headers: Hover state for sortable columns with sort direction indicator (caret up/down)
  
- **Icon Selection**:
  - `FolderOpen` - Global "Load New File" button
  - `FileArchive` - SAZ file type indicator in drop zone
  - `Warning` - Error message alerts
  - `Code` - Raw/JSON tab icons
  - `ListBullets` - Headers tab icon
  - `FileMagnifyingGlass` - Hex tab icon
  - `MagnifyingGlass` - Search input icon
  - `FunnelSimple` - Method filter dropdown icon
  - `CaretUp/CaretDown` - Sort direction indicators in grid headers
  
- **Spacing**:
  - Global header: px-6 py-2.5 for compact, persistent top bar
  - Panel padding: p-4 for main containers, p-3 for panel headers
  - Session grid: Tight row spacing for information density; px-3 py-2.5 for cells
  - Inspector content padding: p-4 for code blocks with breathing room
  - Grid gaps: Resizable panels with 1px handles for precise layout control
  
- **Mobile**:
  - Vertical stack layout on <768px: Global header → Session grid → Request panel → Response panel (full width stacked)
  - Session grid becomes fixed-height scrollable panel (max-h-80) to ensure inspectors remain accessible
  - Grid columns collapse: Show only # and URL columns on narrow screens; status/method visible on row tap
  - Tabs switch to scrollable horizontal list on mobile
  - Hex view switches to single-column (address + bytes only), ASCII column hidden
