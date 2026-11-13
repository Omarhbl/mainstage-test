"use client";

import { useRef, useState } from "react";
import { updateHomepageSettingsAction } from "@/app/backoffice/homepage/actions";

import HomepageSlideFraming from "@/components/backoffice/HomepageSlideFraming";
import type { HomepageHeroSlide as HeroSlide } from "@/lib/homepage-slides";

type HomepageHeroSlidesFormProps = {
  initialSlides: HeroSlide[];
  redirectTarget: string;
};

type EditorSlide = HeroSlide & { editorId: string };

function createEmptySlide(editorId: string): EditorSlide {
  return {
    editorId,
    title: "",
    category: "",
    href: "",
    media: "",
  };
}

export default function HomepageHeroSlidesForm({
  initialSlides,
  redirectTarget,
}: HomepageHeroSlidesFormProps) {
  const nextSlideId = useRef(0);
  const [slides, setSlides] = useState<EditorSlide[]>(() =>
    initialSlides.length > 0
      ? initialSlides.map((slide, index) => ({ ...slide, editorId: `initial-${index}` }))
      : [createEmptySlide("initial-empty")]
  );

  function updateSlide(index: number, field: keyof HeroSlide, value: string | number) {
    setSlides((current) =>
      current.map((slide, currentIndex) =>
        currentIndex === index ? { ...slide, [field]: value } : slide
      )
    );
  }

  function addSlide() {
    const slide = createEmptySlide(`added-${nextSlideId.current++}`);
    setSlides((current) => [...current, slide]);
  }

  function removeSlide(index: number) {
    const emptySlide = createEmptySlide(`added-${nextSlideId.current++}`);
    setSlides((current) => {
      if (current.length === 1) {
        return [emptySlide];
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function moveSlide(index: number, direction: -1 | 1) {
    setSlides((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  return (
    <form action={updateHomepageSettingsAction}>
      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Homepage slider
            </p>
            <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Update the hero slides
            </h2>
            <p className="mt-2 max-w-[640px] text-[14px] font-body leading-[1.75] text-black/60">
              Add and reorder slides below. The homepage rotates through them in this order. Click Save slides to apply your changes.
            </p>
          </div>

          <button
            type="button"
            onClick={addSlide}
            className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#CE2127] px-4 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
          >
            Add slide
          </button>
        </div>

        <input type="hidden" name="section" value="hero" />
        <input type="hidden" name="redirect_target" value={redirectTarget} />
        <input type="hidden" name="hero_slides_count" value={slides.length} />

        <div className="mt-5 space-y-5">
          {slides.map((slide, index) => (
            <div
              key={slide.editorId}
              className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
                  Slide {index + 1}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Move slide ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveSlide(index, -1)}
                    className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-black/10 px-3 text-[13px] font-body font-medium text-black/68 transition-colors hover:border-[#CE2127] hover:text-[#CE2127] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↑ Move up
                  </button>
                  <button
                    type="button"
                    aria-label={`Move slide ${index + 1} down`}
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(index, 1)}
                    className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-black/10 px-3 text-[13px] font-body font-medium text-black/68 transition-colors hover:border-[#CE2127] hover:text-[#CE2127] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↓ Move down
                  </button>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-black/10 px-3 text-[13px] font-body font-medium text-black/68 transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
                >
                  Delete slide
                </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Slider title
                  </span>
                  <input
                    name={`hero_title_${index + 1}`}
                    value={slide.title}
                    onChange={(event) =>
                      updateSlide(index, "title", event.target.value)
                    }
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    placeholder="Main hero title"
                  />
                </label>

                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Slider label
                  </span>
                  <input
                    name={`hero_category_${index + 1}`}
                    value={slide.category}
                    onChange={(event) =>
                      updateSlide(index, "category", event.target.value)
                    }
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    placeholder="Music"
                  />
                </label>

                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Slider destination
                  </span>
                  <input
                    name={`hero_href_${index + 1}`}
                    type="url"
                    value={slide.href}
                    onChange={(event) =>
                      updateSlide(index, "href", event.target.value)
                    }
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    placeholder="https://themainstagent.com/articles/your-article"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Slider media
                  </span>
                  <input
                    name={`hero_media_${index + 1}`}
                    value={slide.media}
                    onChange={(event) =>
                      updateSlide(index, "media", event.target.value)
                    }
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    placeholder="/videos/intro.mp4 or image URL"
                  />
                </label>
              </div>
              <HomepageSlideFraming
                slide={slide}
                index={index}
                onChange={(field, value) => updateSlide(index, field, value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save slides
          </button>

          <button
            type="button"
            onClick={addSlide}
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black/10 px-5 text-[14px] font-body font-semibold text-black/70 transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            Add another slide
          </button>
        </div>
      </div>
    </form>
  );
}
