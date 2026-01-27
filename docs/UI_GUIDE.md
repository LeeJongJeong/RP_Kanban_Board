# UI/UX & Design Guide

## 📱 Mobile Optimization Strategy

### 1. Responsive Header
- **Desktop (≥640px)**: Single row layout with all controls visible.
- **Mobile (<640px)**: 
  - Hamburger menu toggle.
  - Collapsible menu panel for controls.
  - Simplified title typography (`text-lg`).
  - Unified Date/Week selector matching desktop options.

### 2. Kanban Board Layout
- **Status View**:
  - Desktop: 4 columns
  - Tablet: 2 columns
  - Mobile: 1 column stack
- **Engineer/DBMS View**:
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 1 column
- **Minimum Width**: Columns have `min-w-[280px]` on mobile for readability.

### 3. Touch Interactions
- Implemented custom `TouchHandler` for Drag & Drop support on mobile.
- **Events**: `touchstart`, `touchmove`, `touchend` mapped to drag logic.
- **Feedback**: Scale and opacity changes during interaction.

---

## 🎨 Component Standards

### 1. Ticket Cards
- **Typography**: Scaled down fonts (`text-[10px]` ~ `text-sm`) for density.
- **Truncation**: `line-clamp-2` for descriptions to prevent card expansion.
- **Badges**: Unified color coding for Severity (Critical=Red to Low=Green).

### 2. Modals (Dialogs)
**Standard Behavior**:
- **Centering**: Always use `flex items-center justify-center` to center vertically and horizontally.
- **Spacing**: Use `my-8` to ensure vertical breathing room on tall screens.
- **Sizing**: 
  - Width: `w-full` with `max-w-*` limits.
  - Height: `max-h-[85vh]` to prevent viewport overflow.
- **Close Button**:
  - Style: Circular, easy-to-hit touch target (`p-2` or `p-4`).
  - Position: Inside header or top-right, always visible without scrolling.
  - Icon: FontAwesome `times` icon.

### 3. Controls
- **Close Icons**: Consistent grey `x` icon in headers for all modals.
- **Dropdowns**: Native `<select>` elements used for mobile reliability.

---

## 🛠 CSS Utilities (Tailwind)
Commonly used patterns in this project:

| Pattern | Usage |
|---------|-------|
| `hidden sm:flex` | Hide on mobile, show on tablet+ |
| `grid-cols-1 sm:grid-cols-2` | Stack on mobile, grid on tablet |
| `fixed inset-0 bg-black/50` | Modal backdrop overlay |
