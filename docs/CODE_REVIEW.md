# Code review — 2026-10-04

Scope: the active React frontend and Express backend, startup/configuration, API authorization, imports, and developer checks. Existing uncommitted work was preserved and edited in place where necessary. The legacy `server/` copy and historical data-repair scripts were not modernized.

## Fixed

- Restored the missing ESLint configuration; detected and fixed undefined confirmation-anchor setters and a conditional React hook in the confirmation dialog.
- Resolved lint findings involving unused bindings and unstable/missing hook dependencies.
- Added role checks to every route addressing an existing trip. Authentication alone previously allowed access to several unrelated users' trip resources.
- Scoped expense/booking update and delete queries to both trip ID and child ID. Restricted booking updates to editable fields and enabled expense/itinerary update validators.
- Moved request sanitization after body parsing, so JSON bodies are actually sanitized.
- Limited public template detail queries to public records and validated pagination bounds.
- Linked new members to already-registered accounts; protected the owner's membership and validated member roles.
- Rejected reversed trip dates, negative budgets, invalid settlement amounts, unknown settlement participants, and self-settlements across ID aliases.
- Normalized numbered template days to dates, validated imports before writing, and added trip cleanup if itinerary creation fails. Template publication now requires an explicit flag.
- Added related-record cleanup when deleting a trip and prevented direct edits to the cached spending total.
- Normalized authentication emails and returned client errors for schema validation/casting failures and duplicate records.
- Prevented automatic mutation retries that could duplicate writes after a timeout. Cleared stale tokens across both browser storage locations when switching accounts.
- Removed optimistic profile changes that remained visible after failed saves. Connected the old fork route to the existing template detail flow and disabled repeat copy submissions while saving.
- Separated Express app construction from startup; startup now checks configuration and waits for MongoDB.
- Added environment examples, root verification commands, architecture documentation, and API regression tests.

## Follow-up fixes

- Aligned MongoDB schemas and frontend payloads for activity completion, coordinates, images, duration and currency; expense notes and split type now round-trip.
- Corrected booking and review database IDs, activity rename handling, and member ID aliases in expense editing.
- Made save/delete dialogs await API completion and retain errors; aligned UI edit permissions with backend roles.
- Added trip-to-template synchronization, reliable template deep links, server-backed Explore filters, real profile pages, and password changes.
- Reconciled itinerary days when trip dates change; populated days cannot be silently truncated. Copies without activities get blank editable days.
- Removed unused activity service/helpers and false settings/social actions. Retained the legacy server tree with a clear warning.
- Added four idempotently seeded public plans: Jaipur, Kyoto, Lisbon, and Kerala.
- Fixed inclusive trip duration/daily averages, expense-note rendering, CSV escaping, and stale account/data caches.

## Verification

Backend syntax, zero-warning frontend lint, 15 regression tests, production build, and 42 real HTTP/MongoDB integration checks passed. Browser persistence checks passed for activities, bookings, and expenses; settlement recording cleared balances. See [the button matrix](BUTTON_AUDIT.md) for exact coverage and unverified controls.

## Remaining limitations

- Multi-document writes and derived totals lack transactions/concurrency guarantees.
- Expense member/share/currency validation is enforced. Currency conversion remains unsupported.
- Member removal rejects references from expenses/payments and never redistributes shares automatically. Cross-document membership races still require transactions.
- Adding a planning member does not deliver invitation email or automatically link a later signup.
- Notifications are local UI state. Password recovery is not implemented.
- External Maps behavior, native print/download completion, deployment, and dependency vulnerability auditing are not verified.
- `server/` is a retained legacy copy, not the maintained API. Automatic approval review rejected deleting the whole tree because external use had not been ruled out; a warning README was added instead.

These notes document the verified remediation and its limits, not a guarantee that every possible defect has been eliminated.

## Expense and concurrency follow-up

- Validates positive amounts, member IDs, duplicate aliases, matching totals, and trip currency. Equal thirds allocate every cent. Stored payer/split IDs refer to trip members, not populated User references.
- Expense updates require the loaded `__v`; a conditional version increment rejects simultaneous or stale edits with 409.
- Trip API reads derive spending from expenses, removing the racing cached-total writes.
- Payments use atomic push/pull operations. The UI keeps a request ID for retries; duplicate requests return the existing payment, changed payloads conflict, and undone request IDs cannot be reused.
- Trip currency is fixed after creation to prevent relabeling existing financial records.
- Verification: 24 regression tests, lint/build, and 77 real HTTP/MongoDB checks, including simultaneous expense edits, duplicate payment requests, concurrent deletes, and replay after undo.
- Limits: legacy callers that omit payment request IDs do not receive retry deduplication; different request IDs represent different payments. Multi-document membership/expense changes and other unrelated trip edits are not fully transactional. Existing historical data is not automatically rewritten.

## Automatic refresh and membership follow-up — 2026-10-05

Active dashboard/trip pages poll every 15 seconds and on focus/reconnection. Polling pauses while hidden, offline, or editing; only the current trip section is loaded. Background reads are quiet, and request versions prevent outdated responses overwriting saved state. Reads finishing after an editor opens are deferred.

Member removal now rejects financial references (including member/User ID aliases), preserves shares, and uses a conditional trip-version update to detect overlapping trip writes. This is not a transaction across Expense and Trip: a new expense racing removal still needs transactional protection.

Verification: lint/build, 26 regression tests, and 80 HTTP/MongoDB checks passed. In the browser, an external API payment of ₹200 automatically changed the visible debt from ₹500 to ₹300 without reload. Temporary test records were cleaned up. Refresh for bookings and itineraries was source-checked and built; the browser refresh check specifically exercised settlements.

## Transaction mode — 2026-10-05

Added opt-in `MONGO_TRANSACTIONS=required` for replica sets. Existing-trip mutation routes serialize through a per-trip transaction write, recheck fresh permissions, bind model operations to the session, and defer responses until commit. Controller write conflicts propagate to the driver for whole-transaction retry. Trip deletion runs related operations sequentially inside the transaction.

Validated on an isolated local replica set: 88 HTTP/MongoDB checks passed, including injected rollback across Trip and Expense and simultaneous member removal versus expense/payment creation. Syntax/lint/build and the 26 regression tests also passed. The original standalone database was not modified or migrated; transaction mode remains off there. A replica-set setup choice is required to activate the protection locally.
