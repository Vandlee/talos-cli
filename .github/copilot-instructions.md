# Talos CLI - AI Agent Instructions

## Project Overview

**talos-cli** is a modern TypeScript-based CLI application using pnpm package manager. The project follows a modular architecture with clear separation of concerns: commands, utilities, and type definitions.

## Architecture & Structure

### Directory Layout

```
src/
├── commands/        # Individual CLI command handlers
├── utils/          # Utility functions and shared logic
├── types/          # TypeScript type definitions and interfaces
└── index.ts        # Entry point / main CLI router
```

### Key Design Principles

1. **Modular Commands**: Each command is self-contained and should export a handler with signature `(args: CommandArgs) => Promise<void>`
2. **Type-First Development**: All types defined in `src/types/` to maintain single source of truth
3. **Utility Reusability**: Common logic lives in `src/utils/` and is shared across commands
4. **Error Handling**: Use custom error classes from `utils/errors` and propagate properly

## Technology Stack

### Core

- **TypeScript**: ES2020 target, strict mode, CommonJS modules
- **Package Manager**: pnpm 10.28.2 (use `pnpm install` not npm/yarn)
- **Entry Framework**: Recommend [Commander.js](https://github.com/tj/commander.js) or [yargs](https://github.com/yargs/yargs) for argument parsing

### Build & Development

- **TypeScript Compiler**: `tsc` for compilation to `./dist`
- **Dev Server**: Use `tsx` or `ts-node` for local development
- **Build Output**: JavaScript + source maps in `./dist`

### Testing

- **Framework**: [Vitest](https://vitest.dev/) (faster than Jest for this project)
- **Structure**: Tests mirror `src/` structure with `.test.ts` suffix
- **Convention**: Unit tests in `tests/unit/`, integration tests in `tests/integration/`

### Code Quality

- **Linter**: ESLint with TypeScript support
- **Formatter**: Prettier (configure with `.prettierrc`)
- **Pre-commit Hooks**: Use husky + lint-staged to prevent bad commits

## Development Workflows

### Local Development

```bash
# Install dependencies
pnpm install

# Run CLI in development
pnpm tsx src/index.ts [command] [args]

# Watch mode (recompile on changes)
pnpm tsc --watch
```

### Build for Production

```bash
# Compile TypeScript to JavaScript
pnpm build  # runs: tsc

# Create distributed package
pnpm dist   # bundle for npm/git releases
```

### Testing & Quality Checks

```bash
pnpm test           # Run all tests
pnpm lint           # ESLint check
pnpm format         # Prettier format
pnpm type-check     # TypeScript type checking
```

## Code Patterns & Conventions

### Command Implementation Pattern

```typescript
// src/commands/myCommand.ts
import { Command } from "commander";
import { logger } from "@/utils/logger";

export const myCommand = new Command("my-command")
  .description("Description of command")
  .option("-f, --flag <value>", "Flag description")
  .action(async (options) => {
    try {
      // Command logic here
      logger.success("Operation completed");
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  });
```

### Type Definition Pattern

```typescript
// src/types/index.ts
export interface CommandArgs {
  flag?: string;
  verbose?: boolean;
}

export interface CLIConfig {
  debug: boolean;
  output: "json" | "text";
}
```

### Utility Function Pattern

```typescript
// src/utils/helpers.ts
export function validateInput(input: string): boolean {
  // Validation logic
  return true;
}

// Use path alias: import { validateInput } from '@/utils/helpers';
```

## Configuration Files

### tsconfig.json

- **Target**: ES2020 (modern Node.js compatibility)
- **baseUrl**: `./src` enables path aliases (`@/` imports)
- **paths**: Defines import shortcuts for cleaner requires
- **strict**: `true` - enforce strict type checking

### pnpm-workspace.yaml (if monorepo)

Define workspace structure for multi-package projects.

## Error Handling Strategy

1. Create custom error classes extending Error
2. Use specific error types (ValidationError, ConfigError, etc.)
3. Catch at command level, log with context, exit with appropriate code
4. Return exit codes: 0 (success), 1 (general error), 2 (usage error)

## NPM Package Setup

Once ready for publishing:

```json
{
  "bin": {
    "talos": "./dist/index.js" // Make CLI globally executable
  },
  "files": ["dist"] // Only ship compiled JS
}
```

## Testing Best Practices

- Test command handlers in isolation with mocked dependencies
- Use fixtures for test data in `tests/fixtures/`
- Test error paths and edge cases explicitly
- Integration tests verify command end-to-end behavior
- Aim for >80% code coverage on `src/`

## Git & Release Workflow

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Semantic versioning (MAJOR.MINOR.PATCH)
- GitHub Actions: Automate lint, test, build on PRs
- Pre-release workflow: `alpha`, `beta` tags before major releases

## Key Dependencies to Add

```json
{
  "dependencies": {
    "commander": "^11.0.0", // CLI argument parsing
    "chalk": "^5.0.0", // Terminal colors
    "ora": "^8.0.0" // Loading spinners
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0",
    "tsx": "^4.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

## Question for Refinement

Would you like me to:

1. Generate actual configuration files (eslint, prettier, vitest, husky)?
2. Create starter command/utility implementations?
3. Set up GitHub Actions CI/CD workflows?
4. Add more specific guidance on particular technologies?
