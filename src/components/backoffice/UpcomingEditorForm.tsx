"use client";

import { useMemo, useState } from "react";
import { updateUpcomingSettingsAction } from "@/app/backoffice/upcoming/actions";
import type { UpcomingItem } from "@/lib/upcoming";

type UpcomingSection = "cinema" | "events";

type UpcomingEditorFormProps = {
  section: UpcomingSection;
  label: string;
  title: string;
  description: string;
  items: UpcomingItem[];
};

type UpcomingDraftItem = {
  id: string;
  title: string;
  releaseDate: string;
  image: string;
  href: string;
};

function createEmptyItem(section: UpcomingSection, index: number): UpcomingDraftItem {
  return {
    id: `${section}-draft-${index + 1}`,
    title: "",
    releaseDate: "",
    image: "",
    href: "",
  };
}

function getSortableUpcomingDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return Number.POSITIVE_INFINITY;
  }

  const ddmmyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  return Number.POSITIVE_INFINITY;
}

export default function UpcomingEditorForm({
  section,
  label,
  title,
  description,
  items,
}: UpcomingEditorFormProps) {
  const storagePrefix = section === "events" ? "entertainment" : section;
  const [slots, setSlots] = useState<UpcomingDraftItem[]>(
    items.length > 0
      ? items.map((item, index) => ({
          id: item.id || `${section}-${index + 1}`,
          title: item.title ?? "",
          releaseDate: item.releaseDate ?? "",
          image: item.image ?? "",
          href: item.href ?? "",
        }))
      : [createEmptyItem(section, 0)]
  );

  const nextIndex = useMemo(() => slots.length, [slots.length]);

  const updateSlot = (
    index: number,
    field: keyof Pick<UpcomingDraftItem, "title" | "releaseDate" | "image" | "href">,
    value: string
  ) => {
    setSlots((current) =>
      current.map((slot, currentIndex) =>
        currentIndex === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const sortChronologically = () => {
    setSlots((current) =>
      [...current].sort((left, right) => {
        const leftDate = getSortableUpcomingDate(left.releaseDate);
        const rightDate = getSortableUpcomingDate(right.releaseDate);

        if (leftDate !== rightDate) {
          return leftDate - rightDate;
        }

        return 0;
      })
    );
  };

  return (
    <form action={updateUpcomingSettingsAction} className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="slot_count" value={String(slots.length)} />

      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
        {label}
      </p>
      <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
        {title}
      </h2>
      <p className="mt-3 max-w-[720px] text-[14px] font-body leading-[1.75] text-black/60">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={sortChronologically}
          className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[13px] font-body font-semibold text-[#181818] transition-opacity hover:opacity-80"
        >
          Sort chronologically
        </button>
        <p className="text-[12px] font-body leading-[1.7] text-black/50">
          Reorder the slots by release date, from the soonest date to the latest one.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {slots.map((item, index) => (
          <div key={item.id} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                Slot {index + 1}
              </p>
              {slots.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSlots((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="text-[12px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name={`${storagePrefix}_title_${index}`}
                value={item.title}
                onChange={(event) => updateSlot(index, "title", event.target.value)}
                className="h-[48px] rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                placeholder={section === "cinema" ? "Movie title" : "Event title"}
              />
              <input
                name={`${storagePrefix}_date_${index}`}
                value={item.releaseDate}
                onChange={(event) => updateSlot(index, "releaseDate", event.target.value)}
                className="h-[48px] rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                placeholder="Release date"
              />
              <input
                name={`${storagePrefix}_image_${index}`}
                value={item.image}
                onChange={(event) => updateSlot(index, "image", event.target.value)}
                className="h-[48px] rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127] md:col-span-2"
                placeholder="Poster or event image URL"
              />
              <input
                name={`${storagePrefix}_href_${index}`}
                value={item.href}
                onChange={(event) => updateSlot(index, "href", event.target.value)}
                className="h-[48px] rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127] md:col-span-2"
                placeholder="Optional click destination"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSlots((current) => [...current, createEmptyItem(section, nextIndex)])}
          className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-5 text-[14px] font-body font-semibold text-[#181818] transition-opacity hover:opacity-80"
        >
          Add slot
        </button>
        <button
          type="submit"
          className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
