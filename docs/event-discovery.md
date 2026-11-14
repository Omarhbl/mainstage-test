# Daily Moroccan event discovery

## Enable

1. In GitHub repository `Omarhbl/mainstage-test`, open Settings → Secrets and
   variables → Actions → New repository secret.
2. Save the Tavily key as `TAVILY_API_KEY`. Do not put it in source code or chat.
3. Open Actions → Discover Moroccan Events → Run workflow → main.
4. Confirm the workflow succeeds and publishes `src/data/event-discovery.json`.
5. In Mainstage backoffice → Upcoming → Events, click Refresh event listings.

No Vercel environment variable is needed for this importer. GitHub runs it daily
at 07:37 UTC. GitHub schedules may be delayed. Eight basic searches plus at most
twenty basic extractions are requested per run; actual billing follows Tavily's
plan. This does not create or upgrade a paid account.

## Publishing rules

Search is limited to iTicket.ma, Ticket.ma, webook.com and Events.ma. Only event
detail URLs qualify. The importer extracts page content; search snippets alone
never publish an event. Automatic publication requires a matching main event
heading, exactly one explicit full calendar date, a recognized Moroccan city,
and exactly one poster with matching alt text. Past, cancelled, postponed and
sold-out entries are excluded when those states appear in the extracted content.
Ambiguous or incomplete candidates are shown only in the backoffice review list.
Missing years are not inferred. Global search images are not used as posters.

The first five discovered detail pages per platform are considered per run.
This is supplementary discovery, not exhaustive ticket inventory. Dates and
cancellations can lag behind the live ticket site. Never advertise ticket
availability based on this feed.

Only normalized public event details and short review excerpts are committed.
Failed platforms retain their last successful results for up to 48 hours, without
refreshing their original checkedAt. A total search failure preserves the file.
Previously verified items also survive a temporarily incomplete extraction for
up to 48 hours using their original observedAt; another search does not reset it.
Vercel validates the snapshot, caches it in site_settings, and uses it when a
platform's direct catalogue is unavailable. The public listing keeps its current
design. Uncertain entries can be verified and entered using existing manual fields.

## Validation

Run `node --test scripts/event-discovery.test.mjs` and the TypeScript check.
A successful authenticated Tavily run is required before claiming search is live.
