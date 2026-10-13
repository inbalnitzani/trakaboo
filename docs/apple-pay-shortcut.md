# Apple Pay → Trakaboo (iOS Shortcut)

iPhone can run a Shortcut every time you pay with Apple Pay. This sends each payment to
Trakaboo, so tap payments show up without importing a statement. It only sees in-store
Apple Pay payments; everything else still comes from Cal / Max imports.

## 1. Get your token

Trakaboo → **Settings → Apple Pay** → **Create token**. Copy the token right away, because it's
shown only once. Only a hash is stored. To revoke a token, replace it with a new one.

## 2. Create the automation

Shortcuts app → **Automation** → **+** → **Transaction**.

- **Cards**: the cards you use with Apple Pay.
- **Categories**: all.
- **Run Immediately** (and turn off "Notify When Run" if you want it silent).

## 3. Add the action

Add a **Get Contents of URL** action:

| Setting | Value                                                  |
| ------- | ------------------------------------------------------ |
| URL     | The endpoint from Settings (`https://…/api/apple-pay`) |
| Method  | `POST`                                                 |
| Headers | `Authorization` = `Bearer <your token>`                |
| Body    | JSON, with the fields below                            |

| Key        | Type | Value (Shortcut variable)                    |
| ---------- | ---- | -------------------------------------------- |
| `amount`   | Text | Shortcut Input → **Amount**                  |
| `merchant` | Text | Shortcut Input → **Merchant**                |
| `card`     | Text | Shortcut Input → **Card** (optional)         |
| `time`     | Text | **Current Date**, ISO 8601 format (optional) |

## 4. Try it

Pay once with Apple Pay. The payment appears in the overview under "Other", where you can
re-categorize it.

## API

`POST /api/apple-pay` · `Authorization: Bearer <token>` · JSON body
`{ amount: string | number, merchant: string, card?: string, time?: ISO 8601 }`

| Status | Body                                      | Meaning                                |
| ------ | ----------------------------------------- | -------------------------------------- |
| 201    | `{ "result": "created" }`                 | Saved                                  |
| 200    | `{ "result": "duplicate" }`               | Same payment already saved (a retry)   |
| 400    | `{ "error": "invalidPayload", "fields" }` | Missing/invalid amount, merchant, time |
| 401    | `{ "error": "unauthorized" }`             | Missing or unknown token               |
| 500    | `{ "error": "failed" }`                   | Couldn't save; safe to retry           |

- The purchase date is taken in Israel time from `time` (or when the request arrives).
- The currency is read from the amount text (₪ / $ / €), defaulting to ILS.
- In demo mode (no Supabase configured), the token is `demo`.
