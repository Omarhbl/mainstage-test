"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteContactMessageAction,
  updateContactMessageStatusAction,
} from "@/app/backoffice/settings/actions";
import type { ContactMessage } from "@/lib/supabase/server";

function formatMessageDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "replied":
      return "border border-[#0f8b4c]/20 bg-[#0f8b4c]/8 text-[#0f8b4c]";
    case "archived":
      return "border border-black/10 bg-black/[0.04] text-black/55";
    default:
      return "border border-[#CE2127]/20 bg-[#CE2127]/8 text-[#CE2127]";
  }
}

function formatStatusLabel(status: string) {
  switch (status) {
    case "replied":
      return "Replied";
    case "archived":
      return "Archived";
    default:
      return "New";
  }
}

export default function ContactInboxSectionEditor({
  messages,
}: {
  messages: ContactMessage[];
}) {
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(
    messages[0]
      ? `${messages[0].email}-${messages[0].receivedAt}-${messages[0].subject}`
      : null
  );
  const latestMessage = messages[0];
  const newCount = messages.filter((message) => message.status === "new").length;
  const repliedCount = messages.filter((message) => message.status === "replied").length;
  const archivedCount = messages.filter((message) => message.status === "archived").length;
  const selectedMessage = useMemo(
    () =>
      messages.find(
        (message) =>
          `${message.email}-${message.receivedAt}-${message.subject}` === selectedMessageKey
      ) ?? messages[0],
    [messages, selectedMessageKey]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Contact inbox
          </p>
          <h2 className="mt-3 text-[36px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            {messages.length}
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            Total messages received from the website contact form.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Latest message
          </p>
          <h2 className="mt-3 text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            {latestMessage?.subject ?? "No messages yet"}
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            {latestMessage
              ? `${latestMessage.firstName} ${latestMessage.lastName}`.trim() ||
                latestMessage.email
              : "New contact requests from the website will appear here automatically."}
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Status overview
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-[#CE2127]/20 bg-[#CE2127]/8 px-3 py-2 text-[13px] font-body font-semibold text-[#CE2127]">
              New · {newCount}
            </div>
            <div className="inline-flex rounded-full border border-[#0f8b4c]/20 bg-[#0f8b4c]/8 px-3 py-2 text-[13px] font-body font-semibold text-[#0f8b4c]">
              Replied · {repliedCount}
            </div>
            <div className="inline-flex rounded-full border border-black/10 bg-black/[0.04] px-3 py-2 text-[13px] font-body font-semibold text-black/55">
              Archived · {archivedCount}
            </div>
          </div>
          <p className="mt-3 text-[14px] font-body leading-[1.7] text-black/55">
            Track what still needs attention and what has already been handled.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Export
          </p>
          <h2 className="mt-3 text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Download messages
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            Export the contact inbox as CSV anytime for reporting, follow-up, or CRM import.
          </p>
          <a
            href="/api/contact/export"
            className="mt-5 inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 border-b border-black/8 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Received messages
            </p>
            <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Contact form submissions
            </h2>
            <p className="mt-2 max-w-[720px] text-[14px] font-body leading-[1.7] text-black/55">
              Every message sent from the Contact page is listed here from newest to oldest.
            </p>
          </div>

          <Link
            href="/backoffice/settings"
            className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[13px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            Back to settings
          </Link>
        </div>

        {messages.length ? (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-3">
              {messages.map((message) => {
                const messageKey = `${message.email}-${message.receivedAt}-${message.subject}`;
                const isActive = messageKey === `${selectedMessage?.email}-${selectedMessage?.receivedAt}-${selectedMessage?.subject}`;

                return (
                  <button
                    key={messageKey}
                    type="button"
                    onClick={() => setSelectedMessageKey(messageKey)}
                    className={`w-full rounded-[16px] border p-4 text-left transition-colors ${
                      isActive
                        ? "border-[#CE2127]/25 bg-[#fff5f5]"
                        : "border-black/8 bg-[#faf8f6] hover:border-[#CE2127]/18 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                          {message.subject}
                        </p>
                        <p className="mt-1 truncate text-[13px] font-body text-black/58">
                          {`${message.firstName} ${message.lastName}`.trim() || message.email}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-body font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                          message.status
                        )}`}
                      >
                        {formatStatusLabel(message.status)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[13px] font-body leading-[1.7] text-black/65">
                      {message.message}
                    </p>

                    <p className="mt-3 text-[12px] font-body font-semibold text-[#CE2127]">
                      {formatMessageDate(message.receivedAt)}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedMessage ? (
              <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[22px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                        {selectedMessage.subject}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-body font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                          selectedMessage.status
                        )}`}
                      >
                        {formatStatusLabel(selectedMessage.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-body text-black/60">
                      {`${selectedMessage.firstName} ${selectedMessage.lastName}`.trim() || "No name provided"} ·{" "}
                      {selectedMessage.email}
                      {selectedMessage.phone ? ` · ${selectedMessage.phone}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 text-[13px] font-body font-semibold text-[#CE2127]">
                    {formatMessageDate(selectedMessage.receivedAt)}
                  </div>
                </div>

                <div className="mt-5 rounded-[14px] bg-white p-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-black/45">
                    Message
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[14px] font-body leading-[1.9] text-black/72">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedMessage.status !== "new" ? (
                    <form action={updateContactMessageStatusAction}>
                      <input type="hidden" name="email" value={selectedMessage.email} />
                      <input type="hidden" name="subject" value={selectedMessage.subject} />
                      <input type="hidden" name="received_at" value={selectedMessage.receivedAt} />
                      <input type="hidden" name="status" value="new" />
                      <button
                        type="submit"
                        className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#CE2127]/20 bg-[#CE2127]/8 px-3 text-[12px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-90"
                      >
                        Mark as new
                      </button>
                    </form>
                  ) : null}

                  {selectedMessage.status !== "replied" ? (
                    <form action={updateContactMessageStatusAction}>
                      <input type="hidden" name="email" value={selectedMessage.email} />
                      <input type="hidden" name="subject" value={selectedMessage.subject} />
                      <input type="hidden" name="received_at" value={selectedMessage.receivedAt} />
                      <input type="hidden" name="status" value="replied" />
                      <button
                        type="submit"
                        className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#0f8b4c]/20 bg-[#0f8b4c]/8 px-3 text-[12px] font-body font-semibold text-[#0f8b4c] transition-opacity hover:opacity-90"
                      >
                        Mark as replied
                      </button>
                    </form>
                  ) : null}

                  {selectedMessage.status !== "archived" ? (
                    <form action={updateContactMessageStatusAction}>
                      <input type="hidden" name="email" value={selectedMessage.email} />
                      <input type="hidden" name="subject" value={selectedMessage.subject} />
                      <input type="hidden" name="received_at" value={selectedMessage.receivedAt} />
                      <input type="hidden" name="status" value="archived" />
                      <button
                        type="submit"
                        className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
                      >
                        Archive
                      </button>
                    </form>
                  ) : null}

                  <form action={deleteContactMessageAction}>
                    <input type="hidden" name="email" value={selectedMessage.email} />
                    <input type="hidden" name="subject" value={selectedMessage.subject} />
                    <input type="hidden" name="received_at" value={selectedMessage.receivedAt} />
                    <button
                      type="submit"
                      className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#CE2127]/20 bg-[#CE2127]/8 px-3 text-[12px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-85"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] border border-dashed border-black/10 bg-[#faf8f6] px-5 py-8 text-[14px] font-body leading-[1.7] text-black/55">
            No contact messages yet. Once someone submits the Contact page form, the message will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
