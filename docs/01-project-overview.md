# Project Overview

## What This Project Is

NEXTflow is a visual workflow builder for LLM-focused pipelines. Users create workflows on a node canvas, connect outputs to inputs, and run either the full workflow, selected nodes, or a single node with its required upstream dependencies.

The product is focused on:
- node-based workflow authoring
- multimodal LLM execution
- media processing nodes
- execution history
- persistence
- polished UI/UX

## Core Features

The app includes exactly 6 required node types:

1. `Text Node`
2. `Upload Image Node`
3. `Upload Video Node`
4. `Run Any LLM Node`
5. `Crop Image Node`
6. `Extract Frame from Video Node`

Each node participates in a typed graph. The workflow behaves like a DAG, so cycles are rejected and nodes only run after their direct dependencies are satisfied.

## Main User Experience

The product now has a full hosted-product journey:

- Landing page
- Docs page
- Contact page
- Sign-in / sign-up pages
- Protected dashboard
- Protected workflow editor

Inside the editor, the UI has 3 major areas:

- Left sidebar: quick access node library
- Center canvas: React Flow workflow editor
- Right sidebar: workflow run history with node-level details

The app ships with a seeded sample workflow called `Product Marketing Kit Generator`. It demonstrates:
- all 6 node types
- image and video branches
- parallel execution
- convergence into a final LLM result

## Execution Model

The workflow runner supports:
- full workflow run
- selected node run
- single node run

Results are stored as run records and shown in the history panel with:
- run status
- timestamps
- duration
- per-node outputs
- per-node errors

## Tech Stack

- `Next.js` App Router
- `TypeScript`
- `React Flow`
- `Tailwind CSS`
- `Zustand`
- `Zod`
- `Prisma`
- `PostgreSQL`
- `Clerk`
- `Trigger.dev`
- `Gemini`
- `Transloadit`

## Practical Local-Dev Behavior

The codebase still allows public product pages to load even if every external service is not fully configured.

Current local/dev behavior:
- auth does not fall back to a fake user anymore
- if Clerk keys are missing, sign-in and sign-up pages show a setup-required state
- persistence can fall back to in-memory storage
- Gemini calls return a mock response if no API key is set
- Trigger.dev integration points remain wired, but local execution fallback is used

This keeps the product reviewable while preserving a real authentication boundary.
