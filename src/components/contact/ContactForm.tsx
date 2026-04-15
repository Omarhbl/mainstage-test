"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialState: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");

  function updateField<Key extends keyof ContactFormState>(
    key: Key,
    value: ContactFormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));

    if (submitState !== "idle") {
      setSubmitState("idle");
      setSubmitMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setSubmitState("error");
        setSubmitMessage(
          payload.message || "We couldn’t send your message yet. Please try again."
        );
        return;
      }

      setSubmitState("success");
      setSubmitMessage(payload.message || "Message received. We’ll get back to you soon.");
      setForm(initialState);
    } catch {
      setSubmitState("error");
      setSubmitMessage("We couldn’t send your message yet. Please try again.");
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
      <input
        type="text"
        name="fake_username"
        autoComplete="username"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />
      <input
        type="password"
        name="fake_password"
        autoComplete="new-password"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />
      <input
        type="tel"
        name="fake_phone"
        autoComplete="tel"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
            First Name
          </span>
          <input
            type="text"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            autoComplete="off"
            className="mt-3 h-[42px] w-full border-b border-black/18 bg-transparent text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
            Last Name
          </span>
          <input
            type="text"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            autoComplete="off"
            className="mt-3 h-[42px] w-full border-b border-black/18 bg-transparent text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="off"
            className="mt-3 h-[42px] w-full border-b border-black/18 bg-transparent text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
            Phone Number
          </span>
          <input
            type="text"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            inputMode="tel"
            autoComplete="off"
            name="contact_phone_manual"
            placeholder=""
            data-form-type="other"
            data-lpignore="true"
            className="mt-3 h-[42px] w-full border-b border-black/18 bg-transparent text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
          Subject
        </span>
        <input
          type="text"
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          autoComplete="off"
          placeholder="Write your subject."
          className="mt-3 h-[42px] w-full border-b border-black/18 bg-transparent text-[15px] font-body text-[#181818] placeholder:text-black/28 outline-none transition-colors focus:border-[#CE2127]"
        />
      </label>

      <label className="block">
        <span className="text-[12px] font-body font-semibold text-[rgba(0,0,0,0.55)]">
          Message
        </span>
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          autoComplete="off"
          placeholder="Write your message."
          className="mt-3 w-full resize-none border-b border-black/18 bg-transparent pb-3 text-[15px] font-body text-[#181818] placeholder:text-black/28 outline-none transition-colors focus:border-[#CE2127]"
        />
      </label>

      {submitMessage ? (
        <p
          className={
            submitState === "success"
              ? "text-[14px] font-body font-semibold text-[#0f8b4c]"
              : "text-[14px] font-body font-semibold text-[#9f1b20]"
          }
          role="status"
        >
          {submitMessage}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[4px] bg-[#CE2127] px-8 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-75"
          disabled={submitState === "loading"}
        >
          {submitState === "loading" ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
