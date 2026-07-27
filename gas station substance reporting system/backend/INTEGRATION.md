# Wiring the front-end to the API

The design file (`StreetMedWatch.dc.html`) currently holds all data in a hardcoded `RAW`
array and keeps new submissions in local component state (`this.state.extra`). To make it
live, point those three touch points at the API. The report shape the API returns matches
what the UI already renders, so the changes are small.

Set a base URL once:

```js
const API = 'http://localhost:4000/api'; // or your deployed URL
```

## 1. Load reports from the server instead of `RAW`

Replace the local `RAW`/`all()` source. Fetch published reports on boot and keep them in state:

```js
// in componentDidMount (or the runtime's boot hook)
fetch(`${API}/reports?limit=200`)
  .then(r => r.json())
  .then(({ reports }) => this.setState({ reports }));
```

The API returns each report as:

```json
{ "id":"R-2481", "incidentDate":"2026-07-21", "substance":"Tianeptine",
  "brand":"Za Za Red", "amount":"most of a bottle", "takenWith":"Nothing",
  "symptoms":["Vomiting","Racing heart","Confusion"], "duration":"6-12 hours",
  "help":"Emergency room", "outcome":"Hospitalized", "state":"OH", "note":"…" }
```

Note `incidentDate` (camelCase) where the prototype used `date`. Either rename in `decorate()`
or map on arrival: `reports.map(r => ({ ...r, date: r.incidentDate }))`.

## 2. Use the server's stats (optional but recommended)

The homepage leaderboard, timeline and charts are already computed server-side — fetch them
instead of recomputing in `renderVals()`:

```js
fetch(`${API}/stats`).then(r => r.json())
  .then(stats => this.setState({ stats }));
// stats = { total, leaderboard, timeline, symptomChart, outcomeChart }
```

`leaderboard` items come pre-shaped: `{ rank, name, soldAs, count, pct, delta }` — the same
fields the template already reads.

## 3. Submit reports through the API

Replace the body of `submitReport` (the part after validation) with a POST. Keep the
client-side validation for instant feedback; the server re-validates anyway.

```js
submitReport = async (e) => {
  e.preventDefault();
  const f = this.state.form;
  // ...keep existing client-side checks...
  this.setState({ submitStatus: 'submitting' });
  const res = await fetch(`${API}/reports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      brandKey: f.brandKey, brand: f.brand, substance: f.substance,
      reporter: f.reporter, incidentDate: f.incidentDate, symptoms: f.symptoms,
      duration: f.duration, state: f.state, help: f.help, outcome: f.outcome,
      amount: f.amount, takenWith: f.takenWith, note: f.note, bot: f.bot,
      turnstileToken: this.state.turnstileToken, // when Turnstile is enabled
    }),
  });
  const data = await res.json();
  if (res.status === 202 && data.status === 'held') return this.setState({ submitStatus: 'held' });
  if (!res.ok) return this.setState({ submitStatus: 'idle', formError: data.error });
  // published — prepend and show the done state
  this.setState(s => ({
    reports: [data.report, ...(s.reports || [])],
    submitStatus: 'done', newId: data.id,
  }));
};
```

The server already does the risk-screening → held flow and the anonymization, so you can
remove the client-side `FLAGGED` block (or keep it as a first-pass; the server is the source of truth).

## 4. Alerts

```js
submitAlert = async (e) => {
  e.preventDefault();
  const res = await fetch(`${API}/alerts`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: this.state.alertEmail, state: this.state.alertState }),
  });
  if (res.ok) this.setState({ alertsDone: true });
  else this.setState({ alertError: (await res.json()).error });
};
```

## 5. Turnstile ("not a robot")

When you enable Turnstile, add its widget to the report form, capture the token it produces,
and pass it as `turnstileToken`. Until `TURNSTILE_SECRET` is set on the server, the check is
bypassed so local development keeps working.

## CORS

Set `CORS_ORIGIN` in the backend `.env` to your front-end's origin (e.g.
`https://streetmedwatch.org`). Use `*` only for local testing.
