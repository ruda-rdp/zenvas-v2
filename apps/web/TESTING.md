# Testing Guide

This document describes the testing strategy and conventions for Zenvas.

---

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## Test Framework

**Vitest** is used as the test runner with V8 coverage provider.

- **Config:** `vitest.config.ts`
- **Location:** Tests are co-located with source files in `__tests__/` directories

---

## Test Conventions

### File Naming

```
src/lib/authorize.ts          →  src/lib/__tests__/authorize.test.ts
src/lib/superadmin.ts         →  src/lib/__tests__/superadmin.test.ts
```

### Test Structure

```typescript
describe("functionName()", () => {
  describe("specific behavior", () => {
    it("should do X when Y", () => {
      // test implementation
    });

    it("should not do Z", () => {
      // test implementation
    });
  });
});
```

### Mocking

- Use `vi.mock()` for module mocks
- Use `vi.mocked()` to type mock functions
- Reset mocks with `vi.clearAllMocks()` or `vi.resetAllMocks()` in `afterEach`

---

## What's Being Tested

### Unit Tests (No DB)

| Module | Function | Coverage |
|--------|----------|----------|
| `lib/authorize.ts` | `can()` | Full role × action matrix |
| `lib/authorize.ts` | `enforceConfidentiality()` | EDITOR field stripping |
| `lib/authorize.ts` | `validateTaskDepth()` | Max 3 nesting levels |
| `lib/superadmin.ts` | `isSuperAdmin()` | Email matching, env config |
| `lib/superadmin.ts` | `requireSuperAdmin()` | Error throwing |

### Critical Security Invariants Tested

1. **EDITOR Confidentiality:** Money fields (`payoutAmount`, `price`, `amount`, `budget`, `total`, etc.) are stripped for EDITOR role
2. **RBAC Matrix:** Each role has exactly the permissions defined in `rolePermissions`
3. **Task Depth:** Max 3 nesting levels enforced (root + 2 subtask levels)
4. **Super Admin:** Only users with matching email in `SUPERADMIN_EMAIL` can access

---

## Adding New Tests

### 1. Create test file

```bash
# If testing src/lib/foo.ts
touch src/lib/__tests__/foo.test.ts
```

### 2. Import the module to test

```typescript
import { describe, it, expect } from "vitest";
import { functionName } from "../foo";
```

### 3. Write tests following conventions

```typescript
describe("functionName()", () => {
  it("should return X when given Y", () => {
    const result = functionName(input);
    expect(result).toBe(expected);
  });
});
```

### 4. Run tests

```bash
npm test
```

---

## Mocking Examples

### Mock environment variables

```typescript
const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// In test
process.env.SOME_VAR = "test-value";
```

### Mock database (Prisma)

```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(mockUser),
    },
  },
}));
```

### Mock auth session

```typescript
vi.mock("next-auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-1",
      email: "test@example.com",
      role: "OWNER",
      // ... other fields
    },
  }),
}));
```

---

## CI/CD Integration

Add to your CI pipeline:

```bash
npm test
```

Tests should pass before merging any PR.

---

## Coverage Goals

| Module | Current | Target |
|--------|---------|--------|
| `lib/authorize.ts` | 100% | 100% |
| `lib/superadmin.ts` | 100% | 100% |

---

*Last updated: 2026-07-24*
