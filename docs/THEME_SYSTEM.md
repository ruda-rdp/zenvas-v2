# Theme System - Zenvas v2

## Overview

Zenvas v2 implements a dark/light theme system with system preference detection and persistent user preference.

## Theme Toggle Location

Theme settings are located in **Settings > Appearance** page, not in the header.

## Architecture

### Components

1. **ThemeProvider** (`src/components/ThemeProvider.tsx`)
   - React Context for theme state management
   - Handles theme persistence via localStorage
   - Detects system preference via `prefers-color-scheme`
   - Applies `dark` class to `<html>` element

### Theme Options

| Mode   | Description                          |
|--------|--------------------------------------|
| `dark` | Always use dark theme                 |
| `light`| Always use light theme                |
| `system`| Follow system preference             |

## Implementation

### ThemeProvider Setup

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### CSS Variables

```css
/* src/app/globals.css */

:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted: #f5f5f5;
  --border: #e5e5e5;
}

.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --muted: #27272a;
  --border: #3f3f46;
}
```

## Usage in Components

### Dark Mode Classes

Always use `dark:` prefix for dark mode styles:

```tsx
// ✅ Correct - Full dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// ❌ Wrong - Only works in light mode
<div className="bg-white text-gray-900">
```

### Color Checklist:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `bg-white` | `dark:bg-gray-900` |
| Text Primary | `text-gray-900` | `dark:text-gray-100` |
| Text Secondary | `text-gray-600` | `dark:text-gray-400` |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Cards/Surfaces | `bg-white` | `dark:bg-gray-800` |
| Buttons Primary | `bg-blue-600` | `dark:bg-blue-600` |
| Inputs | `bg-white border-gray-300` | `dark:bg-gray-700 dark:border-gray-600` |

## Default Theme

**Dark mode is the default** for better readability in creative workflows and video editing environments.

## Testing

1. Go to Settings > Appearance
2. Toggle between Dark/Light/System themes
3. Verify persistence by refreshing the page
4. Test system preference changes in OS settings
5. Check all pages for proper dark/light styling

## Files Modified

- `src/app/layout.tsx` - Added ThemeProvider
- `src/app/globals.css` - Added CSS variables
- `src/components/ThemeProvider.tsx` - Theme context
- `src/app/(auth)/layout.tsx` - Clean layout
- `src/app/(auth)/register/page.tsx` - Dark mode styling
- `src/app/(auth)/login/page.tsx` - Dark mode styling
- `src/app/(dashboard)/layout.tsx` - Clean layout
- `src/app/(dashboard)/onboarding/page.tsx` - Dark mode styling
- `src/app/(dashboard)/settings/page.tsx` - Appearance tab with theme selector

## ThemeToggle Removed

ThemeToggle was removed from headers and consolidated into Settings > Appearance page for cleaner UI.

## Future Enhancements

- [ ] Smooth transition animations between themes
- [ ] Custom accent color picker
- [ ] Per-brand theme preferences
