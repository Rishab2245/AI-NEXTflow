# NEXTflow

NEXTflow is an LLM workflow platform built with `Next.js`, `TypeScript`, `React Flow`, `Zustand`, `Zod`, `Prisma`, and a product-oriented UI focused on node-based multimodal workflows.

The app includes:
- 6 required node types
- React Flow canvas with minimap and zoom/pan
- full / selected / single-node execution
- right-sidebar workflow run history
- JSON import/export
- seeded sample workflow
- public marketing site, docs, contact, auth, and dashboard
- Clerk-based authentication flow
- Prisma/PostgreSQL-ready persistence
- Trigger.dev / Gemini / Transloadit integration points with local fallbacks

## Docs

- [Project Overview](./docs/01-project-overview.md)
- [How It Was Built](./docs/02-how-it-was-built.md)
- [Setup Guide](./docs/03-setup-guide.md)
- [Usage and Deployment Guide](./docs/04-usage-and-deployment.md)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Verification

These checks were used during development:

```bash
npm run lint
npm test
npm run build
```

## Important Note

Authentication is now Clerk-first.

That means:
- sign-in and sign-up routes are real auth entry points
- dashboard and workflow routes are protected
- if Clerk keys are missing, auth pages show a setup-required state instead of allowing fake local login

The app can still render public pages without every external service configured, but real product access now requires Clerk.
