# JSON → UI

Turn pasted JSON into an editable form, table preview, TypeScript types, and React component code.

## Features

- JSON editor with format, clear, example, debounce parsing, and friendly errors
- Recursive form generation for strings, numbers, booleans, nulls, arrays, and nested objects
- Table preview for objects, arrays of objects, arrays of primitives, and primitive roots
- TypeScript interface generation
- React `GeneratedForm` code generation with controlled inputs
- Copy buttons with success feedback
- Fully responsive Vite + React + TypeScript + Tailwind app
- Rich previews for image URLs, inline SVG strings, emoji, and links

## Getting Started

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run coverage
npm run build
npm run preview
```

Use `npm run check` before shipping changes. It runs type checking, linting, tests, and the production build.
Use `npm run coverage` to verify utility coverage gates.

## Project Structure

```text
src/
  components/  UI components
  types/       Shared JSON and schema types
  utils/       Parsing, schema detection, code generation, render hints, and tests
```

## Notes

This is an MVP with local state only. It does not use a backend, database, authentication, paid APIs, or full JSON Schema validation.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local contribution commands and project guidelines.

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- npm `>=10`
