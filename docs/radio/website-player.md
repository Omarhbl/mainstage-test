# Mainstage Radio website player

Website radio implementation. Public page name: On Air.

- Root-layout RadioProvider owns one audio element; internal Next.js navigation preserves playback.
- Public sticky player; hidden on login, guestlist, backoffice and backstage routes.
- /radio shares playback state and shows the current artwork, Playing next from the station queue, and recent history. Playing next hides when the queue is absent or the station is offline.
- Audio connects directly to https://radio.themainstagent.com/listen/mainstage/radio.mp3 after a user click. Every Play opens a fresh timestamped live connection. Pause unloads the stream. No autoplay or restored playback.
- /api/radio/now-playing normalizes the fixed public AzuraCast API, with no-store responses and an eight-second upstream timeout. Client refreshes every 10 seconds while visible or playing, and immediately on return/reconnection. Timestamped client requests also bypass previously cached releases. No admin credentials or API keys.
- Song title/artist use text rendering. Only station-hosted HTTPS artwork is accepted. Missing, generic, or failed artwork uses the supplied Mainstage Glossy Red Noir Cloudinary artwork.
- Offline metadata disables starting playback; transport errors show retry. Metadata outages retain last details and allow playback retries. Buffering times out after 20 seconds.
- Volume remembered locally; Media Session play/pause and metadata support device media controls.
- Mobile bar sits above the existing 72px navigation. Volume available on the larger page/device controls. Reduced-motion, labeled controls, keyboard volume, and focus rings supported.

## Verification

Production webpack build and TypeScript passed in an isolated checkout based on 982e477 (unrelated pending mobile-app work excluded). Targeted ESLint and 3 metadata tests passed. Browser confirmed live playback, automatic title/artwork changes, shared volume, pause, and continued playback through /music -> /radio navigation. Responsive layouts checked at 390x844 and 1440x1000. Real iOS/Android screen-lock playback still requires device testing before launch; browser simulation does not establish that behavior.

Local preview: http://localhost:3016/radio (isolated directory /private/tmp/mainstage-radio-preview). Local preview used before release.
