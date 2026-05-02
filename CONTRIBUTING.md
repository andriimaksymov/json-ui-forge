# Contributing

## Local Setup

```bash
npm install
npm run dev
```

## Before Shipping Changes

```bash
npm run format:check
npm run check
npm run coverage
```

`npm run check` runs type checking, linting, unit tests, and the production build.

## Project Guidelines

- Keep the app frontend-only and local-state-only.
- Put JSON parsing, schema detection, and code generation logic in `src/utils`.
- Add or update unit tests for utility behavior changes.
- Keep UI components focused and avoid adding backend, auth, database, or paid API dependencies.
