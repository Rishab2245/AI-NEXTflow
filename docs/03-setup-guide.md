# Setup Guide

## Requirements

You should have:

- `Node.js` 20+ or newer
- `npm`
- optionally a PostgreSQL database
- Clerk API keys
- optionally API keys for Trigger.dev and Transloadit

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Local Env File

Copy the example env file:

```bash
cp .env.example .env.local
```

## 3. Configure Environment Variables

Available variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=postgresql://user:password@localhost:5432/nextflow
GEMINI_KEY_ENCRYPTION_SECRET=
TRIGGER_SECRET_KEY=
TRIGGER_API_URL=
TRANSLOADIT_AUTH_KEY=
TRANSLOADIT_AUTH_SECRET=
```

## 4. Service Setup

### Clerk

Required for product access.

Set:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Behavior now:
- public pages still load without Clerk
- sign-in and sign-up pages show a setup-required state if Clerk is missing
- dashboard and workflow pages are intended to be protected product routes

### PostgreSQL

Needed if you want real workflow and run persistence instead of in-memory fallback mode.

Set:
- `DATABASE_URL`

Then generate Prisma client:

```bash
npm run prisma:generate
```

If you want to add migrations later, you can initialize Prisma migration flow on top of the included schema.

### Gemini

Needed before any workflow run that includes LLM execution.

Set:
- `GEMINI_KEY_ENCRYPTION_SECRET`

Then sign in and add your Gemini API key directly on the dashboard:
- `/dashboard`

### Trigger.dev

Needed if you want to wire real remote task execution instead of local fallback behavior.

Set:
- `TRIGGER_SECRET_KEY`
- `TRIGGER_API_URL`

### Transloadit

Needed if you want a true upload pipeline rather than using manual URL inputs during local review.

Set:
- `TRANSLOADIT_AUTH_KEY`
- `TRANSLOADIT_AUTH_SECRET`

## 5. Start the App

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 6. Run Verification Commands

Lint:

```bash
npm run lint
```

Tests:

```bash
npm test
```

Production build:

```bash
npm run build
```

## Local Dev Notes

If some envs are still empty:
- public pages still work
- auth pages will prompt for Clerk setup instead of allowing fake login
- storage can still run without PostgreSQL
- workflow runs are blocked until the user saves a Gemini key in settings

For a true end-to-end product test, configure at least:
- Clerk
- PostgreSQL
