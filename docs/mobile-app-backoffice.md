# Mainstage mobile-app back office

Implemented from the supplied 16 November 2026 back-office spec: Radio, Webradios, Ads and Switches under `/backoffice/app`. Admin role is required on pages, saves and image uploads. The existing article/event editors remain the source of their content.

## Public configuration

`GET https://www.themainstagent.com/api/app/config` returns version 1 with `updatedAt`, `features`, `radio`, `webradios` and `ads`. No login is required. Success responses use `Content-Type: application/json`, `Cache-Control: public, max-age=60` and permissive read-only CORS. Storage failures return 503 with `no-store`, allowing the app to keep its last saved config instead of caching an empty replacement.

Sections are independently saved in existing Supabase `site_settings` keys `app_radio`, `app_webradios`, `app_ads`, `app_switches`. No schema migration is required. `updatedAt` is the latest saved section timestamp; the Unix epoch denotes no saved settings yet.

No example stream, artwork, ads or fake campaigns are seeded. Until Radio is configured, the endpoint returns an empty stream; the mobile app must apply its documented fallback. An empty webradio list invokes the app's built-in five. Inactive stations remain in a non-empty list, so disabling every station does not accidentally restore all five defaults.

Ads are filtered to active campaigns within their date window and are omitted while Ads is switched off. End times are exclusive. Dates are entered explicitly as UTC and returned as ISO 8601 UTC. Schedule times use the Africa/Casablanca wall clock; days are 0=Sunday through 6=Saturday and overnight shows are supported.

## Media

JPG, PNG and WebP uploads use the existing `media-assets` bucket under `app/<placement>/`. Images are inspected on the server, limited to 4 MB and 40 million pixels, and checked for the required size/ratio. Radio artwork is square and at least 1000 pixels wide; webradio covers are at least 800 pixels on both axes. Banners are at least 640×200 at 3.2:1; rectangles are at least 600×500 at 6:5. Larger matching-ratio images are accepted.

Existing image links are accepted from the configured public Supabase media bucket, Cloudinary uploads, or Mainstage image files. Server validation does not follow redirects or fetch arbitrary external hosts. Upload external images directly rather than pasting an unrelated host's URL.

## Release checks

- Add the real public HTTPS Caster.fm listening URL in Radio. No account passwords, private API keys or publishing credentials belong in this public feed.
- Test audio on iOS and Android, including background/lock-screen playback. Browser playback is a convenience test and may not support HLS.
- Reopen the app after saving; confirm its own `src/lib/appConfig.tsx` fetches the endpoint and applies name/artwork changes after the cache expires.
- Confirm station hide/reorder/Coming soon behavior in the actual app.
- Confirm ad imagery, links, future start dates and expiry in the actual app.
- Verify the app's offline cached-config behavior on a phone. This repository only contains the website/back office; the mobile client has not been changed here.

## Deferred work from the spec

The Drop content editor is intentionally deferred until launch. The Drop switch is available but remains off by default; turning it on uses the client's bundled Drop content. The recommended `/api/app/articles`, `/api/app/events` feeds and venue coordinate picker are a separate next phase and are not implemented by this first configuration release.
