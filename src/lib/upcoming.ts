import upcomingReleases from "@/data/upcoming-releases.json";

export type UpcomingItem = {
  id: string;
  title: string;
  releaseDate: string;
  image: string;
  overview?: string;
  href?: string;
};

export type UpcomingReleaseFeed = {
  source: string;
  syncedAt: string;
  results: UpcomingItem[];
};

export type UpcomingSettings = {
  cinema: UpcomingItem[];
  entertainment: UpcomingItem[];
};

const upcomingData = upcomingReleases as UpcomingReleaseFeed;

export function formatReleaseDate(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${String(parsed.getDate()).padStart(2, "0")}/${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}/${parsed.getFullYear()}`;
}

export const UPCOMING_RELEASES = upcomingData.results;

export const FALLBACK_ENTERTAINMENT_UPCOMING: UpcomingItem[] = [
  {
    id: "event-casablanca-en-scene",
    title: "Casablanca en Scène",
    releaseDate: "31/05/2026",
    image:
      "https://ticket-assets.s3.us-east-1.amazonaws.com/categories/1772233608684-qhd0uaeyhte.png",
    href: "/articles/casablanca-en-scene-a-night-of-laughter?from=events",
  },
  {
    id: "event-kylie-timothee",
    title: "Kylie Jenner, Timothée Chalamet",
    releaseDate: "10/04/2026",
    image:
      "https://media.vanityfair.fr/photos/686cd42910c1b9b46bdfe1da/16:9/w_2560,c_limit/Kylie%2520Jenner-2215009958.jpg",
    href: "/articles/kylie-jenner-timothee-chalamet-and-the-era-of-strategic-relationships?from=events",
  },
  {
    id: "event-travis-unsane",
    title: "Travis Scott - UNSANE",
    releaseDate: "10/04/2026",
    image: "/culture/travis.jpg",
    href: "/articles/travis-scott-didnt-announce-his-next-album-he-wore-it?from=events",
  },
  {
    id: "event-kanye-sofi",
    title: "Kanye West at SoFi",
    releaseDate: "11/04/2026",
    image:
      "https://www.rollingstone.com/wp-content/uploads/2026/04/kanye-at-sofi.jpg?w=1581&h=1054&crop=1",
    href: "/articles/inside-kanye-wests-most-controversial-show-yet-in-la?from=events",
  },
];
