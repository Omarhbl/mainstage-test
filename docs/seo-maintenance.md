# Mainstage SEO maintenance

## Technical changes (November 2026)

- Events, Cinema, Trending, People, Sport, and Culture receive published content from the server. Their client components preserve the existing interactions. Events and Cinema use the same cached feeds and manual listings as before.
- Category listings send card data without article bodies and do not immediately refetch the same data on hydration. React request memoization deduplicates article queries used by metadata and page rendering.
- Page-specific titles, descriptions, and canonicals cover categories, article archives, Top 50, search, and legal pages. Production URL fallback uses the real domain.
- Homepage, Cinema, and Events have primary headings. Existing article/category headings remain in place.
- Article bylines identify Mainstage Editorial, linked to About. NewsArticle author markup matches the visible attribution; it does not invent individual authors.
- Article modification dates use saved editorial timestamps, with invalid dates and impossible chronology rejected. Relative or missing dates are omitted from search metadata rather than converted to today's date.
- Static sitemap entries omit unknown modification dates; article entries use known timestamps. The sitemap is refreshed hourly and invalidated by normal article publishing/editing actions.
- Private backoffice, backstage, login, access-denied, and internal search pages opt out of indexing through metadata. Authentication remains the protection for private data.
- JSON-LD safely escapes less-than characters to prevent article content closing the script element.
- Below-fold images lazy-load and decode asynchronously; hero images retain eager/high-priority loading. Homepage and Music data fetching runs in parallel.

## Google account work still required

1. Open Google Search Console with the owner's account and confirm the property for `themainstagent.com`. A configured verification environment variable alone does not prove account verification or access.
2. Submit `https://themainstagent.com/sitemap.xml` once. Publishing articles will update this sitemap automatically.
3. Inspect the homepage, Events, Cinema, and a representative article using URL Inspection. Review canonical selection and rendered HTML.
4. Review indexing exclusions and Core Web Vitals using real Search Console reports. No ranking or performance score is inferred from code checks.
5. Run PageSpeed Insights on representative mobile pages, then prioritize image transfer sizes, LCP, INP, and CLS from actual measurements.

## Editorial routine

- Use accurate headlines, summaries, dates, image descriptions, and source attribution. Keep each story original and useful.
- Link to relevant existing Mainstage coverage naturally inside articles. Do not add unrelated keywords or mass-produce city pages.
- Build useful local coverage around confirmed events, Moroccan artists, cinema releases, and festivals. Example topics: concerts in Casablanca this month, festival guides, artist interviews, and weekly cinema selections.
- Review search queries and impressions monthly in Search Console before choosing new topics or changing titles.
- Add individual author profiles/bylines when the newsroom supplies real names and attribution rules; retain organization attribution otherwise.

Sources: Google Search Central [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Article markup](https://developers.google.com/search/docs/appearance/structured-data/article), [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), and [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).
