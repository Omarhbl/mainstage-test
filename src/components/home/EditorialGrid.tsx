"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, ArrowUpRight } from "lucide-react";

const TRENDING_ITEMS = [
  {
    id: 1,
    category: "Cinema",
    title: "Michael, The King of Pop Returns to the Big Screen",
    image: "/Artists/inkonnu.jpg",
  },
  {
    id: 2,
    category: "Music",
    title: "Shobee, A comeback that feels intentional",
    image: "/Artists/shobee.jpg",
  },
  {
    id: 3,
    category: "Entertainment",
    title: "Casablanca en Scène : A night of laughter",
    image: "/Artists/aminefarsi.jpeg",
  },
];

const MUST_READ = {
  date: "Three hours ago",
  title: "The New Generation of Moroccan Artists You Should Not Miss",
  summary:
    "A new wave of Moroccan rappers is taking over, and they’re not here to play it safe. A fresh generation is emerging with sharper flows, bolder visuals, and a mindset focused on global reach.",
  category: "Music",
  image: "/articles/Inkonnu.jpg",
};

const SOCIAL_ITEMS = [
  {
    id: 1,
    image: "/Artists/inkonnu.jpg",
    alt: "Mainstage social highlight 1",
  },
  {
    id: 2,
    image: "/Artists/shobee.jpg",
    alt: "Mainstage social highlight 2",
  },
  {
    id: 3,
    image: "/Artists/manal.jpg",
    alt: "Mainstage social highlight 3",
  },
  {
    id: 4,
    image: "/Artists/aminefarsi.jpeg",
    alt: "Mainstage social highlight 4",
  },
  {
    id: 5,
    image: "/articles/Inkonnu.jpg",
    alt: "Mainstage social highlight 5",
  },
];

const VIDEO_ITEMS = [
  {
    id: 1,
    channel: "Shobee",
    date: "30/03/2026",
    title: "SHOBEE MACHI M3ANA",
    description: "The official video for @Shobee’s 'MACHI M3ANA' ...",
    image: "/Artists/shobee.jpg",
  },
  {
    id: 2,
    channel: "7liwa",
    date: "28/03/2026",
    title: "7Liwa - Parano (Official Music Video)",
    description: "7Liwa - Parano (Official Music Video) Listen now...",
    image: "/Artists/aminefarsi.jpeg",
  },
  {
    id: 3,
    channel: "Inkonnu",
    date: "22/03/2026",
    title: "Inkonnu - WARDA ft. MANAL (Official Music Video)",
    description: "Lyrics and official release details from the latest drop...",
    image: "/articles/Inkonnu.jpg",
  },
  {
    id: 4,
    channel: "Bo9al",
    date: "17/03/2026",
    title: "Bo9al x Dollypran - Action (Official Music Video)",
    description: "Premiere extrait de la mixtape Tornado - disponible ...",
    image: "/Artists/manal.jpg",
  },
];

const SPOTIFY_TOP_TEN = [
  { rank: "#1", title: "Machi M3ana", artist: "Shobee", image: "/Artists/shobee.jpg" },
  { rank: "#2", title: "WARDA", artist: "Inkonnu ft. Manal", image: "/articles/Inkonnu.jpg" },
  { rank: "#3", title: "Parano", artist: "7liwa", image: "/Artists/aminefarsi.jpeg" },
  { rank: "#4", title: "FATHER", artist: "Kanye West, Ye, Travis Scott", image: "/Artists/inkonnu.jpg" },
  { rank: "#5", title: "Soleil", artist: "GIMS", image: "/Artists/manal.jpg" },
  { rank: "#6", title: "#1", artist: "Ramoon ft. LOUN", image: "/Artists/shobee.jpg" },
  { rank: "#7", title: "GIRLFRIEND", artist: "Tayc", image: "/Artists/inkonnu.jpg" },
  { rank: "#8", title: "I AM", artist: "Omah Lay", image: "/articles/Inkonnu.jpg" },
  { rank: "#9", title: "Khoya", artist: "Onzy", image: "/Artists/aminefarsi.jpeg" },
  { rank: "#10", title: "À la base", artist: "Rskof ft. KeBlack", image: "/Artists/manal.jpg" },
];

const SOCIAL_CARD_WIDTH = 322;
const SOCIAL_CARD_GAP = 24;
const SOCIAL_STEP = SOCIAL_CARD_WIDTH + SOCIAL_CARD_GAP;
const SOCIAL_LOOP_WIDTH = SOCIAL_STEP * SOCIAL_ITEMS.length;

export default function EditorialGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
        <div className="mb-11 flex items-center justify-between gap-6">
          <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Trending Now
          </h2>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
          >
            Discover more
            <ArrowRight size={16} strokeWidth={2.2} />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-x-[36px] gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {TRENDING_ITEMS.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
              className="group"
            >
              <div className="h-[397px] w-full max-w-[321px] overflow-hidden rounded-[9px] bg-[#ece7e2]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="max-w-[321px] pt-5">
                <p className="mb-1 text-[10px] font-body font-bold text-[#CE2127]">
                  {item.category}
                </p>
                <h3 className="text-[20px] font-body font-semibold leading-[1.42] tracking-[-0.02em] text-[#181818]">
                  {item.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-20">
          <div className="mb-11 flex items-center justify-between gap-6">
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              The Must-Read
            </h2>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
            >
              Discover more
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[561px_minmax(0,1fr)] lg:items-start"
          >
            <div className="h-[332px] w-full max-w-[561px] overflow-hidden rounded-[9px] bg-[#ece7e2]">
              <img
                src={MUST_READ.image}
                alt={MUST_READ.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="max-w-[470px] pt-1">
              <p className="text-[15px] font-body font-normal text-[rgba(0,0,0,0.8)]">
                {MUST_READ.date}
              </p>
              <h3 className="mt-4 text-[25px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818]">
                {MUST_READ.title}
              </h3>
              <p className="mt-4 text-[20px] font-body font-medium leading-[1.55] text-[rgba(0,0,0,0.8)]">
                {MUST_READ.summary}
              </p>
              <p className="mt-5 text-[15px] font-body font-semibold text-[#CE2127]">
                {MUST_READ.category}
              </p>
            </div>
          </motion.article>
        </div>

        <div className="mt-20">
          <div className="mb-11 flex items-center justify-between gap-6">
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Social Highlights
            </h2>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
            >
              Discover more
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </div>

          <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-1">
            <motion.div
              animate={{ x: [-118, -118 - SOCIAL_LOOP_WIDTH] }}
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
              className="flex gap-6 px-0"
            >
              {[...SOCIAL_ITEMS, ...SOCIAL_ITEMS].map((item, index) => (
                <article
                  key={`${item.id}-${index}`}
                  className="h-[401px] w-[322px] shrink-0 overflow-hidden rounded-[9px] bg-[#ece7e2]"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-full w-full object-cover"
                  />
                </article>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_438px] xl:items-start">
          <div>
            <div className="mb-10 flex items-center justify-between gap-6">
              <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                New Music Video
              </h2>
            </div>

            <div className="space-y-6">
              {VIDEO_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[268px_minmax(0,1fr)] gap-5"
                >
                  <div className="group relative h-[145px] w-[268px] overflow-hidden rounded-[12px] bg-[#e8e2db]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
                        <Play size={22} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-[13px] font-body font-medium text-[rgba(0,0,0,0.72)]">
                      {item.channel}
                    </p>
                    <p className="mt-1 text-[13px] font-body font-normal text-[rgba(0,0,0,0.58)]">
                      {item.date}
                    </p>
                    <h3 className="mt-3 text-[18px] font-body font-bold leading-[1.45] text-[#181818]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[14px] font-body font-normal leading-[1.5] text-[rgba(0,0,0,0.5)]">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-10 flex items-center gap-4">
              <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                On Repeat
              </h2>
              <span className="h-[10px] w-[10px] rounded-full bg-[#CE2127]" />
            </div>

            <div className="overflow-hidden rounded-[14px]">
              <div className="grid grid-cols-[96px_minmax(0,1fr)_92px] bg-[#CE2127] px-5 py-4 text-[15px] font-body font-semibold text-white">
                <span> </span>
                <span>Title</span>
                <span>Ranking</span>
              </div>

              <div>
                {SPOTIFY_TOP_TEN.map((item, index) => (
                  <div
                    key={item.rank}
                    className={`grid grid-cols-[96px_minmax(0,1fr)_92px] items-center px-5 py-3 ${
                      index % 2 === 0 ? "bg-[#727272]" : "bg-[#868686]"
                    } text-white`}
                  >
                    <div className="text-[15px] font-body font-medium">{item.rank}</div>

                    <div className="flex items-center gap-4">
                      <div className="h-[42px] w-[42px] overflow-hidden rounded-[4px] bg-black/20">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-body font-medium leading-none">
                          {item.title}
                        </p>
                        <p className="mt-1 truncate text-[12px] font-body font-normal text-white/55">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
