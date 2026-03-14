# Usage and Deployment Guide

## How To Use The App

## 1. Start From The Product Flow

Use the product as:

1. landing page
2. sign in or sign up
3. dashboard
4. workflow builder

## 2. Open the Sample Workflow

Start at:

```text
/workflows/product-marketing-kit
```

This gives you a ready-made workflow with:
- all 6 node types
- image branch
- video branch
- convergence LLM node

## 3. Edit Node Content

You can:
- update text in `Text Node`
- change media URLs in upload nodes
- adjust crop percentages
- change frame timestamp
- edit LLM prompt fields

When an input is connected from another node, the manual field becomes disabled to show the value is inherited from upstream.

## 4. Add More Nodes

Use the left sidebar quick access buttons to insert more nodes onto the canvas.

Supported actions:
- click-to-add
- select nodes
- connect compatible handles
- delete nodes with `Delete` or `Backspace`

## 5. Run Workflows

Topbar actions:

- `Run All`: executes the entire workflow
- `Run Selected`: executes the selected subgraph
- `Run Single`: executes one selected node and its required upstream chain

During execution:
- nodes show running state
- successful runs update the right sidebar
- LLM outputs render inline on the node

## 6. Save / Export / Import

- `Save` persists the current graph through the workflow API
- `Export` downloads the workflow as JSON
- `Import` loads a workflow JSON file through the import API

## Deployment Guide

## Recommended Deployment

Deploy on `Vercel`.

Why:
- best fit for `Next.js` App Router
- simple env management
- straightforward preview deployments

## Deployment Steps

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Add environment variables in the Vercel project settings.
4. Use a hosted PostgreSQL database such as `Neon`.
5. Redeploy after env setup.

## Environment Variables For Production

At minimum, set:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`

For full production behavior, also set:

- `GEMINI_API_KEY`
- `TRIGGER_SECRET_KEY`
- `TRIGGER_API_URL`
- `TRANSLOADIT_AUTH_KEY`
- `TRANSLOADIT_AUTH_SECRET`

## Production Checklist

Before handing it over or recording the demo:

- confirm `npm run build` passes
- verify Clerk auth flow end to end
- verify workflow save/load with real DB
- verify LLM response with a real Gemini key
- verify upload flow if Transloadit is wired
- verify run history persists across refresh
- record a demo showing all required assignment flows

## Suggested Demo Flow

For the submission video, show:

1. opening the app
2. sign in through Clerk
3. landing in the dashboard
4. opening the seeded workflow
5. editing a few node values
6. running the full workflow
7. checking node-level history
8. running selected nodes
9. exporting and importing JSON
10. showing the deployed URL

## What You Need To Use It Properly

If you only want to review the project visually:
- public pages and setup-required auth pages are enough

If you want realistic end-to-end behavior:
- PostgreSQL
- Gemini API key
- Clerk project
- Trigger.dev setup
- Transloadit setup

That combination gives the project its intended production path instead of fallback behavior.
