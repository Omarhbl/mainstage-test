import type { CSSProperties } from "react";

export type ArticleCard = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categories?: string[];
  tags?: string[];
  image: string;
  imageClassName?: string;
  imagePositionX?: number;
  imagePositionY?: number;
};

export type ArticleRecord = ArticleCard & {
  date: string;
  heroMedia: {
    type: "video" | "image";
    src: string;
  };
  imageCaption?: string;
  intro: string;
  body: string[];
  bodyHtml?: string;
  bottomMedia?: {
    type: "youtube" | "image";
    src: string;
    title?: string;
  };
  similarSlugs: string[];
};

export function getArticleCardsFromRecords(records: ArticleRecord[]): ArticleCard[] {
  return records.map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    categories: article.categories,
    tags: article.tags,
    image: article.image,
    imageClassName: article.imageClassName,
    imagePositionX: article.imagePositionX,
    imagePositionY: article.imagePositionY,
  }));
}

export function getArticleImageStyle(
  article: Pick<ArticleCard, "imagePositionX" | "imagePositionY">
): CSSProperties | undefined {
  const x =
    typeof article.imagePositionX === "number" ? article.imagePositionX : 50;
  const y =
    typeof article.imagePositionY === "number" ? article.imagePositionY : 50;

  return {
    objectPosition: `${x}% ${y}%`,
  };
}

export function normalizeYouTubeEmbedUrl(value?: string | null) {
  const rawValue = value?.trim();

  if (!rawValue) {
    return "";
  }

  if (rawValue.includes("/embed/")) {
    return rawValue;
  }

  try {
    const url = new URL(rawValue);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = url.pathname.replace(/^\/+/, "").split("/")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : rawValue;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const segments = url.pathname.split("/").filter(Boolean);

      if (segments[0] === "shorts" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`;
      }

      if (segments[0] === "watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : rawValue;
      }
    }
  } catch {
    return rawValue;
  }

  return rawValue;
}

export const HOMEPAGE_MUST_READ_SLUG =
  "inkonnu-split-turns-fragmentation-into-a-language-of-its-own";

export function hasArticleCategory(
  article: Pick<ArticleCard, "category" | "categories">,
  category: string
) {
  const normalizedCategory =
    category.toLowerCase() === "events" ? "entertainment" : category.toLowerCase();
  const allCategories = [article.category, ...(article.categories ?? [])]
    .filter(Boolean)
    .map((entry) => entry.toLowerCase());

  return allCategories.includes(normalizedCategory);
}

export function getDisplayCategoryLabel(category?: string) {
  if (!category) {
    return "";
  }

  return category.toLowerCase() === "entertainment" ? "Events" : category;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function parseRelativeCount(value?: string) {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  const numericMatch = normalized.match(/^(\d+)/);

  if (numericMatch) {
    return Number(numericMatch[1]);
  }

  const wordMatch = normalized.match(
    /^(one|two|three|four|five|six|seven|eight|nine|ten)\b/
  );

  if (wordMatch) {
    return NUMBER_WORDS[wordMatch[1]] ?? null;
  }

  return null;
}

export function formatArticleDate(dateLabel?: string) {
  const now = new Date();

  if (!dateLabel) {
    return `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;
  }

  const normalized = dateLabel.trim().toLowerCase();
  const derivedDate = new Date(now);

  if (normalized === "today") {
    return `${String(derivedDate.getDate()).padStart(2, "0")}/${String(
      derivedDate.getMonth() + 1
    ).padStart(2, "0")}/${derivedDate.getFullYear()}`;
  }

  if (normalized === "yesterday") {
    derivedDate.setDate(derivedDate.getDate() - 1);
    return `${String(derivedDate.getDate()).padStart(2, "0")}/${String(
      derivedDate.getMonth() + 1
    ).padStart(2, "0")}/${derivedDate.getFullYear()}`;
  }

  if (normalized === "this week") {
    derivedDate.setDate(derivedDate.getDate() - 3);
    return `${String(derivedDate.getDate()).padStart(2, "0")}/${String(
      derivedDate.getMonth() + 1
    ).padStart(2, "0")}/${derivedDate.getFullYear()}`;
  }

  if (normalized.includes("hour") && normalized.includes("ago")) {
    const hours = parseRelativeCount(normalized);
    if (hours !== null) {
      derivedDate.setHours(derivedDate.getHours() - hours);
      return `${String(derivedDate.getDate()).padStart(2, "0")}/${String(
        derivedDate.getMonth() + 1
      ).padStart(2, "0")}/${derivedDate.getFullYear()}`;
    }
  }

  if (normalized.includes("day") && normalized.includes("ago")) {
    const days = parseRelativeCount(normalized);
    if (days !== null) {
      derivedDate.setDate(derivedDate.getDate() - days);
      return `${String(derivedDate.getDate()).padStart(2, "0")}/${String(
        derivedDate.getMonth() + 1
      ).padStart(2, "0")}/${derivedDate.getFullYear()}`;
    }
  }

  return dateLabel;
}

export function getPublicationWeight(dateLabel?: string) {
  if (!dateLabel) return Number.POSITIVE_INFINITY;

  const normalized = dateLabel.trim().toLowerCase();

  const absoluteDateMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (absoluteDateMatch) {
    const [, day, month, year] = absoluteDateMatch;
    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0,
      0
    );

    if (!Number.isNaN(parsedDate.getTime())) {
      return -parsedDate.getTime();
    }
  }

  const isoDateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0,
      0
    );

    if (!Number.isNaN(parsedDate.getTime())) {
      return -parsedDate.getTime();
    }
  }

  if (normalized === "today") return 0;
  if (normalized === "yesterday") return 24;
  if (normalized === "this week") return 168;

  if (normalized.includes("hour") && normalized.includes("ago")) {
    const hours = parseRelativeCount(normalized);
    if (hours !== null) return hours;
  }

  if (normalized.includes("day") && normalized.includes("ago")) {
    const days = parseRelativeCount(normalized);
    if (days !== null) return days * 24;
  }

  const weekMatch = normalized.match(/(\d+)\s+weeks?\s+ago/);
  if (weekMatch) return Number(weekMatch[1]) * 24 * 7;

  const wordWeekMatch = normalized.match(
    /^(one|two|three|four|five|six|seven|eight|nine|ten)\s+weeks?\s+ago/
  );
  if (wordWeekMatch) {
    return (NUMBER_WORDS[wordWeekMatch[1]] ?? Number.POSITIVE_INFINITY) * 24 * 7;
  }

  return Number.POSITIVE_INFINITY;
}

export function getSortedArticleCardsFromRecords(records: ArticleRecord[]): ArticleCard[] {
  return records
    .map((article, index) => ({
      index,
      card: {
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        category: article.category,
        categories: article.categories,
        image: article.image,
        imageClassName: article.imageClassName,
        imagePositionX: article.imagePositionX,
        imagePositionY: article.imagePositionY,
      } satisfies ArticleCard,
      weight: getPublicationWeight(article.date),
    }))
    .sort((left, right) => {
      if (left.weight !== right.weight) {
        return left.weight - right.weight;
      }

      return left.index - right.index;
    })
    .map(({ card }) => card);
}

export function searchArticlesInRecords(records: ArticleRecord[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const scoredArticles = records
    .map((article) => {
      const haystack = [
        article.title,
        article.summary,
        article.intro,
        article.category,
        ...(article.categories ?? []),
        ...(article.tags ?? []),
        ...article.body,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return null;
      }

      let score = 0;

      if (article.title.toLowerCase().includes(normalizedQuery)) score += 5;
      if (article.summary.toLowerCase().includes(normalizedQuery)) score += 3;
      if (article.intro.toLowerCase().includes(normalizedQuery)) score += 2;
      if (article.category.toLowerCase().includes(normalizedQuery)) score += 2;
      if ((article.categories ?? []).some((entry) => entry.toLowerCase().includes(normalizedQuery))) {
        score += 2;
      }
      if ((article.tags ?? []).some((entry) => entry.toLowerCase().includes(normalizedQuery))) {
        score += 2;
      }

      return { article, score };
    })
    .filter(Boolean) as { article: ArticleRecord; score: number }[];

  return scoredArticles
    .sort((left, right) => right.score - left.score)
    .map(({ article }) => article);
}

export function searchArticles(query: string) {
  return searchArticlesInRecords(Object.values(articlesBySlug), query);
}

export const articlesBySlug: Record<string, ArticleRecord> = {
  "inside-kanye-wests-most-controversial-show-yet-in-la": {
    slug: "inside-kanye-wests-most-controversial-show-yet-in-la",
    date: "Four hours ago",
    title: "Inside Kanye West's Most Controversial Show Yet in LA",
    summary:
      "Kanye West doesn't do normal shows, and his latest performance in Los Angeles proved it once again. What was expected to be a live concert quickly turned into something else: a raw, stripped-down, and deeply polarizing experience.",
    category: "Music",
    categories: ["Culture", "Entertainment"],
    image: "https://www.rollingstone.com/wp-content/uploads/2026/04/kanye-at-sofi.jpg?w=1581&h=1054&crop=1",
    heroMedia: {
      type: "image",
      src: "https://www.rollingstone.com/wp-content/uploads/2026/04/kanye-at-sofi.jpg?w=1581&h=1054&crop=1",
    },
    imageCaption: "Four cropped image",
    intro:
      "Kanye West doesn't do normal shows, and his latest performance in Los Angeles proved it once again. What was expected to be a live concert quickly turned into something else: a raw, stripped-down, and deeply polarizing experience.",
    body: [
      "Kanye West's latest performance in Los Angeles aligned with his fans yet again: the artist pushing expectations to the edge. Surrounded by an atmosphere that felt both intimate and cinematic, he transformed the evening into more than a concert. The staging, the pauses, the unfinished edges, and the emotional weight all suggested something closer to performance art than a standard live show.",
      "Throughout the night, Kanye seemed less interested in delivering polished spectacle and more focused on presence, tension, and surprise. Tracks arrived with little warning, visuals shifted without explanation, and the audience was left moving between awe and uncertainty. It was intense, unpredictable, and unmistakably his.",
      "This approach created an immediate divide within the crowd. Some experienced it as a moment of complete immersion, while others wanted the structure and release of a more traditional concert. But that friction is exactly what gives Kanye's performances their strange gravitational pull. They refuse to settle into comfort.",
      "Beyond the music itself, there was a larger point in the way this show unfolded. Kanye once again reminded people that he isn't interested in simply repeating the gestures of live entertainment. Even when the result feels unresolved, that risk is central to the experience. The audience isn't just watching a show. They're stepping into a space where spectacle, ego, art, and instability collide.",
      "For better or worse, performances like this are why his live appearances still dominate conversation long after the lights go down. They provoke, confuse, and linger. In a landscape where many shows are designed to feel instantly consumable, Kanye continues to build moments that resist easy agreement and stay in people's heads long after the night ends.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/r16q61iDfeg",
      title: "Kanye West performance video",
    },
    similarSlugs: [
      "michael-the-king-of-pop-returns-to-the-big-screen",
      "shobee-a-comeback-that-feels-intentional",
      "casablanca-en-scene-a-night-of-laughter",
    ],
  },
  "michael-the-king-of-pop-returns-to-the-big-screen": {
    slug: "michael-the-king-of-pop-returns-to-the-big-screen",
    date: "Five hours ago",
    title: "Michael, The King of Pop Returns to the Big Screen",
    summary:
      "The legend is coming back to life. The new Michael biopic promises a closer look at the pressure, scale, and myth behind one of the most iconic artists of all time.",
    category: "Cinema",
    image: "https://media.pathe.ma/movie/mx/50589/lg/136/media",
    heroMedia: {
      type: "image",
      src: "https://media.pathe.ma/movie/mx/50589/lg/136/media",
    },
    imageCaption: "Film teaser visual",
    intro:
      "The legend is coming back to life. The new Michael biopic promises a closer look at the pressure, scale, and myth behind one of the most iconic artists of all time.",
    body: [
      "Biopics live or die by their ability to balance reverence with revelation, and Michael enters that conversation with a huge burden already on its shoulders. Audiences do not just want a polished celebration. They want a film that can deal honestly with talent, family, ambition, and the cost of being turned into a symbol before becoming an adult.",
      "What makes this project so closely watched is the impossible scale of the figure at its center. Michael Jackson was not simply a pop star. He became a global image, a commercial machine, a cultural obsession, and a projection surface for entire generations. Any film attempting to compress that into a single emotional arc has to choose carefully what it highlights and what it leaves in the shadows.",
      "That is where the excitement around the film comes from. The best version of Michael would not just recreate the familiar moments. It would capture the tension of an artist living inside permanent spectacle. The pressure, the precision, the isolation, the reinvention. Those details are what could make the film resonate beyond nostalgia.",
      "For younger audiences, this release may also function as a reintroduction. A large part of the public knows the iconography before they know the music in context. A strong film can reconnect the image to the discipline, fear, and ambition that built it.",
      "If the final result delivers that balance, Michael could do more than revisit a legacy. It could help explain why that legacy still feels unfinished every time the lights go down and the songs start again.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/3zOLzsbOleM",
      title: "Michael related YouTube video",
    },
    similarSlugs: [
      "inside-kanye-wests-most-controversial-show-yet-in-la",
      "shobee-a-comeback-that-feels-intentional",
      "casablanca-en-scene-a-night-of-laughter",
    ],
  },
  "beast-arrives-with-a-darker-and-more-brutal-cinematic-scale": {
    slug: "beast-arrives-with-a-darker-and-more-brutal-cinematic-scale",
    date: "Today",
    title: "Beast Arrives With a Darker and More Brutal Cinematic Scale",
    summary:
      "Beast is shaping up to be one of the season's most intense releases, built around spectacle, pressure, and a much harsher visual tone.",
    category: "Cinema",
    image:
      "https://resizing.flixster.com/TON2-jN92H4JLZi-9ci4r_HUCNI=/fit-in/705x460/v2/https://resizing.flixster.com/Y1OoR5CWyNcvflF5JhhdAP8aqEs=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzJlYjM5YTEwLTgwYTMtNDViZi05ZDRhLTFkOGRiODg5M2FmNC5qcGc=",
    heroMedia: {
      type: "image",
      src: "https://resizing.flixster.com/TON2-jN92H4JLZi-9ci4r_HUCNI=/fit-in/705x460/v2/https://resizing.flixster.com/Y1OoR5CWyNcvflF5JhhdAP8aqEs=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzJlYjM5YTEwLTgwYTMtNDViZi05ZDRhLTFkOGRiODg5M2FmNC5qcGc=",
    },
    imageCaption: "Beast official visual",
    intro:
      "Beast doesn't look interested in subtlety. From its first images, the film projects pressure, scale, and a darker cinematic intensity.",
    body: [
      "Some releases arrive with curiosity around them. Others arrive already carrying the shape of an event. Beast feels much closer to the second category. Its visual identity is heavy, tense, and built to overwhelm rather than gently persuade.",
      "That tone matters because audiences are increasingly drawn to films that promise a clear atmosphere from the start. Beast seems to understand that instinct well. The appeal is not just the story itself, but the force of the world it appears to be building around it.",
      "There is also something strategic in how brutal the visual language feels. Instead of softening the scale to make it more universally approachable, the project leans into impact. That gives the release a sharper personality in a crowded schedule.",
      "If the final film can sustain that same level of pressure beyond its marketing, Beast could end up standing out as more than a release with hype behind it. It could become one of the titles that defines the mood of the season.",
      "For now, what is clear is simple: Beast is entering the conversation with confidence, and cinema audiences are already reading it as one of the heavier titles on the horizon.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/IdjVY7jF6D4",
      title: "Beast trailer",
    },
    similarSlugs: [],
  },
  "spider-man-brand-new-day-already-feels-like-a-global-event": {
    slug: "spider-man-brand-new-day-already-feels-like-a-global-event",
    date: "Today",
    title: "Spider-Man: Brand New Day Already Feels Like a Global Event",
    summary:
      "Even before release, Spider-Man: Brand New Day is carrying the weight of expectation, franchise pressure, and global fan attention.",
    category: "Cinema",
    image:
      "https://m.media-amazon.com/images/M/MV5BNGI2NTQ3YzItMTJlYi00ODU1LWJjNDAtYzRmZTk2ODA1MjQwXkEyXkFqcGdeQWFkcmllY2xh._V1_.jpg",
    heroMedia: {
      type: "image",
      src: "https://m.media-amazon.com/images/M/MV5BNGI2NTQ3YzItMTJlYi00ODU1LWJjNDAtYzRmZTk2ODA1MjQwXkEyXkFqcGdeQWFkcmllY2xh._V1_.jpg",
    },
    imageCaption: "Spider-Man: Brand New Day poster",
    intro:
      "Long before opening weekend, Spider-Man: Brand New Day is already moving like a global event.",
    body: [
      "That is the reality of a franchise this large: anticipation starts building before the full shape of the film is even visible. Every image, every poster, and every rumor gets absorbed into the scale of expectation.",
      "What makes this release especially interesting is how much pressure sits around reinvention. Spider-Man projects cannot survive on familiarity alone anymore. Audiences want the comfort of the brand, but they also want a reason to believe this chapter matters on its own terms.",
      "Brand New Day appears to be stepping directly into that tension. It has to feel recognizably Spider-Man while still convincing viewers that the emotional and cinematic stakes are rising again.",
      "That challenge is part of what makes the conversation around the film so intense already. People are not simply waiting for another blockbuster. They are measuring whether the franchise can still create surprise at this scale.",
      "If it can, Brand New Day could quickly become one of the defining crowd events of its release window. And if it cannot, the reaction will be just as loud. That is what happens when a film enters the culture before it even arrives.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/aBlsrtxuwss",
      title: "Spider-Man: Brand New Day trailer",
    },
    similarSlugs: [],
  },
  "shobee-a-comeback-that-feels-intentional": {
    slug: "shobee-a-comeback-that-feels-intentional",
    date: "Six hours ago",
    title: "Shobee, A comeback that feels intentional",
    summary:
      "After a relatively quiet period, Shobee is back with a sharper, colder energy. This return feels less nostalgic and more like a deliberate reset of the narrative.",
    category: "Music",
    image: "https://i.ytimg.com/vi/Fdx_P-NcvXg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB3S1xsc6Pn1OQUib-xUY60O5sN4g",
    imageClassName: "scale-[1.12]",
    heroMedia: {
      type: "image",
      src: "https://i.ytimg.com/vi/Fdx_P-NcvXg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB3S1xsc6Pn1OQUib-xUY60O5sN4g",
    },
    imageCaption: "Shobee campaign still",
    intro:
      "After a relatively quiet period, Shobee is back with a sharper, colder energy. This return feels less nostalgic and more like a deliberate reset of the narrative.",
    body: [
      "Comebacks often rely on a familiar trick: remind the audience what they already loved and hope the memory does the rest. What makes this phase around Shobee more interesting is that it does not feel built around comfort. The image is cleaner, the tone is more calculated, and the material seems designed to reposition him instead of simply revive him.",
      "That distinction matters. In a fast feed economy, returning is not enough. Artists have to explain why they still matter now. Shobee seems aware of that. The choices around visuals, pacing, and atmosphere suggest someone rebuilding attention from the ground up rather than cashing in on a previous peak.",
      "There is also something strategic in how restrained this move feels. Instead of trying to overwhelm the audience with noise, the rollout leaves room for interpretation. That gives the music a colder, more controlled aura, and it helps the comeback feel intentional instead of desperate.",
      "What audiences seem to be responding to is exactly that sense of control. This is not framed as a sentimental homecoming. It is framed as a precise re-entry into the conversation, with enough confidence to let the work speak first.",
      "If the next releases maintain that discipline, Shobee's return may end up being defined less by hype than by clarity. And in a crowded scene, clarity can be the strongest flex of all.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/Fdx_P-NcvXg",
      title: "Shobee related YouTube video",
    },
    similarSlugs: [
      "inside-kanye-wests-most-controversial-show-yet-in-la",
      "michael-the-king-of-pop-returns-to-the-big-screen",
      "casablanca-en-scene-a-night-of-laughter",
    ],
  },
  "inkonnu-split-turns-fragmentation-into-a-language-of-its-own": {
    slug: "inkonnu-split-turns-fragmentation-into-a-language-of-its-own",
    date: "Today",
    title: "Inkonnu's SPLIT Turns Fragmentation Into a Language of Its Own",
    summary:
      "With SPLIT, Inkonnu leans into rupture, cold textures, and emotional distance to build one of his most controlled bodies of work yet.",
    category: "Music",
    image: "/Artists/inkonnu.jpg",
    heroMedia: {
      type: "image",
      src: "/Artists/inkonnu.jpg",
    },
    imageCaption: "Inkonnu visual from the SPLIT era",
    intro:
      "SPLIT doesn't try to smooth anything over. It thrives on rupture, tension, and the feeling that identity itself can arrive in fragments.",
    body: [
      "What makes the project compelling is how deliberate that fragmentation feels. Inkonnu isn't simply chasing darkness for effect. He builds an atmosphere where distance, coldness, and internal pressure become part of the architecture of the songs themselves.",
      "The result is a body of work that feels controlled without becoming sterile. There is still emotion in it, but it is filtered through restraint. Instead of oversharing, SPLIT lets texture and repetition do the talking.",
      "That approach gives the album a rare kind of focus. Every visual choice, every tonal shift, and every pause seems to reinforce the same idea: this is not a project looking for approval. It is a project asserting its own language.",
      "In a scene that often rewards immediate impact, SPLIT works differently. It asks for attention, but it does not beg for it. It trusts mood, precision, and world-building enough to let the listener come toward it.",
      "That is what makes the album stand out. Not just the sound, but the confidence behind it. Inkonnu turns dislocation into identity, and on SPLIT that identity feels sharper than ever.",
    ],
    similarSlugs: [],
  },
  "onzys-moveta-feels-like-a-project-built-for-after-hours": {
    slug: "onzys-moveta-feels-like-a-project-built-for-after-hours",
    date: "Today",
    title: "Onzy's Moveta Feels Like a Project Built for After Hours",
    summary:
      "With Moveta, Onzy leans into atmosphere, late-night tension, and a colder sense of control that gives the project its own lane.",
    category: "Music",
    image: "https://yt3.googleusercontent.com/XI_y2x5he8iquR7H42_SbJHKRb2Qm7CqK2Y-mxkRM2lpR0Yrbrn3ohq7DKbwTJtjYF6-29nPLw=s900-c-k-c0x00ffffff-no-rj",
    heroMedia: {
      type: "image",
      src: "https://yt3.googleusercontent.com/XI_y2x5he8iquR7H42_SbJHKRb2Qm7CqK2Y-mxkRM2lpR0Yrbrn3ohq7DKbwTJtjYF6-29nPLw=s900-c-k-c0x00ffffff-no-rj",
    },
    imageCaption: "Onzy visual for Moveta",
    intro:
      "Moveta doesn't arrive like a loud statement. It lands more like a mood, deliberate and nocturnal, built to sit with you after the first listen.",
    body: [
      "What makes the project interesting is how much it relies on atmosphere rather than immediate overexposure. Onzy seems less interested in forcing a big moment and more focused on building a world that feels self-contained.",
      "That world is colder, slower, and more intentional than a lot of what usually dominates the feed. Tracks on Moveta feel designed for after-hours listening, where texture and pacing matter as much as hooks.",
      "There is also a sense of control running through the project. Nothing feels accidental. The sequencing, the tone, and the restraint all suggest an artist paying close attention to how identity is built through repetition and mood.",
      "That is what gives Moveta its edge. It does not chase noise. It trusts atmosphere, which can be a much stronger move when everyone else is trying to be louder.",
      "If this is the direction Onzy keeps developing, Moveta may end up reading as more than a release. It could be the project that clarifies his lane in a way people can no longer ignore.",
    ],
    similarSlugs: [],
  },
  "casablanca-en-scene-a-night-of-laughter": {
    slug: "casablanca-en-scene-a-night-of-laughter",
    date: "Yesterday",
    title: "Casablanca en Scène : A night of laughter",
    summary:
      "Casablanca is getting ready to laugh. A new comedy night is shaping up to become one of the city's warmest and most crowd-friendly cultural moments.",
    category: "Entertainment",
    categories: ["Culture", "Sport"],
    image: "https://ticket-assets.s3.us-east-1.amazonaws.com/categories/1772233608684-qhd0uaeyhte.png",
    heroMedia: {
      type: "image",
      src: "https://ticket-assets.s3.us-east-1.amazonaws.com/categories/1772233608684-qhd0uaeyhte.png",
    },
    imageCaption: "Casablanca en Scène promo visual",
    intro:
      "Casablanca is getting ready to laugh. A new comedy night is shaping up to become one of the city's warmest and most crowd-friendly cultural moments.",
    body: [
      "Casablanca has no shortage of nightlife, but events that create real communal energy still feel rare. Casablanca en Scène looks promising because it aims for exactly that balance: accessible, social, and lively without losing its sense of curation.",
      "Comedy events work best when they feel local in rhythm and universal in feeling. The format here seems to understand that. The appeal is not only in the lineup, but in the atmosphere around it: a room built for release, recognition, and the kind of shared laughter that turns strangers into a temporary crowd.",
      "That matters in a city where so many cultural nights are judged by image first. A good comedy event changes the equation. It gives people a reason to show up for mood, timing, and human presence, not just for photos or positioning.",
      "If Casablanca en Scène can keep that warmth while maintaining quality, it could become more than a one-night success. It could grow into one of the city's most dependable recurring evenings, the kind of event that creates its own loyal audience over time.",
      "For now, the promise is simple and strong: a lighter, sharper, more joyful night out in Casablanca. Sometimes that is exactly the cultural reset a city needs.",
    ],
    bottomMedia: {
      type: "youtube",
      src: "https://www.youtube.com/embed/r16q61iDfeg",
      title: "Casablanca en Scène related YouTube video",
    },
    similarSlugs: [
      "inside-kanye-wests-most-controversial-show-yet-in-la",
      "michael-the-king-of-pop-returns-to-the-big-screen",
      "shobee-a-comeback-that-feels-intentional",
    ],
  },
  "bad-bunny-isnt-just-a-star-hes-the-blueprint": {
    slug: "bad-bunny-isnt-just-a-star-hes-the-blueprint",
    date: "Two hours ago",
    title: "Bad Bunny Isn't Just a Star — He's the Blueprint",
    summary:
      "Bad Bunny didn't just become successful — he changed the rules of what success looks like, and a whole generation is now studying that model.",
    category: "People",
    image: "https://cdn.unitycms.io/images/6RtmmJzB4xJ89VixQONA_B.jpg",
    heroMedia: {
      type: "image",
      src: "https://cdn.unitycms.io/images/6RtmmJzB4xJ89VixQONA_B.jpg",
    },
    imageCaption: "People feature visual",
    intro:
      "Bad Bunny didn't just become successful — he changed the rules of what success looks like.",
    body: [
      "At a time when global artists were still adapting themselves to fit the industry, he did the opposite. He stayed rooted in his language, his culture, his identity — and forced the industry to adapt to him. No translation, no compromise, no dilution. Just consistency and clarity.",
      "But what makes him the blueprint isn't just the music. It's the ecosystem he built around himself. Fashion appearances that feel intentional, collaborations that expand his reach without weakening his identity, and a public image that balances accessibility with mystery.",
      "He understands something many artists still struggle with: being global doesn't mean being generic.",
      "Today, a whole generation is following that model — not necessarily copying his sound, but studying his positioning. Because Bad Bunny proved that the most powerful move in a saturated industry is not fitting in.",
      "It's standing firm.",
    ],
    similarSlugs: [],
  },
  "achraf-hakimi-is-quietly-becoming-moroccos-most-powerful-cultural-export": {
    slug: "achraf-hakimi-is-quietly-becoming-moroccos-most-powerful-cultural-export",
    date: "Today",
    title: "Achraf Hakimi Is Quietly Becoming Morocco's Most Powerful Cultural Export",
    summary:
      "Achraf Hakimi is expanding his presence across sport, fashion, and media with a kind of control that makes the rise feel even stronger.",
    category: "People",
    categories: ["Culture", "Sport"],
    image: "https://industries.ma/wp-content/uploads/2025/12/hakimi.jpg",
    heroMedia: {
      type: "image",
      src: "https://industries.ma/wp-content/uploads/2025/12/hakimi.jpg",
    },
    imageCaption: "People feature visual",
    intro:
      "Achraf Hakimi doesn't need to be loud to be seen.",
    body: [
      "From Champions League nights with Paris Saint-Germain to appearances in global campaigns, his presence keeps expanding — but always with control. No unnecessary statements, no overexposure, no forced visibility. Just a steady, deliberate rise.",
      "What makes his trajectory interesting is how balanced it is. He represents Morocco on a global stage without turning it into a performance. He's present in fashion, in sports, in media — but never stretched too thin.",
      "In an era where visibility is often confused with relevance, Hakimi is choosing a different path: consistency over noise.",
      "And that's exactly what's building his power.",
      "Because cultural influence today isn't about who speaks the most — it's about who moves with intention.",
    ],
    similarSlugs: [],
  },
  "hailey-bieber-mastered-the-art-of-being-talked-about-without-saying-much": {
    slug: "hailey-bieber-mastered-the-art-of-being-talked-about-without-saying-much",
    date: "Yesterday",
    title: "Hailey Bieber Mastered the Art of Being Talked About Without Saying Much",
    summary:
      "Hailey Bieber turned restraint into strategy, proving that influence now comes from curation, not constant noise.",
    category: "People",
    image: "https://media.allure.com/photos/6940198fd9db0bc7a28e2610/16:9/w_2560%2Cc_limit/hailey%2520bieber%2520lob%2520hair%2520cut%2520december.jpg",
    heroMedia: {
      type: "image",
      src: "https://media.allure.com/photos/6940198fd9db0bc7a28e2610/16:9/w_2560%2Cc_limit/hailey%2520bieber%2520lob%2520hair%2520cut%2520december.jpg",
    },
    imageCaption: "People feature visual",
    intro:
      "In a world built on constant content, Hailey Bieber chose restraint — and it worked.",
    body: [
      "She doesn't dominate the conversation by oversharing. She does it by appearing at the right moment, in the right place, with the right image. Clean visuals, controlled messaging, and a brand — Rhode — that perfectly reflects her aesthetic.",
      "Minimal, neutral, intentional.",
      "What's fascinating is how she manages to stay central without being loud. A product drop goes viral. A street style look becomes a reference. A campaign spreads instantly. And yet, she rarely explains, reacts, or overextends.",
      "That's the shift.",
      "Influence today is no longer about how much you show — it's about how well you curate what people see. And Hailey Bieber understood that early.",
    ],
    similarSlugs: [],
  },
  "manal-is-building-a-pop-identity-morocco-has-been-waiting-for": {
    slug: "manal-is-building-a-pop-identity-morocco-has-been-waiting-for",
    date: "Yesterday",
    title: "Manal Is Building a Pop Identity Morocco Has Been Waiting For",
    summary:
      "Manal isn't just releasing music — she's structuring a vision, and that long-term clarity is what makes her stand out.",
    category: "People",
    categories: ["Music"],
    image: "https://static.lematin.ma/files/lematin/images/articles/2023/01/f0deb9b2b2cb1cecae735e1203c1fe08.jpg",
    heroMedia: {
      type: "image",
      src: "https://static.lematin.ma/files/lematin/images/articles/2023/01/f0deb9b2b2cb1cecae735e1203c1fe08.jpg",
    },
    imageCaption: "Manal editorial portrait",
    intro:
      "Manal isn't just releasing music — she's structuring a vision.",
    body: [
      "In a landscape where many artists move fast but without clear direction, she's taking a more deliberate approach. Every release feels aligned: sound, visuals, styling, storytelling. Nothing is random, and that's exactly what sets her apart.",
      "She represents a new phase for Moroccan pop — one that doesn't rely on imitation, but on construction. A defined universe, a recognizable identity, and a long-term perspective.",
      "Because the reality is simple: talent alone is no longer enough. What matters is how it's packaged, presented, and sustained.",
      "And Manal is doing exactly that.",
      "She's not just part of the scene. She's shaping what it can become.",
    ],
    similarSlugs: [],
  },
  "kylie-jenner-timothee-chalamet-and-the-era-of-strategic-relationships": {
    slug: "kylie-jenner-timothee-chalamet-and-the-era-of-strategic-relationships",
    date: "Yesterday",
    title: "Kylie Jenner, Timothée Chalamet… And the Era of Strategic Relationships",
    summary:
      "Celebrity relationships now operate like cultural positioning: every appearance is watched, decoded, and turned into narrative.",
    category: "People",
    image: "https://media.vanityfair.fr/photos/686cd42910c1b9b46bdfe1da/16:9/w_2560%2Cc_limit/Kylie%2520Jenner-2215009958.jpg",
    heroMedia: {
      type: "image",
      src: "https://media.vanityfair.fr/photos/686cd42910c1b9b46bdfe1da/16:9/w_2560%2Cc_limit/Kylie%2520Jenner-2215009958.jpg",
    },
    imageCaption: "People feature visual",
    intro:
      "Celebrity relationships used to be private. Now, they're part of the narrative.",
    body: [
      "When Kylie Jenner and Timothée Chalamet appeared together, the reaction wasn't just curiosity — it was analysis. Two completely different worlds colliding: mainstream influence meets indie credibility, reality TV meets auteur cinema.",
      "And that's what makes these pairings so impactful.",
      "Whether intentional or not, they create layers of visibility. Fashion, film, pop culture — all intersecting in one storyline. Every appearance becomes a moment, every interaction becomes content.",
      "The audience isn't just watching anymore. They're decoding.",
      "Because in today's media landscape, relationships don't just exist. They position.",
    ],
    similarSlugs: [],
  },
  "from-casablanca-to-paris-why-moroccan-creators-are-leaving-and-not-looking-back": {
    slug: "from-casablanca-to-paris-why-moroccan-creators-are-leaving-and-not-looking-back",
    date: "This week",
    title: "From Casablanca to Paris: Why Moroccan Creators Are Leaving — And Not Looking Back",
    summary:
      "More Moroccan creatives are building their careers abroad because structure, access, and scalability still remain easier to find elsewhere.",
    category: "People",
    categories: ["Culture"],
    image: "https://content.r9cdn.net/rimg/dimg/bd/d1/2f268866-city-36014-162f82486f9.jpg?width=1366&height=768&xhint=2485&yhint=1564&crop=true",
    heroMedia: {
      type: "image",
      src: "https://content.r9cdn.net/rimg/dimg/bd/d1/2f268866-city-36014-162f82486f9.jpg?width=1366&height=768&xhint=2485&yhint=1564&crop=true",
    },
    imageCaption: "People feature visual",
    intro:
      "More Moroccan creatives are building their careers abroad — and it's not by accident.",
    body: [
      "Paris, Dubai, London… these cities offer something that's still developing locally: structure, access, and scalability. For designers, DJs, content creators, and artists, the move isn't just about exposure — it's about opportunity.",
      "Because while Morocco has talent, it doesn't always provide the ecosystem needed to grow it at a global level.",
      "So creators adapt.",
      "They leave to expand, to connect, to be seen differently. And once they reach that level, coming back becomes less of a necessity and more of a choice.",
      "The issue isn't ambition. It's infrastructure. And until that gap is addressed, the pattern will continue. Moroccan talent will keep going global — just not always from home.",
    ],
    similarSlugs: [],
  },
  "when-space-meets-everyday-life-nasas-artemis-ii-through-the-lens-of-an-iphone": {
    slug: "when-space-meets-everyday-life-nasas-artemis-ii-through-the-lens-of-an-iphone",
    date: "Today",
    title: "When Space Meets Everyday Life: NASA's Artemis II Through the Lens of an iPhone",
    summary:
      "Artemis II didn't just push space exploration forward. It quietly turned one of the most familiar objects of everyday life into a cultural bridge between orbit and Earth.",
    category: "Culture",
    image: "/culture/nasa.jpg",
    heroMedia: {
      type: "image",
      src: "/culture/nasa.jpg",
    },
    imageCaption: "Artemis II visual",
    intro:
      "There was a time when space photography belonged exclusively to highly specialized equipment—machines engineered with precision, far removed from anything the public could relate to. Today, that line is beginning to blur.",
    body: [
      "During the Artemis II mission, astronauts aboard the Orion capsule captured images not with traditional space-grade cameras, but with something far more familiar: an iPhone 17 Pro Max. NASA later confirmed this detail in response to a curious internet user, marking a subtle but meaningful shift in how space missions intersect with everyday technology.",
      "This is more than just a technical anecdote, it is a cultural moment.",
      "For decades, space exploration has symbolized the pinnacle of human achievement, distant, complex, and often inaccessible to the average person. But the introduction of personal devices like smartphones into that environment changes the narrative. It brings space closer, not in distance, but in perception.",
      "An iPhone is not just a tool; it is one of the most recognizable objects of our time. It represents how we communicate, document, and share our lives. Seeing it used in orbit reframes space not as an abstract frontier, but as an extension of our lived reality.",
      "There is also something quietly powerful about the idea that astronauts, figures once perceived as almost mythical, are now allowed to carry personal items. It humanizes them. It reminds us that beyond the suits and the science, they are individuals shaped by the same digital culture as the rest of us.",
      "More importantly, it changes how stories from space are told.",
      "Images captured on a smartphone carry a different aesthetic. They feel immediate, spontaneous, almost intimate. They resemble the kind of photos we take every day—except the view is Earth itself, suspended in the vastness of space. This contrast creates a new kind of visual language: one that merges the extraordinary with the familiar.",
      "In a way, this shift reflects a broader cultural evolution. Technology is no longer just a tool for exploration; it is a bridge between worlds. The same device used to capture a sunset or a moment with friends can now document humanity's journey beyond Earth.",
      "That matters.",
      "Because culture is not only defined by art or tradition—it is shaped by the tools we use, the stories we tell, and the way we see ourselves in the world. And today, even in space, those stories are increasingly told through the lens of everyday life.",
      "The Artemis II mission may be a step forward in space exploration. But culturally, it is also a reminder: the future doesn't always arrive with unfamiliar forms. Sometimes, it looks exactly like what we already hold in our hands.",
    ],
    similarSlugs: [],
  },
  "the-post-smartphone-era-has-quietly-started": {
    slug: "the-post-smartphone-era-has-quietly-started",
    date: "Today",
    title: "The Post-Smartphone Era Has Quietly Started",
    summary:
      "The smartphone is still everywhere, but its role as our primary interface is starting to weaken as ambient computing becomes part of everyday culture.",
    category: "Culture",
    image: "/culture/smartphone.webp",
    heroMedia: {
      type: "image",
      src: "/culture/smartphone.webp",
    },
    imageCaption: "Smart glasses visual",
    intro:
      "For over a decade, the smartphone has been the center of modern life. But something is shifting—and it's happening quietly.",
    body: [
      "The smartphone is no longer evolving in ways that feel meaningful. Each new release brings incremental upgrades, but no real transformation. At the same time, a new category of technology is emerging—one that doesn't ask for our attention in the same way.",
      "We are entering what can only be described as the post-smartphone era.",
      "This doesn't mean phones are disappearing overnight. It means they are slowly losing their role as the primary interface between humans and technology. In their place, we are seeing the rise of ambient computing—devices that exist around us, not in our hands.",
      "Smart glasses, AI-powered wearables, and voice-first assistants are leading this transition. Instead of pulling out a device, we speak. Instead of looking down, we look forward. Technology becomes less visible, but more present.",
      "The shift is subtle, but culturally significant.",
      "For years, society adapted itself to the smartphone. We lowered our gaze, shortened our attention spans, and accepted constant notifications as normal. Entire social behaviors were built around the act of checking a screen.",
      "Now, that behavior is starting to feel outdated.",
      "There is a growing fatigue around screens—an unspoken awareness that constant scrolling no longer delivers the same satisfaction. In response, people are beginning to seek frictionless, less intrusive ways to interact with technology.",
      "This is where the post-smartphone world takes shape.",
      "Instead of demanding focus, technology begins to blend into the background. It listens, anticipates, and responds without requiring deliberate input. The experience becomes more natural, almost invisible.",
      "And that changes more than just how we use devices—it changes how we live.",
      "Conversations are less interrupted. Environments feel more present. The boundary between online and offline starts to dissolve, not because we are more connected, but because connection itself becomes seamless.",
      "There is also a deeper cultural shift at play.",
      "For the first time in years, innovation is moving away from screens. The goal is no longer to capture attention, but to reduce the need for it. This marks a significant departure from the attention economy that defined the smartphone era.",
      "It suggests a future where technology supports life without dominating it.",
      "Of course, this transition raises new questions. What happens when devices are always listening? How much control do we really have when technology becomes invisible? And perhaps most importantly—are we ready to give up the sense of control that comes with holding a screen in our hands?",
      "The post-smartphone era is not about abandoning technology. It is about redefining our relationship with it.",
      "And like most cultural shifts, it won't arrive with a clear beginning or a dramatic announcement.",
      "It will happen gradually—through habits, preferences, and small changes in behavior—until one day, the idea of constantly looking down at a screen feels like something from the past.",
      "Not obsolete.",
      "Just… outdated.",
    ],
    similarSlugs: [],
  },
  "travis-scott-didnt-announce-his-next-album-he-wore-it": {
    slug: "travis-scott-didnt-announce-his-next-album-he-wore-it",
    date: "Yesterday",
    title: "Travis Scott Didn't Announce His Next Album—He Wore It",
    summary:
      "At SoFi Stadium, Travis Scott used a single word on a shirt to trigger album speculation, proving that in 2026 cultural rollouts happen through moments, not press releases.",
    category: "Culture",
    image: "/culture/travis.jpg",
    heroMedia: {
      type: "image",
      src: "/culture/travis.jpg",
    },
    imageCaption: "Travis Scott at SoFi Stadium",
    intro:
      "There was no press release. No official teaser. No carefully edited announcement video. Instead, Travis Scott stepped onto a stage, wearing a simple shirt printed with a single word: UNSANE.",
    body: [
      "That was enough.",
      "The moment took place during his guest appearance at Kanye West's concert at SoFi Stadium on April 3, 2026. The two performed FATHER, a collaboration from Ye's album Bully. But while the performance itself carried weight, it was the subtle visual detail—the shirt—that quickly became the center of attention.",
      "Because in 2026, this is how announcements are made.",
      "For years, album rollouts followed a familiar structure: teasers, singles, interviews, release dates. That model still exists—but it no longer dominates culture. Today, artists communicate through moments. They drop hints in plain sight, knowing their audience will decode, amplify, and circulate the message within minutes.",
      "A shirt is no longer just clothing. It is a statement, a signal, a controlled leak.",
      "If UNSANE is indeed the title of Travis Scott's next project, then its reveal wasn't accidental. It was strategic—designed to feel organic while triggering immediate speculation. Within hours, clips and images from the performance spread across platforms, with fans dissecting every detail.",
      "This is modern hype culture at its most refined.",
      "It also reflects something deeper about how attention works today. Audiences are no longer passive. They don't wait for information—they hunt for it. They interpret symbols, connect dots, and build narratives in real time. In that sense, the rollout becomes interactive.",
      "And Travis Scott understands this better than most.",
      "Throughout his career, he has blurred the lines between music, fashion, and experience. From immersive concerts to carefully curated aesthetics, his work has always extended beyond sound. The UNSANE shirt fits perfectly into that approach: minimal effort on the surface, maximum impact underneath.",
      "The setting made it even more powerful.",
      "Sharing a stage with Kanye West—an artist who helped define the modern era of disruptive releases—adds another layer of meaning. Ye himself has built a career on unpredictability, often bypassing traditional industry rules. Seeing Travis adopt a similarly unconventional tactic feels less like coincidence and more like evolution.",
      "It suggests a passing of the torch, or at least a shared understanding: culture moves faster than formal announcements.",
      "There is also something telling about the choice of subtlety. In an era saturated with content, understatement cuts through the noise more effectively than overexposure. A single word on a shirt can generate more conversation than a full campaign.",
      "Because it invites curiosity.",
      "And curiosity drives engagement.",
      "Whether UNSANE turns out to be the final album title or simply a piece of a larger narrative remains to be seen. But in many ways, the outcome is almost secondary. The real story is how the message was delivered.",
      "Not through a headline.",
      "Not through a statement.",
      "But through a moment—fleeting, visual, and instantly shareable.",
      "In 2026, albums are no longer just released.",
      "They are revealed, piece by piece, in plain sight—waiting for the audience to notice.",
    ],
    similarSlugs: [],
  },
};

export function getArticleCards(): ArticleCard[] {
  return getArticleCardsFromRecords(Object.values(articlesBySlug));
}

export function getSortedArticleCards(): ArticleCard[] {
  return getSortedArticleCardsFromRecords(Object.values(articlesBySlug));
}
