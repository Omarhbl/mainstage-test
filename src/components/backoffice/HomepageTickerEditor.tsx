"use client";

import { useMemo, useState } from "react";
import type { PublicArticleCard } from "@/lib/articles";
type HomepageTickerEditorProps = {
  articleOptions: ArticleCard[];
  ...
};

type HomepageTickerEditorProps = {
  articleOptions: ArticleCard[];
  initialSlugs: string[];
};

export default function HomepageTickerEditor({
  articleOptions,
  initialSlugs,
}: HomepageTickerEditorProps) {
  const [slots, setSlots] = useState<string[]>(
    initialSlugs.length > 0 ? initialSlugs : [""]
  );

  const availableOptions = useMemo(
    () =>
      articleOptions.map((article) => ({
        value: article.slug,
        label: article.title,
      })),
    [articleOptions]
  );

  return (
    <div className="mt-5 space-y-4">
      {slots.map((value, index) => (
        <label className="block" key={`ticker-slot-${index}`}>
          <span className="text-[13px] font-body font-medium text-black/60">
            Headline slot {index + 1}
          </span>
          <select
            name="ticker_slug"
            value={value}
            onChange={(event) => {
              const nextSlots = [...slots];
              nextSlots[index] = event.target.value;
              setSlots(nextSlots);
            }}
            className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
          >
            <option value="">Choose an article</option>
            {availableOptions.map((option) => (
              <option key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={() => setSlots((current) => [...current, ""])}
          className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/12 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
        >
          Add slot
        </button>

        {slots.length > 1 ? (
          <button
            type="button"
            onClick={() => setSlots((current) => current.slice(0, -1))}
            className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/12 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            Remove last slot
          </button>
        ) : null}
      </div>
    </div>
  );
}
