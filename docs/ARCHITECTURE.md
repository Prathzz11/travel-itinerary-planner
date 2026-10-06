# Architecture

## Request flow

1. `frontend/src/main.jsx` mounts the React app. `App.jsx` supplies contexts, lazy-loaded pages, and React Router routes.
2. Pages and dialogs call context actions. Contexts hold in-memory caches and call the modules in `frontend/src/services/`.
3. `services/api.js` attaches the stored bearer token, sets a timeout, formats errors, and retries only read requests. A 401 from a protected endpoint clears authentication.
4. `backend/app.js` applies security headers, CORS, body parsing, MongoDB-key sanitization, and rate limiting before mounting routes.
5. Protected routes verify the JWT and fetch its user. Trip routes also verify membership and role. Controllers validate and persist data with Mongoose.
6. Responses update the React context caches. The active dashboard/trip page polls every 15 seconds and refreshes on focus/reconnection. Editing, hidden tabs and offline state pause background reads; request versions keep older reads from overwriting confirmed writes. There is no WebSocket server.

`backend/index.js` loads the environment, requires the database URI and JWT secret, connects to MongoDB, and then opens the HTTP listener. Regression tests import `app.js` directly and replace database calls; the opt-in integration suite uses real MongoDB fixtures.

## Data model

| Model | Responsibility |
| --- | --- |
| User | Profile, hashed password, preferences, recently viewed template IDs. |
| Trip | Owner, embedded members, dates, budget, cached spending, settlements, activity feed. |
| Itinerary | One document per trip, containing dated days and embedded activities. |
| Expense | Trip-linked payment, payer, split shares, category, receipt, notes, and split type. |
| Booking | Trip-linked travel reservation record and confirmation details. |
| Template | Separate public itinerary representation using numbered days; `sourceTrip` links published trips. |
| Review | User review of a template; unique author/template pair and helpful votes. |

A member may have both a trip subdocument ID and a linked User ID. Existing records use both conventions; `frontend/src/utils/memberLookup.js` resolves aliases for balances. Name fallback exists for historical data and can be ambiguous when people share a name.

`Trip.spent`, template review statistics, and activity counts are derived values. Some updates write multiple documents and can become inconsistent under concurrent operations or partial failures. They currently have no database transaction boundary.

## API map

All paths below are relative to `/api`.

| Route | Methods | Access |
| --- | --- | --- |
| `/health` | GET | Public |
| `/auth/signup`, `/auth/login` | POST | Public |
| `/auth/me` | GET, PUT | Authenticated |
| `/auth/me/password` | PUT | Authenticated; verifies current password |
| `/auth/users/:id` | GET | Public profile without email |
| `/auth/me/viewed/:id` | POST | Authenticated |
| `/trips` | GET, POST | Authenticated; list is scoped to owner/member |
| `/trips/import` | POST | Authenticated |
| `/trips/:id` | GET, PUT, DELETE | Trip roles; delete is owner-only |
| `/trips/:id/members` | POST | Owner/trip admin |
| `/trips/:id/members/:memberId` | PUT, DELETE | Owner/trip admin |
| `/trips/:id/itinerary` | GET, PUT | Members read; editors/admins/owner write |
| `/trips/:id/expenses`, `/trips/:id/bookings` | GET, POST | Members read; editors/admins/owner write |
| `/trips/:id/expenses/:expenseId`, `/trips/:id/bookings/:bookingId` | PUT, DELETE | Editors/admins/owner; child record must belong to trip |
| `/trips/:id/settlements` | GET, POST | Members read; editors/admins/owner write |
| `/trips/:id/settlements/:settlementId` | DELETE | Editors/admins/owner |
| `/itineraries` | GET | Public templates; search, destination, author, tags, sort, page, limit |
| `/itineraries/:id` | GET | Public templates only |
| `/reviews/template/:templateId` | GET, POST | Public read; authenticated write |
| `/reviews/:id` | PUT, DELETE | Author; account admin can also delete |
| `/reviews/:id/helpful` | PUT | Authenticated |

Active itinerary editing saves through `/trips/:id/itinerary`. The unused standalone activity service was removed. Activities persist completion, coordinates, image URLs, costs, and currency. Trip date edits reconcile itinerary days and reject removal of populated days.

## Development boundaries

Use `frontend/` and `backend/`. The `server/` tree is an older independent copy and is not part of root build/test commands. Root build artifacts and old explanation reports are not source-of-truth implementation documentation.

Keep secrets in ignored `.env` files. Public configuration examples contain placeholders only. Avoid running historical repair/seed scripts against a database you want to preserve without reviewing their writes first.
