# Button and backend audit — 2026-10-04

The active app is `frontend/` + `backend/`. This matrix distinguishes browser evidence from API tests and source inspection; it is not a claim that every control was clicked on every device.

| Screen / controls | Result and verification |
| --- | --- |
| Login, dashboard, trip navigation | Browser login and navigation passed with a temporary test account. Signup and password changes passed real HTTP/MongoDB tests. |
| Trip create/edit/delete | API integration checks passed; owner and viewer restrictions covered by regression tests. Date-range reconciliation has dedicated tests. Deletes are awaited and failures retain the dialog. |
| Activity add/edit/completion | Browser saves, rename, and completion passed, including reload persistence. API verifies duration, coordinates, images, and completion fields. Mobile day selection added. Delete handler reviewed; itinerary persistence covered by API tests. |
| Booking add/edit/delete, type/status | Browser hotel add/edit and reload passed. Required dates validated; local date values preserved on edit. All booking types map to the schema. CRUD API checks passed. |
| Expense add/edit, equal/custom split | Browser add, edit, payer selection, split selection, saved notes, totals, and reload passed. Custom split and CRUD verified against MongoDB. Budget-save and filters reviewed in source. |
| Settlement record/delete | Browser suggested-payment dialog and save passed; balances became zero. Delete confirmation and Cancel passed. Actual deletion covered by API integration. These are payment records, not money transfers. |
| Members add/role/remove | Browser planning-member addition passed; owner role/removal controls disabled. Role update/removal and access rules passed API tests. Copy Link corrected to the existing trip route and reports clipboard failures. |
| Explore search/filter/sort/reset/pagination | Browser list, search, and direct detail passed. Server-backed fields replace nonexistent client fields. Pagination limits covered by regression tests; page controls disable at boundaries. Four new templates are visible. |
| Template copy | Guest button routes to login. Real API copy preserves relative day dates. Empty copies now receive editable blank days. Wizard validation, pending state, and errors reviewed. Unsupported booking/expense copy options removed. |
| Publish/unpublish | Real API tests verify linked public templates, itinerary content, and hiding private templates. UI awaits the API and refreshes Explore. |
| Reviews add/edit/delete/helpful | Real API tests passed. Correct database IDs and author fields are used. Guests cannot submit reviews. Public-parent validation added. |
| Profile / My Templates / settings | Persistent profile/preferences/password API tests passed. Public profile excludes email. Placeholder pages replaced. Forms await API responses. Removed controls that falsely claimed to implement account deletion or unsupported preferences. |
| Share / clipboard | Handlers use existing trip URLs and catch clipboard errors. Browser clipboard availability is environment-dependent; sharing a link does not grant trip access. |
| CSV / PDF / Print | Source handlers reviewed. CSV escaping and Blob downloads fixed. The in-app browser download event timed out, so successful saved-file output is not confirmed. PDF and native print completion remain unverified. |
| Maps / autocomplete | Loader configuration stabilized and coordinate persistence verified through API. Live Google provider rendering, billing, and external navigation remain unverified. |
| Static pages / footer / notifications | Routes inspected; fake social links removed. Notifications are local status messages, not backend messages. |

## Automated results

- `npm run check`: backend syntax, zero-warning frontend lint, 21 regression tests (15 backend + 6 balance tests), and production build passed.
- `npm run test:integration`: 60 real HTTP/MongoDB checks passed; its own records are cleaned up.
- `npm run seed:explore`: added four templates on the first run; second run added zero and found all four.

Browser mutations used an isolated temporary account and trip. Existing personal trips were not edited. End-to-end testing of external services, native print/download output, all responsive sizes, and simultaneous users remains outside the verified coverage.

## Simplified Settle Up follow-up

- One “who owes whom” list with a prefilled Record payment dialog. Only payer, recipient, and amount are shown initially; date/method/note are optional details.
- Member balance details are collapsed, duplicate Paid/Owes/Net figures removed, and payment history has an explicit Undo confirmation.
- Budget and Settle Up share one calculation with cent allocation for equal splits, consistent member IDs, and loading/error states. Old requests cannot overwrite confirmed mutations.
- Browser verified a ₹500 debt becoming ₹300 after a ₹200 payment on both screens, persisting after reload. Recording the remaining ₹300 cleared the debt. Total expenses remained ₹1,000. Undo confirmation/cancellation checked in-browser; undo persistence and restored balances checked through the real API.
- Automated balance tests include partial/full payments, undo, expense edits/deletion, one-cent debts, overpayments, equal thirds, invalid records, and duplicate names. Integration tests confirm repayments leave trip spending unchanged.
- These checks cover the local app and API. Active trip pages now refresh every 15 seconds and on focus/reconnection; this remains request-based polling, not live push updates.

## October 5: payment repair and Atlas

- Flight Plan renamed to Trip Plan in frontend navigation and notifications.
- Add expense and Record payment remain available during legacy-record warnings; Edit opens a prefilled payment form with unresolved participants deliberately blank.
- Payment PUT integration checks cover legacy records without timestamps, invalid participants/amounts, stale and concurrent edits, persisted balances, and unchanged expense totals.
- Atlas has six source-linked curated plans; copies preserve photo attribution and planning references.
- Historical data cleanup was explicitly authorized and backed up locally outside source control. Four user trips were revalidated with zero ledger issues; unrelated test-account history was not modified.

- Manually opened all four repaired Settle Up pages: valid suggestions and no data warnings. Checked Goa Budget totals and balances against Settle Up. Opened Add expense, Record payment, and legacy Edit dialogs without changing real records through the UI.
- Verified all six curated photos loaded as remote images (not fallback placeholders); checked Kyoto guide links, credits, planning tips, and activity notes in the browser.
- Final verification: `npm run check` passed and `npm run test:integration` passed 100 HTTP/MongoDB checks.
