# TravelSync

A collaborative travel itinerary planner built with React, Express, and MongoDB. Plan day-by-day activities, organize booking records, track shared expenses, and calculate suggested settlements.

## Features

- Email/password signup and login using JWT authentication.
- Trips with dates, destinations, budgets, currencies, and members.
- Day-by-day itineraries with activities, locations, duration, notes, and costs.
- Booking records for flights, hotels, transport, and activities.
- Shared expenses, consistent member balances, and a simple payment recorder with partial payments and undo.
- Public itinerary templates, reviews, helpful votes, and copying templates into trips.
- JSON/CSV itinerary import and client-side export tools.
- Optional Google Maps and location autocomplete.

Bookings and settlements are records maintained by users; the app does not book travel or transfer money. Collaboration uses HTTP requests. Active dashboard/trip pages refresh every 15 seconds and on focus/reconnection; hidden or offline tabs and active forms pause refresh. This is polling, not instant push synchronization.

## Requirements

- Node.js **22.12 or later** and npm. `.nvmrc` selects Node 22.
- A running MongoDB instance, locally or hosted.
- Optional Google Maps browser API key for maps and autocomplete.

## Local setup

Run these commands from the repository root:

```sh
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

If either `.env` already exists, edit it instead of overwriting it. Set `MONGO_URI` and replace `JWT_SECRET` with a long random secret. For example, generate one with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start the API in one terminal:

```sh
npm run backend
```

Start the frontend in a second terminal:

```sh
npm run frontend
```

Open [http://localhost:5173](http://localhost:5173) and create an account. The API waits for MongoDB before listening. Its health endpoint is [http://localhost:5000/api/health](http://localhost:5000/api/health).

### Environment variables

| File | Variable | Purpose |
| --- | --- | --- |
| `backend/.env` | `MONGO_URI` | Required MongoDB connection string. |
| `backend/.env` | `JWT_SECRET` | Required token-signing secret. |
| `backend/.env` | `JWT_EXPIRES_IN` | Token lifetime; defaults to `7d`. |
| `backend/.env` | `PORT` | API port; defaults to `5000`. |
| `backend/.env` | `CLIENT_URL` | Allowed frontend origin. Local ports 5173–5175 are also allowed. |
| `frontend/.env` | `VITE_API_URL` | API base URL **including `/api`**; defaults to `http://localhost:5000/api`. |
| `frontend/.env` | `VITE_GOOGLE_MAPS_API_KEY` | Optional browser key for Maps JavaScript API and Places. |

Vite embeds `VITE_*` variables in the frontend bundle. Do not put server secrets there. Restrict the Maps key to your application origins and enabled APIs. Restart Vite after changing its environment variables. The root `.env` is not used by the documented startup commands.

### Optional template data

A fresh database starts empty. Add six public Atlas templates (Jaipur, Kyoto, Lisbon, Kerala, Kyoto at dawn, and Lisbon/Sintra):

```sh
npm run seed:explore
```

The seed is idempotent: it inserts missing examples without overwriting existing templates or personal trips. Plans include credited destination photos, planning tips, and links to the guides that inspired them. Budgets and activities are illustrative planning examples, not live prices or reservations.

To refresh only the app-owned curated templates after a content update, run `cd backend && node seed_explore.js --refresh-curated`. This preserves their IDs and reviews and excludes user-authored templates. Photos load from Pexels; blocked or unavailable images use a local fallback.

Historical `seed_*`, `fix_*`, `reset_pw.js`, and maintenance scripts may delete or rewrite records. They are not required for setup; review them before use.

## Commands and checks

| Root command | Action |
| --- | --- |
| `npm run frontend` | Start Vite development server. |
| `npm run backend` | Start the API with nodemon. |
| `npm run install:all` | Install frontend and backend dependencies. |
| `npm run lint` | Check frontend JavaScript/JSX and React hook rules. |
| `npm run check:backend` | Syntax-check backend JavaScript. |
| `npm test` | Run API and validation regression tests without MongoDB writes. |
| `npm run test:integration` | Run HTTP tests against the configured MongoDB using temporary fixtures and cleanup. |
| `npm run seed:explore` | Add the six public curated itineraries if missing. |
| `npm run build` | Build frontend into `frontend/dist/`. |
| `npm run check` | Run syntax checks, lint, regression tests, and frontend build. |

For reproducible dependency installation, use `npm ci --prefix frontend` and `npm ci --prefix backend`; both packages have lockfiles. Tests use Node's built-in test runner, a temporary localhost HTTP listener, and mocked database calls. They do not connect to or modify your MongoDB database. The separate integration command uses `backend/.env`, creates a uniquely named test user and related records, and cleans them up in a `finally` block. Prefer a development database.

## Project layout

```text
frontend/
  src/
    components/       Shared UI and feature dialogs
    contexts/         Authentication, data caches, API-backed actions
    hooks/            Reusable React hooks
    pages/            Route-level screens
    services/         Axios client and API calls
    utils/            Formatting, validation, balances, member lookup
  eslint.config.js    Frontend lint configuration
  vite.config.js      Frontend bundling configuration
backend/
  app.js              Express middleware and route assembly
  index.js            Environment loading, DB connection, HTTP startup
  config/             MongoDB connection
  controllers/        Request handling and persistence
  middleware/         JWT authentication and trip permissions
  models/             Mongoose schemas
  routes/             API routes
  utils/              Import normalization and error responses
  test/               Regression tests
scripts/              Repository verification helpers
docs/                 Architecture and code-review notes
sample_itinerary.*    JSON and CSV import examples
server/               Legacy backend copy; not used by root commands
```

**Use `backend/` for API development.** The older `server/` directory is retained for reference and does not receive these fixes. Do not deploy it as the current API. Historical explanation text files are superseded by this README and [architecture notes](docs/ARCHITECTURE.md).

## Permissions

Trip membership roles are separate from the account's `user`/`admin` role.

| Action | Owner | Trip admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Read trip and related records | Yes | Yes | Yes | Yes |
| Edit itinerary, expenses, bookings, settlements | Yes | Yes | Yes | No |
| Edit trip details and manage members | Yes | Yes | No | No |
| Delete trip | Yes | No | No | No |

The owner cannot be removed or demoted. Adding a member links an existing account by normalized email. An unregistered email creates a planning member only; invitation email delivery and automatic linking after later signup are not implemented. Editing controls reflect trip permissions; the API also enforces them.

## Imports and templates

Use [sample_itinerary.json](sample_itinerary.json) or [sample_itinerary.csv](sample_itinerary.csv) as a starting point. A trip needs a title, destination, start date, and end date. JSON `days` contain ISO dates and activity arrays. Template day numbers are converted into dates relative to the new trip's start date. Imported days must fit within the trip date range.

The import API keeps trips private by default. Explicit `publishToExplore: true` publishes an imported template. Changing an existing trip to public creates or updates its linked Explore template; subsequent itinerary edits synchronize that template. Switching back to private hides it. Anonymous visitors see the template, not private trip bookings, expenses, or membership. Copies receive dated itinerary days, including blank days when activities are excluded.

## Production build

```sh
npm run build
npm --prefix backend start
```

Serve `frontend/dist/` with a static host configured to fall back to `index.html` for client-side routes. The Express API does not serve the frontend bundle. Set the frontend's production API URL before building and set `CLIENT_URL` to the frontend origin. Use HTTPS and a persistent MongoDB database. `npm --prefix frontend run preview` can inspect a built frontend locally.

## Troubleshooting

- **MongoDB connection fails:** verify `backend/.env`, database availability, credentials, and any hosted-database network allowlist.
- **API cannot be reached:** check `VITE_API_URL`, including `/api`, and verify the API health endpoint.
- **CORS error:** set `CLIENT_URL` to the exact browser origin; restart the backend.
- **Port 5000 is occupied:** change backend `PORT` and frontend `VITE_API_URL` together.
- **Maps do not load:** check the Maps key, enabled APIs, origin restrictions, and provider billing configuration.
- **403 response:** verify that the account is linked to the trip and has the required trip role.

## Current limitations

Notifications are local UI messages, not a delivery service. Adding a member does not send invitation email. Password changes work for signed-in users; forgotten-password recovery is not implemented. Maps require a working provider key. Print and downloads depend on browser support.

Trip currency is fixed after creation. Expense amounts and custom shares use at most two decimal places; equal splits distribute leftover cents consistently. The API rejects unknown members, duplicate participants, incorrect totals, and mismatched currencies. Expense edits send the loaded `__v` version and return HTTP 409 when stale. Payment submissions use a request ID to make retries safe, and payments are added/removed atomically. Spending is derived from expense records on trip reads. Cross-document operations and simultaneous membership changes still lack transaction guarantees. See [code-review notes](docs/CODE_REVIEW.md) and the [button verification matrix](docs/BUTTON_AUDIT.md) for evidence and remaining limitations.

## Optional transaction mode

For atomic writes across trip membership, expenses, payments, bookings, and itineraries, use a MongoDB replica set (Atlas or a local replica set) and set `MONGO_TRANSACTIONS=required` in `backend/.env`. Restart the API. Startup checks the topology and refuses to start in required mode against standalone MongoDB; it never silently falls back. `/api/health` reports the configured transaction mode.

The default `off` mode preserves standalone compatibility but does not guarantee atomic changes across collections. The current local database was left unchanged. Back up and migrate/convert it deliberately before enabling this mode.

In required mode, existing-trip mutations share a per-trip write fence, recheck permissions inside the transaction, retry transient write conflicts, and send success only after commit. Failed handlers roll back all writes. This covers the existing-trip mutation routes; signup, trip creation/import, and public reviews are outside this transaction boundary. Historical scripts that write directly to MongoDB also bypass it.

Run `npm run test:integration` against a development replica-set URI with `MONGO_TRANSACTIONS=required` to additionally exercise cross-collection rollback and membership/financial-write races. The integration script cleans up its own test records.

## Payments and historical records

Settle Up always exposes **Add expense**, **Record payment**, and **View all expenses** to trip editors. Use **Edit** on a recorded payment to correct its participants, amount, date, method, or note. Updates reject stale versions instead of overwriting another edit. The shared ledger updates Resource Allocation and Settle Up; payments do not reduce total trip spending.

Old payment IDs must resolve to current trip members; a matching display name alone no longer counts as verification. Unresolvable records pause suggested payments and show a repair prompt. New expense splits use exact cents. Historical records should be backed up before repair; never infer missing participants merely from equal balances.

Atlas copies retain photos, credits, guide links, and planning tips. Export itinerary creates JSON of the current editable plan, not a claim to download an original guide document. Budgets and visit durations remain illustrative.
