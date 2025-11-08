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
- Functionality: Accept .saz files via drag-drop zone or file input button, validate file type and SAZ structure
- Purpose: Provide frictionless entry point that works across all platforms and enterprise environments
- Trigger: User drags .saz file over drop zone or clicks "Load SAZ File" button
- Progression: Hover feedback → Drop → Loading state → Session list populated → Drop zone hidden
- Success criteria: Valid .saz files parse within 2 seconds; invalid files show specific error messages without breaking UI

**Session List Display**
- Functionality: Scrollable list showing all HTTP sessions with ID, method, URL, and status code for quick scanning
- Purpose: Enable rapid location of target requests (e.g., "find the 500 error") without opening each session
- Trigger: SAZ file successfully parsed
- Progression: Parse complete → Sessions sorted numerically → List renders → User scans for target session
- Success criteria: List displays 100+ sessions without performance degradation; active session visually highlighted

**Session Inspector with Auto-Detection**
- Functionality: Multi-tab inspector (Raw/Headers/JSON/XML/HexView) that auto-selects appropriate tab based on Content-Type
- Purpose: Eliminate manual tab hunting; immediately show JSON responses in formatted view, binary content in hex view
- Trigger: User clicks session in list
- Progression: Click session → Parse headers → Detect content type → Auto-select inspector tab → Display formatted content
- Success criteria: JSON/XML auto-formatted with syntax highlighting; binary content renders in standard hex editor format; raw view always available

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
  - `Card` - Session list and inspector panels with subtle borders for visual separation
  - `Tabs` - Inspector tab navigation (Raw/Headers/JSON/XML/HexView) with custom Tailwind active state using accent color
  - `ScrollArea` - Session list and inspector content for clean overflow handling
  - `Button` - File picker trigger with ghost variant for minimal visual weight
  - `Alert` - Error message display with destructive variant for file validation failures
  - `Table` - Headers display in key-value format with alternating row backgrounds for scannability
  
- **Customizations**:
  - Custom `FileDropZone` component with dashed border and hover state for drag-over feedback
  - Custom `HexView` component rendering address/bytes/ASCII in monospaced grid layout
  - Custom `SyntaxHighlighter` wrapper around highlight.js with theme matching color scheme
  
- **States**:
  - Buttons: Subtle hover brightness increase (hover:brightness-110), active state with slight scale (active:scale-98)
  - Session list items: Hover background (hover:bg-muted), active session with accent background (bg-accent/10 border-l-accent)
  - Inspector tabs: Active tab with accent underline (border-b-accent), inactive tabs muted (text-muted-foreground)
  
- **Icon Selection**:
  - `UploadSimple` - File picker button (conveys upload action without actual upload)
  - `FileArchive` - SAZ file type indicator in drop zone
  - `Warning` - Error message alerts
  - `Code` - Raw tab icon
  - `ListBullets` - Headers tab icon
  
- **Spacing**:
  - Panel padding: p-6 for main containers, p-4 for nested content
  - Session list gap: gap-0.5 for tight vertical rhythm enabling more sessions visible
  - Inspector content padding: p-4 for code blocks with breathing room
  - Grid gaps: gap-4 for major layout divisions (session list | inspector split)
  
- **Mobile**:
  - Vertical stack layout on <768px: Drop zone → Session list → Inspector (full width, collapsible sections)
  - Session list becomes fixed-height scrollable panel (max-h-64) to ensure inspector remains above fold
  - Tabs switch to compact icon-only view on mobile with tooltips for labels
  - Hex view switches to single-column (address + bytes only) on narrow screens, ASCII column hidden
