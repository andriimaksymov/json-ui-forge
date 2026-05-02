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

## Getting Started

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Notes

This is an MVP with local state only. It does not use a backend, database, authentication, paid APIs, or full JSON Schema validation.
