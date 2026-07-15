# Learn React Next

This first project is intentionally **React only**. Despite the folder name, it
contains no Next.js, server-side rendering, routing, API, Tailwind, or state
management library yet.

The goal is to learn React fundamentals first and build a separate Next.js
project afterward.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

The included `.nvmrc` selects Node 22 when using NVM.

## Start the project

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal, normally
`http://localhost:5173`.

## Available commands

```bash
npm run dev          # Start the Vite development server
npm run build        # Type-check and create a production build
npm run preview      # Preview the production build
npm run typecheck    # Run TypeScript checks
npm run lint         # Check code with ESLint
npm run lint:fix     # Fix ESLint issues where possible
npm run format       # Format the project with Prettier
npm run format:check # Check formatting without changing files
npm run check        # TypeScript + ESLint + Prettier checks
```

## What was added

1. **Vite** provides the development server and production build.
2. **React** renders the user interface.
3. **TypeScript** adds types to components, props, state, and events.
4. **ESLint** checks code quality and React Hooks rules.
5. **Prettier** handles code formatting separately from ESLint.
6. **VS Code settings** enable format-on-save and ESLint fixes when the
   recommended extensions are installed.

## Important files

- `index.html`: the HTML entry point containing `<div id="root">`.
- `src/main.tsx`: mounts the React application into `#root`.
- `src/App.tsx`: the main component with state, events, and a derived value.
- `src/components/WelcomeCard.tsx`: a child component with typed props.
- `src/index.css`: global CSS.
- `src/App.css`: component/page CSS.
- `vite.config.ts`: Vite configuration and React plugin.
- `eslint.config.js`: modern ESLint flat configuration.
- `prettier.config.mjs`: Prettier formatting rules.
- `tsconfig.app.json`: TypeScript configuration for browser code.
- `tsconfig.node.json`: TypeScript configuration for Vite's Node-side config.

## Vue to React mapping used here

| Vue / Nuxt         | React in this project                  |
| ------------------ | -------------------------------------- |
| `App.vue`          | `App.tsx`                              |
| `main.ts`          | `main.tsx`                             |
| `ref()`            | `useState()`                           |
| basic `computed()` | calculate a value during render        |
| `v-model`          | `value` plus `onChange`                |
| `@click`           | `onClick`                              |
| `defineProps()`    | typed function parameters              |
| `<template>`       | JSX returned by the component function |
| `class`            | `className`                            |

## First learning target

Open `src/App.tsx` and compare it with how you would write the same feature in a
Vue `<script setup lang="ts">` component. The project demonstrates:

- local reactive state,
- a controlled input,
- typed DOM events,
- a derived value,
- click handlers,
- a child component,
- typed props.
