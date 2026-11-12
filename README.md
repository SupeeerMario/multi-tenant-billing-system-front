# multi-front

Billing dashboard for the multi-tenant billing API, built with React, TypeScript and Vite.

**Live:** https://multi-tenant-billing-app.duckdns.org/8090

## Features

- Connect with an existing API key or create a new tenant and copy its key once
- Setup wizard that creates a monthly plan and a subscription
- Dashboard with a usage feed, an add usage form, a period ring and the projected bill
- Invoice panel with a pay button that uses an `Idempotency-Key`, so retries never charge twice
- Generate the next invoice once the period ends
- Bills strip showing paid, unpaid, not billed and running months

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. Dev requests to `/billing` are proxied to the live API. Point them elsewhere with:

```sh
BILLING_API=http://localhost:8000 npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type check and build to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the built app |
| `node src/bills.check.ts` | Self-check for the bills timeline logic |

## Deploy

The VM needs Docker only, no Node install.

```sh
git pull
docker compose run --rm build
docker compose up -d
```

`build` runs `npm ci && npm run build` in `node:22-alpine` and writes `./dist`. `frontend` serves `./dist` from `nginx:1.29-alpine` on port 8090, falls back to `index.html` for deep links, and forwards `/billing/`, `/api/`, `/admin/` and `/static/` to the backend at `web:8000` on the external `khaled_default` network.
