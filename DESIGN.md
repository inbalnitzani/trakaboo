# Trakaboo 👀💸

_Peek at where your money went._ A personal expense tracker (PWA).

## Scope (v1, personal use)

- Single user (me). May go public later, so keep auth and data model multi-user ready.

## Data in

- **Apple Pay** — iOS Shortcuts "Transaction" automation → POST `{amount, merchant, card, time}` to an app endpoint protected by a secret token. Catches in-store tap payments only.
- **Statement import** — Cal (xlsx) and Max (PDF only). Duplicate detection against Apple Pay entries (same amount + close date + similar merchant). Leumi: out of scope for now.
- **Manual entry** — quick add form.
- No bank credentials stored anywhere.

## Design

|            |                                                                           |
| ---------- | ------------------------------------------------------------------------- |
| Language   | Hebrew + English toggle (full RTL/LTR flip)                               |
| Style      | Colorful & playful — rounded cards, emoji per category                    |
| Palette    | Candy pastels: pink, mint, lilac, peach on cream                          |
| Theme      | Light only                                                                |
| Home       | This month's overview: total, category cards, charts, recent transactions |
| Charts     | Donut by category · Daily spending bars · This month vs. last month       |
| Categories | ~10 editable starter categories with emojis                               |
| Navigation | Bottom tab bar: Overview · Transactions · Import · Settings               |
| Currency   | ₪ (ILS) default                                                           |

### Starter categories

🍔 Food · 🛒 Groceries · 🚗 Transport · 🛍️ Shopping · 🏠 Bills · 💊 Health · 🎉 Fun · ✈️ Travel · 📱 Subscriptions · ❓ Other

Auto-categorization: rules by merchant name, learned from my corrections.

## Rules

- **Month = purchase date** (not the card charge date on the 10th).
- **Bit / PayBox** → own category 💸 Transfers, counted as spending.

## Statement formats (from real samples — never commit real statements; use fake fixtures)

**Cal (.xlsx)** — sheet "חיובים בשקלים" (foreign-currency sheet likely separate).

- Rows 1–3: `תאריך החיוב : DD/MM/YYYY`, `כרטיס : NNNN` (last 4), `סה"כ חיובים בשקלים : X`
- Row 5 header: `תאריך עסקה | שם העסק | סכום עסקה | סכום חיוב | פירוט`
- Amounts are strings like `"55.00 ₪"`; dates `DD/MM/YYYY`.

**Max (.pdf)** — text extraction returns visually reversed Hebrew (must un-reverse RTL runs; Latin/numbers stay LTR).

- Section "עסקאות בארץ / בש"ח"; columns: `תאריך | שם בית העסק/העסקה | סוג עסקה (רגילה) | סכום עסקה | סכום החיוב | הערות`
- Dates `DD/MM/YY`. An Apple Pay icon follows the date (extracts as a trailing `7`) → mark `source=apple_pay` for dedupe.
- Notes can span a 2nd line (e.g. PayBox: `הועבר ל: <name> עבור: <reason>`).
- Footer: `סה"כ חיובים בתאריך DD/MM/YY ₪ X` → use to validate the parsed sum.

## Tech

- Next.js (PWA, installable on iPhone)
- Supabase — Postgres with row-level security, auth (magic link / passkey)
- Vercel hosting (HTTPS)

## Next steps

1. Clickable design preview (mock data) to approve the look
2. Supabase schema + auth
3. Manual entry + overview dashboard
4. Apple Pay endpoint + Shortcut setup guide
5. Cal / Max importers + dedupe
