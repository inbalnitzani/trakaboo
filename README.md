# Trakaboo 👀💸

_Peek at where your money went._ A personal expense tracker (PWA) with Apple Pay capture and Cal / Max statement import.

- **Product & design decisions:** [DESIGN.md](DESIGN.md)
- **Code conventions:** [AGENTS.md](AGENTS.md)
- **Clickable design preview (sample data):** [preview/index.html](preview/index.html)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command                           | What it does                                                 |
| --------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                     | Start the dev server                                         |
| `npm run build`                   | Production build                                             |
| `npm run check`                   | Typecheck + lint + format check + unit tests                 |
| `npm test` / `npm run test:watch` | Unit tests (Vitest)                                          |
| `npm run test:e2e`                | End-to-end tests (Playwright, uses installed Chrome locally) |
| `npm run format`                  | Format everything with Prettier                              |
