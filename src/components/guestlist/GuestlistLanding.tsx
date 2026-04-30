"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const BG_VIDEO_URL =
  "https://res.cloudinary.com/docbnheap/video/upload/v1771898305/From_KlickPin_CF_Aesthetic_overlay_in_2026___Aesthetic_videos_Nature_gif_Video_background_un8neb.mp4";

export default function GuestlistLanding() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 768 || !cursorRef.current) return;

      const dx = event.clientX - lastXRef.current;
      const dy = event.clientY - lastYRef.current;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.min(1.6, 1 + speed * 0.02);

      cursorRef.current.style.top = `${event.clientY}px`;
      cursorRef.current.style.left = `${event.clientX}px`;
      cursorRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;

      lastXRef.current = event.clientX;
      lastYRef.current = event.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!name || name.length < 2) {
      setToast("Please enter your name.");
      return;
    }

    if (!normalizedEmail) {
      setToast("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/guestlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          fullName: name,
          source: "guestlist_page",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Request failed");
      }

      setToast(payload.message || "Access granted.");
      setFullName("");
      setEmail("");
    } catch (error) {
      setToast(
        error instanceof Error && error.message
          ? error.message
          : "Try again in a sec."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white md:cursor-none">
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2a2a] shadow-[0_0_6px_rgba(255,42,42,0.9),0_0_16px_rgba(255,42,42,0.7),0_0_36px_rgba(255,42,42,0.5),0_0_72px_rgba(255,42,42,0.25)] transition-transform duration-75 ease-linear md:block"
      />

      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-center opacity-50 brightness-[0.6] contrast-105"
        >
          <source src={BG_VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0.72))]" />

      <div
        className={`fixed right-4 top-4 z-50 rounded-lg border border-white/20 bg-black/70 px-3 py-2 text-sm backdrop-blur transition ${
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {toast ? `✔ ${toast}` : ""}
      </div>

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[560px] flex-col items-center px-4 pb-6 pt-[22vh] text-center sm:px-4 sm:pt-[16vh] md:max-w-[980px] md:justify-center md:gap-6 md:px-6 md:pb-16 md:pt-0">
        <h1 className="m-0 flex items-center justify-center gap-2 whitespace-nowrap">
          <img
            src="/mainstage-logo.png"
            alt="MAINSTAGE"
            className="h-6 w-auto sm:h-7 md:h-[2.7em] md:translate-y-[2px]"
          />
          <span className="text-[clamp(1.15rem,5.5vw,1.5rem)] font-bold leading-none tracking-[-0.01em] md:text-[clamp(28px,3.2vw,40px)] md:font-semibold md:tracking-[-0.02em]">
            takes the scene
          </span>
        </h1>

        <p className="mt-4 max-w-[94%] text-[clamp(0.95rem,4.2vw,1.1rem)] italic leading-[1.45] text-white/70 md:mt-5 md:max-w-[600px] md:text-[15px] md:leading-[1.6]">
          Whether you&apos;re on the guest list, backstage, or know the owners,
          sign up here.
        </p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mt-4 flex w-full flex-col gap-2.5 md:mt-5 md:max-w-[600px] md:flex-row md:gap-3"
        >
          <input
            className="h-[58px] w-full rounded-[18px] border border-white/25 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-5 text-[clamp(0.95rem,4.1vw,1.05rem)] font-medium text-white outline-none placeholder:font-semibold placeholder:text-white/35 md:h-12 md:rounded-2xl md:bg-white/5 md:px-[14px] md:text-sm md:font-normal"
            placeholder="Enter your name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <input
            className="h-[58px] w-full rounded-[18px] border border-white/25 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-5 text-[clamp(0.95rem,4.1vw,1.05rem)] font-medium text-white outline-none placeholder:font-semibold placeholder:text-white/35 md:h-12 md:rounded-2xl md:bg-white/5 md:px-[14px] md:text-sm md:font-normal"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex h-[62px] w-full items-center justify-center gap-2.5 rounded-[20px] border border-white/30 bg-white/[0.16] text-[clamp(1rem,4.6vw,1.2rem)] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)] backdrop-blur-[10px] transition disabled:opacity-70 md:mt-0 md:h-12 md:w-auto md:whitespace-nowrap md:rounded-2xl md:px-4 md:text-[15px] md:font-medium"
          >
            {loading ? "Granting access..." : "Get your access"}
            <span className="text-[1.1em] leading-none transition-transform duration-200 ease-out group-hover:translate-x-1.5">
              →
            </span>
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-7 md:mt-0 md:gap-4">
          <a
            href="https://instagram.com/themainstagent"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-[52px] w-[52px] items-center justify-center md:h-11 md:w-11"
          >
            <svg className="h-[30px] w-[30px] md:h-6 md:w-6" viewBox="0 0 24 24" fill="none">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </a>

          <a
            href="mailto:contact@themainstagent.com"
            aria-label="Email"
            className="flex h-[52px] w-[52px] items-center justify-center md:h-11 md:w-11"
          >
            <svg className="h-[30px] w-[30px] md:h-6 md:w-6" viewBox="0 0 24 24" fill="none">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
              <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <p className="mt-auto pt-10 text-[clamp(0.8rem,3.7vw,1.1rem)] text-white/60 md:absolute md:bottom-5 md:pt-0 md:text-xs">
          © Mainstage. All rights reserved.
        </p>
      </div>
    </section>
  );
}
