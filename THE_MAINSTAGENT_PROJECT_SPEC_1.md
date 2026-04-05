# THE MAINSTAGENT — Full Project Specification
### Next-Gen Entertainment Media Platform for Moroccan Gen Z

---

## 0. Vision Statement

**The Mainstagent** is not a blog. It is not a fan site. It is a *living, breathing cultural pulse* — the digital stage where Moroccan Gen Z discovers, debates, and defines what's hot in music, film, fashion, and celebrity culture. Think the attitude of Pitchfork, the visual flair of i-D Magazine, and the scroll-speed of TikTok — but built for a Casablanca kid who streams from Spotify at 2 AM and still knows every lyric from Saad Lamjarred.

The site will be in **French** as primary language (with Arabic RTL support and English for international content), targeting 16–28 year-olds across Morocco's urban centers.

---

## 1. Brand Identity

### 1.1 Name & Tagline

| Element | Value |
|---|---|
| **Name** | The Mainstagent |
| **Tagline** | *La scène, c'est ici.* |
| **Sub-tagline** | Your backstage pass to everything that matters. |
| **Domain (suggested)** | `themainstagent.ma` |

### 1.2 Brand Personality

- **Tone**: Confident, plugged-in, slightly irreverent. Not try-hard — effortlessly cool.
- **Voice**: Gen Z Moroccan bilingual (FR/AR), switches registers fluidly.
- **Values**: Authenticity, cultural pride, global awareness, no-filter opinions.

### 1.3 Visual Identity

**Color System**

```css
:root {
  /* Core Palette */
  --color-void:       #080808;   /* Near-black base */
  --color-surface:    #111111;   /* Card backgrounds */
  --color-border:     #1E1E1E;   /* Subtle dividers */

  /* Signature Accent — Electric Saffron */
  --color-primary:    #FF6B00;   /* Hot orange / saffron */
  --color-primary-glow: rgba(255, 107, 0, 0.35);

  /* Secondary Accent — Atlas Green */
  --color-secondary:  #00E5A0;   /* Mint/teal — national echo */

  /* Tertiary — Maghreb Violet */
  --color-tertiary:   #C94FFF;   /* Purple for gossip/entertainment sections */

  /* Typography */
  --color-text-primary:   #F0EDE8;  /* Warm off-white */
  --color-text-secondary: #888888;
  --color-text-muted:     #444444;
}
```

**Typography Pairing**

| Role | Font | Style |
|---|---|---|
| **Display / Hero** | *Bebas Neue* or *Clash Display* | Ultra-wide, uppercase, aggressive tracking |
| **Section Headers** | *Syne* ExtraBold | Geometric, modern |
| **Body Copy** | *DM Sans* | Readable, clean, neutral |
| **Quote / Pull** | *Cormorant Garamond* Italic | Editorial contrast |
| **Labels / Tags** | *Space Mono* | Techy, tabular |
| **Arabic** | *Noto Kufi Arabic* | Modern Kufi — pairs with Latin mix |

**Logo Concept**

The wordmark **MAINSTAGENT** rendered in a stacked, condensed display font. The letter **M** acts as a stage curtain shape — two triangles parting. A subtle scanline texture overlays the logo on dark backgrounds. The word "THE" floats small and uppercase above the main wordmark in Space Mono.

---

## 2. Site Architecture

### 2.1 Main Navigation

```
THE MAINSTAGENT
├── HOME (Feed)
├── MUSIC
│   ├── Albums & Reviews
│   ├── Charts & Hits
│   ├── Drops & Releases
│   └── Playlists
├── ARTISTS
│   ├── Moroccan Artists
│   ├── Arab World
│   └── International
├── GOSSIP 🔥
│   ├── Tea & Drama
│   ├── Collabs & Beef
│   └── Spotted
├── CULTURE
│   ├── Fashion & Style
│   ├── Film & Series
│   └── Festivals & Events
├── EXCLUSIVES ⭐
│   ├── Interviews
│   ├── Behind the Scenes
│   └── Rankings & Lists
└── [SEARCH] [FR/AR/EN] [DARK/LIGHT]
```

### 2.2 URL Structure

```
/                           → Home Feed
/music/                     → Music hub
/music/album/{slug}         → Album page
/music/charts               → Weekly charts
/artists/{slug}             → Artist profile
/gossip/                    → Gossip hub
/gossip/{slug}              → Gossip article
/culture/                   → Culture hub
/exclusives/                → Exclusives hub
/exclusives/interviews/{slug} → Interview page
/tag/{tag}                  → Tag aggregation
/search?q={query}           → Search results
/settings                   → User preferences
```

---

## 3. Page-by-Page Design Spec

---

### 3.1 HOME — The Feed

**Concept:** A constantly moving, magazine-style editorial grid that feels alive. Not a static homepage — a *pulse*.

#### Hero Section — "The Drop"

- **Full-viewport** hero with a 16:9 or 21:9 background video loop (artist footage, concert visuals, music video clips — auto-play, muted).
- A heavy-grain CSS overlay (`filter: contrast(1.2)` + noise SVG) gives it a film-feel.
- Centered **headline** in Clash Display, uppercase, white with an electric saffron underline glitch animation.
- A live **ticker tape** scrolling horizontally at the very top (above the nav): breaking news, hot drops, trending artists — infinite marquee.
- **Overlay cards** floating bottom-left: "NOW TRENDING" stack of 3 mini-cards that rotate every 4 seconds (CSS keyframe or JS).

#### Main Feed Grid

A 12-column CSS Grid layout that breaks rules intentionally:

```
[LARGE FEATURE — 8 cols]  [SIDEBAR STACK — 4 cols]
[MED CARD — 4 cols] [MED CARD — 4 cols] [MED CARD — 4 cols]
[FULL-WIDTH BANNER — GOSSIP STRIP]
[SMALL CARD x6 — 2 cols each]
[ALBUM OF THE WEEK — 6 cols] [VIDEO EMBED — 6 cols]
[ARTIST SPOTLIGHT — full width, dark background section]
```

**Card Variants:**

1. **Feature Card** — Large image with bottom-overlay gradient, category pill (color-coded), headline in Syne Bold, author + read time.
2. **Gossip Card** — Orange/red left border accent, fire emoji 🔥 tag, italic subheadline.
3. **Album Card** — Square album art (3D CSS perspective tilt on hover), artist name, rating badge (out of 10, styled like a vinyl label).
4. **Video Card** — Thumbnail with a play button overlay that pulses, platform tag (YouTube / Spotify / Apple Music).
5. **Hot Take Card** — Dark card, large quote typography, small author attribution. Scrolls on click.
6. **Breaking Tag** — Red pill label with a blinking dot, used on cards for urgency.

#### Interaction Effects

- **Cursor**: Custom SVG cursor — a small microphone icon that scales on hover and changes color over different card types.
- **Scroll-triggered reveals**: Cards fade up with `IntersectionObserver` and stagger delay.
- **Hover**: Cards lift with `transform: translateY(-6px)` + box shadow spread. Image inside scales to `1.05`.
- **Hover label**: On image hover, a thin text label slides up from the bottom revealing the category.

---

### 3.2 ARTIST PROFILE PAGE

**Concept:** A full-screen immersive artist "dossier" — part Wikipedia, part fan shrine, part editorial spread.

#### Layout

```
[ARTIST HERO — full-width, 70vh]
  → Artist name in giant display font (partial overflow)
  → Genre tags as glowing pills
  → Quick stats: Followers / Monthly Listeners / Albums
  → "Playing Now" mini-player (Spotify embed or custom)

[TWO-COLUMN CONTENT]
  LEFT (65%):
    → Biography (collapsible, Arabic RTL version toggle)
    → Discography timeline (horizontal scroll, album cards)
    → Latest News & Articles
    → Quotes / Lyrics pull

  RIGHT (35%):
    → Social links with live follower count badges
    → Upcoming events (if any)
    → Related artists (avatar circle stack)
    → "Hot Takes" — community reactions widget
```

#### Visual Tricks

- **Artist color theming**: Each artist page pulls a dominant color from their album art (via ColorThief.js or pre-set in CMS) and applies it as a CSS variable — the hero gradient, accent borders, and pill colors all adapt.
- **Parallax scroll**: Artist photo scrolls slower than content for a layered depth effect.
- **Glitch title animation** on page load: Artist name flickers in with a scanline/glitch CSS animation (3 frames, 0.6s total).

---

### 3.3 ALBUM REVIEW PAGE

**Concept:** A Rolling Stone-meets-TikTok editorial experience. Reviews feel like events.

#### Layout

```
[ALBUM HEADER]
  → Full-bleed album art (blurred & color-shifted as BG)
  → Album art centered, floating, 3D CSS rotation on cursor move
  → Album name + Artist name + Release date
  → THE MAINSTAGENT SCORE: large vinyl-record badge (1–10)
  → Listen buttons: Spotify / Apple Music / YouTube Music / Anghami

[REVIEW BODY]
  → Lede paragraph in large italic Cormorant
  → Track-by-track breakdown (accordion or infinite scroll)
  → Pull quotes in saffron
  → Star rating per track (interactive, shareable)
  → Embedded Spotify player (album or playlist)

[BOTTOM — COMMUNITY]
  → "Hot Take" input (max 280 chars, Gen Z tone)
  → Community reactions (emoji reactions: 🔥❤️💀🙌😤)
  → Share clip feature (copy a quote as a styled image card)
```

---

### 3.4 GOSSIP HUB

**Concept:** Maximum drama. Maximum energy. This section has its own personality — hotter, faster, more chaotic.

#### Visual Differences from Rest of Site

- Background: `#0D0505` — near-black with a warm red tint.
- Accent color switches to **crimson red** (`#FF1744`) in this section.
- Cards have a torn-paper top edge (CSS clip-path).
- Headlines are larger, bolder, more tabloid.
- Animated "🔥 TRENDING NOW 🔥" marquee strip runs above the gossip grid.

#### Gossip Card Layout

```
[THUMBNAIL — full card top, 60% height]
[CATEGORY PILL — "TEA" / "BEEF" / "SPOTTED" / "COLLAB"]
[HEADLINE — large, bold, up to 3 lines]
[FIRST SENTENCE of story — italic, clipped at 2 lines]
[ENGAGEMENT ROW: 👁 1.2k views | 💬 48 | 🔥 Trending #2]
```

---

### 3.5 MUSIC CHARTS PAGE

**Concept:** A live-feeling, animated Billboard-style chart. Visual spectacle.

#### Layout

```
[CHART HEADER]
  → Week number + Date range
  → "Updated every Monday" badge

[CHART TABLE — animated]
  → Rank number (large, faded behind card)
  → Artist avatar (circle, with ring color by genre)
  → Song name + Artist name
  → Movement indicator: ▲3 / ▼1 / ● NEW / ★ PEAK
  → Bars chart (horizontal, animated on load)
  → Week count on chart

[FILTERS]
  → Morocco Top 20 | Arab World | Global | By Genre
```

#### Micro-animations

- On load: each row slides in from left with a staggered delay (0, 50ms, 100ms…).
- Movement arrows animate: ▲ bounces slightly upward, ▼ drops.
- #1 card has a golden shimmer border animation.
- Hovering a row expands it inline to show a Spotify preview embed.

---

### 3.6 EXCLUSIVE INTERVIEW PAGE

**Concept:** Long-form editorial. The most typographically intentional page on the site.

#### Layout

```
[INTRO SCREEN — full viewport]
  → Artist or subject photo, portrait format, left-aligned
  → Interview title in massive display font, right side
  → Subtitle + interviewer name
  → Estimated read time + date

[ARTICLE BODY — constrained width, ~680px]
  → Drop cap on first paragraph
  → Q&A format: Q in saffron bold, A in body font
  → Pull quotes: extra-large, centered, Cormorant Italic
  → Inline image breaks (full-bleed or framed)
  → "Share this quote" hover action on pull quotes

[SIDE PANEL — sticky on desktop]
  → Table of contents (auto-generated from H2s)
  → Social share buttons
  → Related articles
```

---

## 4. Key Technical Specifications

### 4.1 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR + ISR for news freshness + SEO |
| **Styling** | Tailwind CSS + CSS Modules | Utility-first + scoped custom effects |
| **Animations** | Framer Motion + GSAP (ScrollTrigger) | Page transitions, scroll effects, hero animations |
| **CMS** | Sanity.io | Real-time content, image pipeline, multilingual |
| **Database** | Supabase (PostgreSQL) | User accounts, reactions, comments |
| **Auth** | Supabase Auth | Google + Apple + email login |
| **Media** | Cloudinary | Image optimization, transformations, blur hash |
| **Search** | Algolia | Instant search with faceting |
| **Analytics** | Plausible (GDPR-friendly) | Respects Moroccan users' privacy |
| **Hosting** | Vercel | Edge network, fast TTFB in MENA region |
| **Email** | Resend | Newsletter delivery |

### 4.2 Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID / INP | < 200ms |
| Bundle size (initial JS) | < 200kb gzipped |
| Time to first article visible | < 1.5s on 4G Morocco |

### 4.3 Multilingual (i18n)

```
Supported locales:
  - fr (French) — Primary
  - ar (Arabic) — Secondary, RTL layout
  - en (English) — International content

Strategy:
  - next-intl for routing and translations
  - /fr/... /ar/... /en/... URL prefixes
  - Sanity content localized per field
  - RTL: <html dir="rtl"> toggled per locale
  - Arabic font loaded conditionally (subset)
  - Number formatting: Arabic-Indic for ar locale
```

---

## 5. Special Features & Interactions

### 5.1 The "Heatmap" — Trending Bar

A persistent, collapsible sidebar (desktop) or bottom sheet (mobile) that shows:
- Top 5 trending topics RIGHT NOW (pulled from content + social signals).
- Live view count on currently viral article.
- "Hotness score" shown as a animated flame emoji stack (🔥🔥🔥).

### 5.2 "Quick React" — Emoji Reactions

Every article and card has an emoji reaction strip:

```
🔥 Fire    |   💀 Killed it   |   😤 Nah fam   |   ❤️ Love   |   🤯 Shocking
```

Reactions:
- Tapping animates the emoji with a burst effect (CSS `@keyframes` scale + opacity).
- Counts update optimistically in UI, confirmed via Supabase.
- Aggregate reactions shown as a "mood bar" below article.

### 5.3 "Quote to Card" Generator

On any pull quote or highlighted text:
1. User selects/clicks a button.
2. A styled image card is generated (canvas API) with The Mainstagent branding, the quote, and article reference.
3. User can download or share directly to WhatsApp, Instagram Stories.

### 5.4 "Now Spinning" Widget

A floating mini-player widget (bottom right corner) that:
- Shows the "Song of the Week" or editorial playlist.
- Uses Spotify Web Playback SDK (for Premium users) or links to Spotify.
- Collapses to an animated vinyl icon when scrolling.

### 5.5 Push Notifications

- Web Push (via Vercel Edge Functions + Web Push API).
- Users opt-in to categories: Music Drops, Gossip Alerts, New Exclusives.
- Notification badge on nav icon shows unread count.

### 5.6 Artist "Radar" — Discovery Section

A rotating, visually dynamic section on the home feed that highlights:
- 1 **Emerging Moroccan Artist** to watch.
- Radar-style circular visualization (CSS/SVG) showing their growth metrics.
- "Add to Watchlist" button saves artist to user's personal tracking list.

---

## 6. Mobile Experience (Priority)

Moroccan Gen Z is **mobile-first**. The entire experience is designed mobile-out:

| Element | Mobile Behavior |
|---|---|
| Navigation | Bottom tab bar (Home, Music, 🔥 Gossip, Artists, Profile) |
| Hero | Full-screen vertical video loop (portrait crop) |
| Cards | Single column, swipeable horizontal stack for featured |
| Chart page | Swipeable rows, tap to expand |
| Article | Optimized reading: large font, minimal chrome |
| Quote Share | Native share sheet integration |
| Reactions | Large tap targets (48px min) |
| Language toggle | Accessible from profile settings |

**Gestures:**
- Swipe right on a card → Save to Reading List.
- Long press on card → Quick actions (share, save, react).
- Pull down on home → Refresh with satisfying snap animation.

---

## 7. Animations & Motion Design System

### 7.1 Page Transitions

```
Entry: Clip-path wipe from left (0.4s ease-out)
Exit: Fade + scale down to 0.97 (0.25s ease-in)
Between sections: GSAP ScrollTrigger reveals
```

### 7.2 Scroll Effects

| Element | Effect |
|---|---|
| Hero image | Parallax (scrolls at 0.5x speed) |
| Section headers | Slide up + fade in (triggered at 80% viewport) |
| Cards | Staggered fade-up (children delay 60ms each) |
| Gossip banner | Horizontal parallax (moves opposite scroll direction) |
| Chart rows | Sequential slide-in from left |

### 7.3 Hover States

| Element | Effect |
|---|---|
| Nav links | Underline animates from center out |
| Cards | translateY(-6px) + shadow spread |
| Buttons | Background wipe animation (left to right) |
| Artist avatar | Ring glow pulse |
| Emoji reactions | Pop scale (1 → 1.4 → 1) + particle burst |

### 7.4 Loading States

- **Skeleton screens** that match card shapes exactly (pulsing gradient).
- **Article page**: Progressive reveal — headline first, then image, then body.
- **Charts page**: Bars animate from 0 to value on load.
- **Global**: Thin saffron progress bar at top of page (like YouTube/NProgress).

---

## 8. Content Strategy

### 8.1 Content Categories

| Category | Volume | Cadence |
|---|---|---|
| Music Reviews | High | 3–5/week |
| Album Drops | Medium | As released |
| Gossip & Tea | High | Daily (2–4/day) |
| Artist Profiles | Medium | 1–2/week |
| Chart Updates | Low | Weekly (Monday) |
| Exclusives/Interviews | Low | 1–2/month |
| Culture (Fashion, Film) | Medium | 2–3/week |
| Lists & Rankings | Low | Biweekly |

### 8.2 Moroccan Artists Coverage (Priority List)

- Maâlem Mahmoud Guinia (heritage)
- Saad Lamjarred
- Douzi
- RedOne (international bridge)
- French Montana (Moroccan diaspora)
- LBENJ
- Dizzy DROS
- Fnaire
- Wegz (Arab crossover appeal)
- Hamza Namira

### 8.3 International Coverage

- Afrobeats: Burna Boy, Wizkid, Tems (massive in Morocco)
- Hip-Hop: Drake, Kendrick, Cardi B, Travis Scott
- Arab Pop: Amr Diab legacy, Mohamed Ramadan, Assala
- K-Pop: BTS, BLACKPINK (growing Moroccan fanbase)
- French Urban: Maes, Ninho, SCH, Aya Nakamura

---

## 9. Monetization Model

| Revenue Stream | Implementation |
|---|---|
| **Display Ads** | Google AdSense / direct deals (non-intrusive placement) |
| **Sponsored Content** | Clearly labeled "PARTNER" pill, editorial tone maintained |
| **Newsletter Sponsorships** | Weekly newsletter with sponsored slot |
| **Affiliate Links** | Music platform subscriptions (Spotify, Anghami, Deezer) |
| **Event Promotion** | Paid event listings for concerts, festivals |
| **Premium Tier (future)** | Ad-free + early access exclusives |

---

## 10. SEO & Discoverability

### 10.1 Technical SEO

- **Structured Data**: `Article`, `MusicAlbum`, `Person`, `Event` JSON-LD schemas.
- **Open Graph**: Rich previews for WhatsApp & Instagram link sharing.
- **Twitter Cards**: Artist-branded cards for tweets.
- **Sitemap**: Auto-generated XML sitemap via Next.js.
- **robots.txt**: Fine-tuned per content type.
- **Canonical URLs**: Per locale (`hreflang` tags for FR/AR/EN).

### 10.2 Social Optimization

Every article automatically generates:
- A square (1:1) social card image.
- A Stories format (9:16) card image.
- Pre-written tweet/caption text with hashtags.

Primary hashtags: `#Mainstagent` `#MoroccanMusic` `#MusicMA` `#Gossip` (section-dependent)

---

## 11. CMS Schema (Sanity)

### Core Document Types

```javascript
// Artist
{
  name: string,
  slug: slug,
  photo: image,
  coverImage: image,
  nationality: string,
  genres: array<string>,
  biography: { fr: blockContent, ar: blockContent, en: blockContent },
  socialLinks: { instagram, spotify, youtube, tiktok, twitter },
  dominantColor: string, // hex — for page theming
  status: 'active' | 'legacy' | 'emerging',
}

// Article
{
  title: { fr, ar, en },
  slug: slug,
  category: reference<Category>,
  tags: array<string>,
  featuredImage: image,
  excerpt: { fr, ar, en },
  body: { fr, ar, en }, // Portable Text
  relatedArtists: array<reference<Artist>>,
  publishedAt: datetime,
  author: reference<Author>,
  isBreaking: boolean,
  isExclusive: boolean,
  isFeatured: boolean,
}

// Album
{
  title: string,
  artist: reference<Artist>,
  releaseDate: date,
  coverArt: image,
  genres: array<string>,
  spotifyId: string,
  appleMusicId: string,
  anghamiId: string,
  tracklist: array<{ trackNumber, title, durationSec, isLead }>,
  mainstagentScore: number, // 0–10
  review: reference<Article>,
}
```

---

## 12. Design System Components

### Component Library (to be built in Storybook)

```
Atoms:
  - Badge (category, breaking, exclusive, partner)
  - Button (primary, secondary, ghost, icon)
  - Pill (genre tag, filter)
  - Avatar (with status ring)
  - ScoreBadge (vinyl-style, 1–10)
  - ReactionButton (emoji + count)
  - PlayButton (animated pulse)

Molecules:
  - ArticleCard (feature, standard, gossip, video variants)
  - AlbumCard (square, with score)
  - ArtistCard (vertical portrait)
  - ChartRow (rank, movement, expand)
  - QuoteBlock (pull quote)
  - TrackRow (tracklist item)
  - TagStrip (horizontal scrollable tags)

Organisms:
  - HeroSection (video, headline, CTA)
  - FeedGrid (masonry/editorial layout)
  - GossipStrip (marquee banner)
  - ChartTable (full chart)
  - ArtistHeader (profile hero)
  - AlbumHeader (review hero)
  - NowSpinning (floating player)
  - MobileNav (bottom tab bar)
  - Heatmap (trending sidebar)
```

---

## 13. Launch Roadmap

### Phase 1 — MVP (Weeks 1–8)

- [ ] Brand identity finalized (logo, colors, typography)
- [ ] Next.js project scaffold + Sanity CMS setup
- [ ] Home feed + Article pages (FR only)
- [ ] Music + Gossip sections live
- [ ] 20 seed articles pre-loaded
- [ ] Mobile-responsive base layout
- [ ] Social sharing + OG images

### Phase 2 — Feature Complete (Weeks 9–16)

- [ ] Arabic (RTL) full support
- [ ] Artist profile pages
- [ ] Album review pages
- [ ] Charts page (weekly update flow)
- [ ] Emoji reactions (Supabase)
- [ ] User accounts + reading list
- [ ] Push notification opt-in
- [ ] Newsletter (Resend integration)
- [ ] Algolia search

### Phase 3 — Growth (Weeks 17–24)

- [ ] English locale
- [ ] "Quote to Card" generator
- [ ] Artist Radar section
- [ ] Exclusive interviews section
- [ ] Monetization (ads, affiliate)
- [ ] PWA install prompt
- [ ] Performance audit & optimization
- [ ] SEO deep-dive + structured data

---

## 14. File & Folder Structure

```
themainstagent/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx               → Home feed
│   │   ├── music/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── artists/
│   │   │   └── [slug]/page.tsx
│   │   ├── gossip/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── charts/page.tsx
│   │   └── exclusives/
│   │       └── [slug]/page.tsx
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── layouts/
├── lib/
│   ├── sanity/
│   ├── supabase/
│   └── algolia/
├── styles/
│   ├── globals.css
│   ├── tokens.css          → CSS custom properties
│   └── animations.css      → Keyframes library
├── public/
│   ├── fonts/
│   └── assets/
├── messages/               → i18n strings (fr.json, ar.json, en.json)
├── sanity/                 → CMS schema
└── studio/                 → Sanity Studio (admin UI)
```

---

## 15. Appendix — Design Inspiration References

| Reference | What to Borrow |
|---|---|
| **Pitchfork** | Editorial authority, album score presentation |
| **i-D Magazine** | Visual rawness, editorial photography, typography boldness |
| **The Face** | Youth culture tone, layout audacity |
| **Rolling Stone** | Long-form interview structure |
| **Fader** | Underground cred, artist-first approach |
| **TikTok / Instagram Reels** | Urgency, visual stacking, bite-size reactions |
| **Highsnobiety** | Commerce + culture blend, product x music coverage |
| **Nansen (Web3 dashboards)** | Data-viz inspiration for charts section |
| **Linear.app** | Motion precision, dark UI polish |
| **Arc Browser** | Custom cursor, spatial UI delight |

---

*Document version: 1.0 — Created for The Mainstagent development team*
*Prepared by: [Lead Designer / PM]*
*Last updated: April 2026*

---

> **"La scène, c'est ici."** — The Mainstagent
