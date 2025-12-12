# Testing Guide for TravelBuddy Frontend

This document provides information about the testing setup and how to run tests for the TravelBuddy frontend application.

## Testing Stack

- **Testing Framework**: [Vitest](https://vitest.dev/) - Fast, modern testing framework with built-in TypeScript support
- **Component Testing**: [React Testing Library](https://testing-library.com/react) - Testing library for React components
- **User Interaction**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - Simulating user interactions
- **DOM Assertions**: [@testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/) - Custom matchers for DOM assertions
- **Test Environment**: jsdom - Simulated browser environment for Node.js

## Running Tests

### Commands

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (useful for CI/CD)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Watch Mode

By default, `npm test` runs Vitest in watch mode, which:
- Automatically re-runs tests when files change
- Provides interactive filtering options
- Offers quick feedback during development

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- **HTML Report**: Open `coverage/index.html` in your browser for a visual representation
- **Text Report**: Displayed in the terminal after running coverage
- **JSON Report**: Machine-readable format for CI/CD integration

## Test Structure

### Test Files

Tests are co-located with their source files using the `.test.ts` or `.test.tsx` extension:

```
src/
├── app/
│   └── utilies/
│       └── lib/
│           ├── tripStats.ts
│           └── tripStats.test.ts          ← Unit tests
├── hooks/
│   ├── use-mobile.ts
│   └── use-mobile.test.ts                 ← Hook tests
├── components/
│   ├── login-form.tsx
│   └── login-form.test.tsx                ← Component tests
└── stores/
    ├── accommodation-store.ts
    └── accommodation-store.test.ts         ← Store tests
```

### Test Categories

#### 1. Unit Tests (Utility Functions)

Location: [`src/app/utilies/lib/tripStats.test.ts`](src/app/utilies/lib/tripStats.test.ts)

Tests for pure utility functions that handle:
- Date calculations (getNights, getLongestPlannedTrip)
- Cost calculations (getTotalPlannedCosts, getTotalBudget)
- Distance calculations (getTotalKMs)
- Trip status categorization (getTripStatusTotals, getNextIncomingTrip)

#### 2. API Service Tests

Location: [`src/app/utilies/api/weather.test.ts`](src/app/utilies/api/weather.test.ts)

Tests for API integration with mocked fetch:
- Successful API calls
- Error handling
- URL construction
- Response parsing

#### 3. Custom Hook Tests

Location: [`src/hooks/use-mobile.test.ts`](src/hooks/use-mobile.test.ts)

Tests for React hooks using `renderHook`:
- Media query detection
- Window resize handling
- Listener cleanup

#### 4. Component Tests

Location: [`src/components/login-form.test.tsx`](src/components/login-form.test.tsx)

Tests for React components:
- Rendering UI elements
- Form validation
- User interactions
- Loading states
- Error handling

#### 5. State Management Tests

Location: [`src/stores/accommodation-store.test.ts`](src/stores/accommodation-store.test.ts)

Tests for Zustand stores:
- Initial state
- State updates
- State persistence across hook instances

## Writing Tests

### Example: Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Example: Testing a React Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Example: Testing a Custom Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('should update value', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue(newValue);
    });

    expect(result.current.value).toBe(newValue);
  });
});
```

## Mocking

### Mocking External Dependencies

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mocked' }),
});
```

### Mocking Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

Focus on testing what the user sees and experiences, not internal implementation details.

```typescript
// Good
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// Avoid
expect(component.state.isSubmitting).toBe(false);
```

### 2. Use Semantic Queries

Prefer queries that reflect how users interact with the page:

```typescript
// Preferred order
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// Avoid when possible
screen.getByTestId('submit-button')
```

### 3. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 4. Use Descriptive Test Names

```typescript
// Good
it('should display error message when email is invalid', () => {});

// Not ideal
it('email validation', () => {});
```

### 5. Test Edge Cases

Don't just test the happy path:

```typescript
describe('getNights', () => {
  it('should calculate nights between two dates', () => {});
  it('should return at least 1 night for same day', () => {});
  it('should handle invalid dates gracefully', () => {});
});
```

## Configuration

### TypeScript Config

Test files are excluded from the Next.js build in [`tsconfig.json`](tsconfig.json):

```json
{
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "src/test"
  ]
}
```

This ensures test files don't interfere with production builds.

### Vitest Config

The Vitest configuration is in [`vitest.config.ts`](vitest.config.ts):

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

Global test setup is in [`src/test/setup.ts`](src/test/setup.ts):

- Imports `@testing-library/jest-dom` for custom matchers
- Configures automatic cleanup after each test
- Mocks Next.js navigation
- Mocks window.matchMedia

## Coverage Goals

Target coverage thresholds:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Priority areas for testing:
1. Business logic and utility functions
2. Form validation and user input handling
3. API integrations
4. State management
5. Critical user flows

## Troubleshooting

### Common Issues

#### Tests failing with "Cannot find module"

Make sure path aliases are configured correctly in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

#### Tests hanging or timing out

Ensure you're using `await` with async operations:

```typescript
await user.click(button);
await waitFor(() => expect(mockFn).toHaveBeenCalled());
```

#### Mock not working

Clear mocks between tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

## CI/CD Integration

For continuous integration, use:

```bash
npm run test:run
```

This runs tests once and exits, making it suitable for CI/CD pipelines.

Example GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write tests alongside your code
2. Ensure existing tests still pass
3. Aim for meaningful coverage, not just high percentages
4. Follow the existing test patterns and conventions
