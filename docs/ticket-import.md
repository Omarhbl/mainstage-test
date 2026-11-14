# Ticket.ma public catalogue reader

Ticket.ma renders its homepage event cards in JavaScript. Direct HTTP requests
and search extraction can return only a shell or HTTP 403. The scheduled reader
uses ordinary headless Chromium to load the public page and read its rendered
cards. It does not use private endpoints, credentials, CAPTCHA solvers or stealth
plugins.

The GitHub workflow `Sync Ticket.ma Morocco Events` publishes only normalized
public event details in `src/data/ticket-events.json`. Vercel reads that snapshot
before trying the existing direct API and search fallback. Snapshots expire after
24 hours. A failed import does not overwrite the previous file.

Cards need an official Ticket.ma event URL, explicit full date, recognized
Moroccan venue and artwork. Past, cancelled, postponed and sold-out cards are
excluded. Date ranges use their explicit start date. Distinct labelled showtimes
remain separate. The feed retains the existing limit of 50 upcoming events;
this is a catalogue selection, not a guarantee of ticket availability.

Ticket.ma supplies landscape artwork, displayed without cropping. No additional
API key or Vercel environment variable is required. GitHub scheduling must be
enabled only after a successful import on the actual hosted runner.

Validate with `node --test scripts/ticket-events.test.mjs scripts/event-discovery.test.mjs`
and TypeScript. The workflow installs its pinned Playwright dependency in a
runner temporary directory, outside the application's dependencies.

## Hosted-runner result (2026-11-14)

The first ordinary Chromium run on GitHub returned HTTP 403. The workflow is
manual-only; no automatic schedule is enabled. The initial public snapshot was
read from the normal browser and validated with the same parser. It is temporary,
not evidence that scheduled imports work. Request an official feed or automated
access from Ticket.ma before enabling the workflow schedule.
