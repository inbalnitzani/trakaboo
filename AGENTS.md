<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Trakaboo — project conventions

Personal expense tracker PWA. Product decisions live in [DESIGN.md](DESIGN.md).

## Stack

Next.js 16 (App Router, `src/proxy.ts` instead of middleware) · React 19 · TypeScript strict ·
Tailwind v4 + shadcn/ui (Base UI, RTL enabled) · next-intl (he default, en) · Vitest · Playwright.

## Structure

```
src/
  app/[locale]/        routes only — compose features, no business logic
  components/ui/       generic primitives (shadcn + our own: SegmentedControl, EmptyState…)
  components/layout/   app shell pieces (AppShell, BottomNav, PageHeader…)
  components/charts/   generic charts that take plain data
  features/<name>/     feature components + hooks (transactions, overview, import…)
  lib/<domain>/        pure, framework-free functions with co-located *.test.ts
  config/              data-driven config (navigation, categories…)
  i18n/                locales, routing, messages/{he,en}.json
e2e/                   Playwright specs for key user flows
```

## Rules

- **Generic first.** Build reusable, prop-driven components and pure functions; feature code composes them. If something varies, make it data/config (e.g. `NAV_ITEMS`, `LOCALES`), not branches.
- **Gender-neutral Hebrew.** Don't address the user with gendered imperatives (לחצי/לחץ); use infinitive or plural forms (לחיצה, אפשר להוסיף, בוחרים).
- **No hard-coded UI text.** Every string goes through `useTranslations` / `getTranslations`; add keys to both `he.json` and `en.json` (types come from `en.json`).
- **No hard-coded colors.** Use the tokens in `src/app/globals.css` (`bg-card`, `text-muted-foreground`, `bg-tint-pink`, `fill-series-1`…). Chart series must keep the validated order.
- **RTL-safe styling.** Use logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) — never `ml/mr/pl/pr/left/right` for layout.
- **Server by default.** Add `"use client"` only to leaf components that need state/effects/browser APIs. Never pass functions/components from server to client components.
- **Pages call `initLocale(params.locale)`** (from `@/i18n/server`) first, and link with `Link` from `@/i18n/navigation`.
- **Logic is tested.** Anything in `src/lib` gets a Vitest test. Key user flows get a Playwright spec.
- **Money:** use `formatMoney` / `parseAmount` / `sumAmounts` from `@/lib/money/money` — never format or sum amounts by hand.
- **Privacy:** never commit real bank/card statements; use fake fixtures.

## Workflow

- One branch + PR per feature (`feat/…`, `fix/…`, `chore/…`), merged into `main`.
- Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- `npm run check` (typecheck, lint, format, unit tests) must pass; the pre-commit hook runs it on staged files.
- `npm run test:e2e` before merging UI changes (uses installed Google Chrome locally — Playwright's Chromium doesn't support macOS 13).
