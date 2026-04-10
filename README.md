# Trigger Triage — Draper GTM Engine

A Next.js app for triaging GTM trigger files from Draper's monitoring pipeline.

## Features

- **Load & display** all pending triggers from `workspace/gtm/triggers/pending/`
- **Score-based sorting** — highest-scored triggers appear first
- **Rich detail view** — signal, why it matters, recommended action, platforms, audiences
- **One-tap actions** — Approve (→ `approved/`), Reject (→ `rejected/`), or Defer
- **Batch approve** — Quick-approve top N triggers by score
- **Filtering** — by score range, audience segment, trigger type, or search text
- **Stats dashboard** — pending/approved/rejected counts with avg score
- **Mobile-first** — fully responsive, designed for on-the-go triage
- **Dark mode** — easy on the eyes at 04:00

## Quick Start (Local)

```bash
cd trigger-triage-app
npm install
npm run dev
```

The app reads from `WORKSPACE_PATH` env var (default: `../gtm/triggers` relative to the app).

Set in `.env.local`:
```
WORKSPACE_PATH=/Users/picsart/.openclaw/workspace/gtm/triggers
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. API routes read markdown trigger files from the filesystem
2. Parser extracts structured data (score, type, signal, audiences, etc.) from trigger markdown format
3. Actions move files between `pending/`, `approved/`, and `rejected/` directories
4. Batch approve moves the top N highest-scored triggers at once

## Trigger File Format

Triggers are markdown files with this structure:
```markdown
# Trigger: Name of the Trigger

## Classification
- **Type:** Competitor | Trend | Model | Product
- **Detected:** 2026-04-10 00:50 UTC
- **Source:** Source names
- **Half-life:** 7-14 days
- **Score:** 8.5/10

## Signal
Description of what happened...

## Scoring
- **Velocity:** 8/10
- **Relevance:** 9/10
- **Half-life:** 8/10

## Why It Matters for Picsart
Why this matters...

## Recommended Response
What to do about it...
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Server-side file system operations
