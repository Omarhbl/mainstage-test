# iTicket import

The importer is prepared but **not connected**. Both the catalogue API and public
homepage returned HTTP 403 from GitHub-hosted runners on 14 November 2026.
The schedule is commented out until access is available.

Ask iTicket for a read-only public event feed or permission for automated access.
No customer, order or payment data is needed. Required fields are title, date,
poster, venue/city and the public ticket URL for Moroccan events.

After access is granted:

1. Update the approved feed endpoint/authentication in `scripts/sync-iticket.mjs`
   if needed. Keep any issued credentials in GitHub Actions secrets.
2. Run **Sync iTicket Morocco Events** manually in GitHub Actions and confirm it
   publishes `src/data/iticket-events.json` successfully.
3. In the backoffice Events panel, refresh and verify iTicket shows Connected.
4. Uncomment the six-hour schedule in `.github/workflows/sync-iticket.yml`.

The workflow publishes only normalized public event data. Vercel reads that file
from GitHub and stores it in the existing event-feed database cache. Failed imports
never overwrite the previous file, snapshots older than 24 hours are rejected,
and past events are filtered before display. Manual events and Guichet continue
independently.
