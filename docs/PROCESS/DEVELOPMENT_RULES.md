# Development Rules - Zenvas v2

## Core Principle: Doc-Implementation Synchronization

> **Goal:** Every phase must have synchronized documentation and implementation. They evolve together.

## Core Principles

### 1. Documentation Guides, Not Dictates
**Before writing any code:**
- Read the existing documentation (docs/)
- Understand the foundation, philosophy, and architecture
- Align implementation with established patterns

**Documentation is a living document:**
- Not set in stone - evolves with discoveries
- If something fundamental is discovered during development, update the docs
- User confirms major doc changes

### 2. Sync at Every Phase
**The Synchronization Loop:**
1. Read docs → Understand the vision
2. Implement → Apply the vision to code
3. Discover → Find new insights during implementation
4. Document → Update relevant docs if fundamental
5. Confirm → Get user approval for significant changes
6. Repeat → Continue with aligned understanding

**This is NOT a one-time thing - it's continuous throughout development.**

### 2. Ship Complete, Not Half-Done
**The Zenvas Legacy Problem:**
- Legacy version had endless loops of "code → try → change → try again"
- Never shipped as a complete product
- Too many experiments, not enough product

**The Rule:**
- Each implementation should be complete and usable
- If a feature is started, it must be finished
- No partial implementations that "will be completed later"
- If something needs to be scoped out, document it clearly

### 3. Test Before Moving On
- Always test what you build
- Verify the full flow works end-to-end
- Don't assume it works because the code looks right

## Implementation Checklist

For every feature/fix:

- [ ] Read relevant documentation first
- [ ] Understand existing patterns
- [ ] Implement completely
- [ ] Test thoroughly
- [ ] Update docs if fundamental changes discovered
- [ ] Confirm doc updates with user if significant

## Checkpoint Rule (MANDATORY)

### Why Checkpoints?
- Agent baru perlu tau state project
- Smooth handoff antar session
- History project evolution

### When to Create Checkpoint:
- [ ] Setelah selesai feature/bug fix
- [ ] Sebelum commit
- [ ] Setiap selesai sprint
- [ ] Saat project reach milestone

### Checkpoint Checklist:
1. Update `docs/CHECKPOINT.md`
2. Git commit dengan message jelas
3. Catat apa yang selesai
4. Catat apa yang next
5. Update testing checklist

### New Agent Resume Protocol:
1. Baca `docs/CHECKPOINT.md` dulu
2. Check `docs/DEVELOPMENT_RULES.md`
3. Run `npx prisma studio` - lihat data
4. Run `npm run dev` - start dev
5. Semua API routes ada di `src/app/api/`

## Theme System Rules

### Dark Mode by Default
- Default theme is **dark mode**
- All new components MUST support dark mode
- Use Tailwind's `dark:` prefix for dark mode styles

### Dark Mode Pattern:
```tsx
// ✅ Correct
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// ❌ Wrong - Only works in light mode
<div className="bg-white text-gray-900">
```

### Color Checklist:
- Background: `bg-white dark:bg-gray-900`
- Text: `text-gray-900 dark:text-gray-100`
- Borders: `border-gray-200 dark:border-gray-700`
- Cards/Surfaces: `bg-white dark:bg-gray-800`
- Muted/Secondary: `text-gray-500 dark:text-gray-400`

## File Naming Conventions

### Components
- PascalCase: `ThemeProvider.tsx`, `DashboardSidebar.tsx`
- Location: `src/components/` or `src/components/[feature]/`

### Pages
- kebab-case: `settings/page.tsx`, `projects/page.tsx`
- Location: `src/app/(dashboard)/` or `src/app/(auth)/`

### API Routes
- kebab-case: `settings/organization/route.ts`
- Location: `src/app/api/[feature]/route.ts`

## Code Review Questions

Before completing any task, verify:

1. **Does it work?** Test the full flow
2. **Is it complete?** No TODOs or placeholders
3. **Is it documented?** Relevant docs updated
4. **Does it follow patterns?** Consistent with codebase
5. **Does it support dark mode?** If applicable

## When You Discover Something New

If during development you find:
- A better architectural approach
- A missing piece in the design
- A fundamental assumption that's wrong

**Steps:**
1. Pause and assess if it's truly fundamental
2. Document the finding
3. Propose the change to user
4. Get confirmation before updating docs
5. Update only the affected documentation

## Documentation Structure

| Document | Purpose |
|----------|---------|
| `FOUNDATION.md` | Core concepts, values, purpose |
| `PHILOSOPHY.md` | Design philosophy, principles |
| `PROJECT_OS.md` | Project structure, architecture |
| `HUMAN_CAPITAL_OS.md` | Team roles, permissions |
| `BUSINESS_OS.md` | Business logic, workflows |
| `UX_MODES.md` | UI/UX patterns, modes |
| `THEME_SYSTEM.md` | Dark/light mode implementation |
| `MVP_ROADMAP.md` | Current priorities |

## Version History

| Date | Change |
|------|--------|
| 2026-07-21 | Initial rules document |
