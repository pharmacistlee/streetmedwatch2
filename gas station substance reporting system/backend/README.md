# StreetMedWatch — Backend API

A small, self-contained API for the StreetMedWatch community adverse-reaction registry.
Node + Express + SQLite. No external services required to run locally; the "not a robot"
bot check and email alerts plug into real providers when you add keys.

## What it does

- Stores and serves **adverse-reaction reports** (the core feature).
- Accepts new submissions with **server-side validation**, a **Cloudflare Turnstile** bot check
  (instead of human moderation), and **automated risk screening** — reports mentioning self-harm
  or dosing-to-harm are **held for human review** instead of auto-publishing.
- **Anonymizes** free text (strips emails, phone numbers, URLs) before anything is stored.
- Computes the homepage **stats**: most-reported leaderboard (last 90 days vs. prior 90),
  a 12-month timeline, and symptom / outcome breakdowns.
- Collects **email alert** sign-ups.
- Exposes a token-protected **moderation queue** for the held reports.

## Quick start

```bash
cd backend
cp .env.example .env        # optional — sane defaults work as-is
npm install
npm start                   # seeds 40 reports on first boot, then listens on :4000
```

Visit http://localhost:4000/api/health — you should see `{"status":"ok","reports":40,...}`.

Run the smoke test any time:

```bash
bash test/smoke.sh
```

## Configuration (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `CORS_ORIGIN` | `*` | Allowed front-end origin(s), comma-separated |
| `DB_PATH` | `data/streetmedwatch.db` | SQLite file location |
| `TURNSTILE_SECRET` | _(empty)_ | Cloudflare Turnstile secret. **Empty = bot check bypassed (dev).** |
| `ADMIN_TOKEN` | `change-me-in-production` | Bearer token for `/api/admin/*` |
| `SUBMIT_RATE_PER_HOUR` | `10` | Max submissions per IP per hour |

## API

### Public

- `GET /api/health` — status + report count.
- `GET /api/meta` — reference data for the form/filters (substances, brands, states, symptom/duration/help/outcome options).
- `GET /api/stats` — `{ total, leaderboard, timeline, symptomChart, outcomeChart }`.
- `GET /api/reports` — published reports. Query params: `substance`, `outcome`, `help`, `q`,
  `sort` (`date|substance|help|outcome`), `dir` (`asc|desc`), `limit`, `offset`. Returns `{ total, count, reports }`.
- `GET /api/reports/:id` — one published report.
- `POST /api/reports` — submit a report (see body below). Returns `201 {status:"published", id, report}`,
  or `202 {status:"held"}` if risk-screened, or `400 {error}` on validation failure.
- `POST /api/alerts` — `{ email, state? }` → `201 {status:"subscribed"}`.

### Admin (header `x-admin-token: <ADMIN_TOKEN>` or `Authorization: Bearer <ADMIN_TOKEN>`)

- `GET /api/admin/held` — reports awaiting review, with the terms that flagged them.
- `POST /api/admin/held/:id/approve` — publish a held report.
- `POST /api/admin/held/:id/reject` — reject a held report.

### Submit body

```json
{
  "brandKey": "Za Za Red",
  "reporter": "The person it happened to",
  "incidentDate": "2026-07-22",
  "symptoms": ["Racing heart", "Vomiting"],
  "duration": "3-6 hours",
  "state": "Ohio",
  "help": "Poison Control",
  "outcome": "Recovered",
  "amount": "one bottle",
  "takenWith": "Nothing",
  "note": "What happened, in your words.",
  "bot": true,
  "turnstileToken": "<token from the Turnstile widget, when enabled>"
}
```

`brandKey` is either a known brand (auto-fills the substance) or `"other"` (then also send
`brand` and optionally `substance`). Required: a brand, a valid non-future `incidentDate`,
at least one `symptoms` entry, and `bot: true`.

## Going to production

- **Turnstile:** create a Turnstile widget, put the **site key** in the front-end widget and the
  **secret key** in `TURNSTILE_SECRET`. The server then verifies every submission.
- **Database:** SQLite is fine to start. The models are thin; moving to Postgres later means
  swapping `db.js` and the query helpers — the routes don't change.
- **Alerts delivery:** sign-ups are stored in the `alerts` table. Wire a sender (Resend, SendGrid,
  Postmark) to actually notify subscribers when reports spike or a substance is restricted.
- **`ADMIN_TOKEN`:** set a long random value before deploying.
- **Deploy:** any Node host (Render, Railway, Fly.io). Set the env vars, run `npm start`.

See `INTEGRATION.md` for wiring the existing front-end to this API.
