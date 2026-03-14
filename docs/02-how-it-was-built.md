# How It Was Built

## Build Approach

The project was built in layers so the app stayed usable and verifiable at each stage:

1. scaffold the `Next.js` app
2. add the core dependencies
3. define workflow schemas and sample graph data
4. build the editor shell and node system
5. add workflow execution logic
6. add API routes and persistence hooks
7. wrap the builder in a full product shell with landing, docs, contact, auth, and dashboard
8. replace the old auth fallback with a Clerk-first protected flow
9. add tests
10. run browser-based UI review with Playwright and polish the layout

## Main Architecture

### 1. Workflow Domain Layer

The workflow domain lives under `lib/workflow/`.

Important files:
- `lib/workflow/types.ts`
- `lib/workflow/defaults.ts`
- `lib/workflow/sample.ts`
- `lib/workflow/graph.ts`
- `lib/workflow/execution.ts`

This layer handles:
- node types and config schemas
- handle typing
- workflow graph shape
- DAG validation
- topological sorting
- input resolution from connected nodes
- workflow execution orchestration

## 2. Editor State

Client-side editor state is managed with `Zustand` in:

- `components/workflow/store.ts`

It stores:
- nodes
- edges
- viewport
- undo/redo history
- runs
- expanded history state

This keeps the React Flow canvas responsive without overloading the server on every interaction.

## 3. UI Composition

The product UI is split into focused components.

Public/product shell:
- `components/site/site-header.tsx`
- `components/site/site-footer.tsx`
- `components/site/auth-card.tsx`
- `components/site/dashboard-shell.tsx`

Workflow workspace:

- `components/workflow/left-sidebar.tsx`
- `components/workflow/editor.tsx`
- `components/workflow/nodes.tsx`
- `components/workflow/right-sidebar.tsx`
- `components/workflow/topbar.tsx`

The styling direction intentionally leans toward:
- dark, dense editor UI
- soft gradients
- rounded panels
- low-noise chrome
- purple edge/activity accents

## 4. Server Layer

Server-side logic is split into:

- `lib/server/auth.ts`
- `lib/server/prisma.ts`
- `lib/server/storage.ts`
- `lib/server/trigger.ts`

This layer handles:
- current user identity
- Clerk configuration state
- Prisma client creation
- workflow save/load
- run persistence
- integration boundaries for Trigger.dev

## 5. API Surface

The App Router API lives under `app/api/`.

Key routes:
- `GET/PATCH /api/workflows/[workflowId]`
- `GET/POST /api/workflows/[workflowId]/runs`
- `GET /api/workflows/[workflowId]/export`
- `POST /api/workflows/import`
- `GET /api/runs/[runId]`

These routes support:
- loading workflows
- saving workflows
- running workflows
- exporting/importing JSON
- reading run details

## 6. Persistence Strategy

The intended production persistence is:
- `PostgreSQL`
- `Prisma`

The Prisma schema includes:
- `Workflow`
- `WorkflowVersion`
- `WorkflowRun`
- `WorkflowRunNode`

For local review without a DB, the storage layer can fall back to an in-memory store.

## 7. Authentication Strategy

Authentication is now treated as a real product requirement.

Important pieces:
- `app/sign-in/page.tsx`
- `app/sign-up/page.tsx`
- `lib/server/auth.ts`
- `middleware.ts`

Current behavior:
- dashboard/workflow/API routes are treated as protected
- Clerk is required for real auth
- if Clerk keys are missing, auth pages render a setup-required state rather than fake local access

## 8. Execution Strategy

Executable nodes are modeled around the required production architecture:
- LLM node
- Crop Image node
- Extract Frame node

These are the places where Trigger.dev should own the actual execution path in a fully configured deployment.

For local usability, the code currently provides fallbacks:
- LLM uses Gemini if configured, otherwise returns a mock response
- crop/frame nodes simulate deterministic outputs

## 9. Validation and Review

Validation happened at multiple levels:
- type-safe schemas with `Zod`
- graph validation for cycle prevention
- unit tests for graph/execution behavior
- `eslint`
- `next build`
- Playwright browser review

## 10. Browser QA Pass

Before considering the project complete, the frontend was checked in a real browser with Playwright to review:
- landing page layout
- sign-in and sign-up pages
- dashboard layout
- workflow editor layout
- default graph framing
- run interaction
- running-state glow
- history panel output

That pass led to a couple of cleanup fixes, especially around default canvas composition and execution feedback timing.
