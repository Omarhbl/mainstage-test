# Mobile app radio integration

The app backoffice at `/backoffice/app/radio` now starts with the real production Mainstage radio settings. Existing saved settings remain authoritative. Admins can edit the station name, subtitle, stream, square station artwork, optional metadata override and schedule. No passwords or API keys are needed.

## Configuration

`GET https://www.themainstagent.com/api/app/config`

The existing version-1 contract stays compatible. `radio` now defaults to:

- `name`: Mainstage — On Air
- `subtitle`: Your soundtrack, around the clock.
- `streamUrl`: https://radio.themainstagent.com/listen/mainstage/radio.mp3
- `artworkUrl`: the supplied Mainstage Glossy Red Noir artwork
- `nowPlayingUrl`: https://www.themainstagent.com/api/app/radio/now-playing
- `metadataRefreshSeconds`: 10
- `mediaSession`: fixed station `title`, `artist` and `artwork: [{src}]`, derived from the backoffice station settings.

The public config supplies Mainstage's endpoint when the optional metadata override is empty. Saved overrides are preserved. Ads, switches and webradios are unaffected. Config is cached for one minute; live metadata is not cached.

## Live radio metadata

`GET https://www.themainstagent.com/api/app/radio/now-playing`

Public JSON with read-only CORS. Success: `station: "live"`, `isOnline`, `metadataAvailable`, `title`, `artist`, `artworkUrl`, `playingNext`, `recentlyPlayed`, `mediaSession`, `updatedAt`. Queue/history items use `{id, title, artist, artworkUrl}`. Missing/generic artwork uses the station image; no next track returns `null`. Known offline state is returned as `isOnline: false`; fetch failures return 503 rather than inventing an offline state or serving an old song. The source is the fixed public AzuraCast endpoint, with an 8-second timeout and no credentials. A custom stream must supply its own metadata override; Mainstage's endpoint returns 503 for a different stream.

## Mobile developer wiring

1. Read app config on launch and refresh it periodically. Use `radio.streamUrl` for audio and station `artworkUrl` as the initial/fallback image.
2. Fetch `radio.nowPlayingUrl` every `metadataRefreshSeconds` while listening (and immediately on returning to the player). Display `title`, `artist`, `artworkUrl`, `playingNext` and `recentlyPlayed` inside the app. Handle 503 by keeping audio independent and using the station fallback when metadata becomes stale.
3. Set native Now Playing / Android media notification metadata from `radio.mediaSession`. Do not replace the lock-screen/car title or image with track metadata. Most native audio libraries require adapting artwork entries to their own URI format.
4. Enable native background audio and remote play/pause controls in the mobile project. Verify iOS locked-screen playback, Bluetooth/car controls and Android background playback on devices. These settings cannot be enabled through backoffice JSON.
5. Reconnect live playback after an explicit stop/start; do not resume an old buffered position. The stream, music rotation and jingles remain managed in AzuraCast. Jingle metadata is currently hidden by the station.

Only the website/backend repository is present in this workspace. This release prepares the backoffice and API; it does not build, publish, or modify a native app binary.
