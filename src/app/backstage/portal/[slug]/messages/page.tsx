import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { MessageRow, MetricCard } from "@/components/backstage/PartnerPortalSections";
import { sendClientPortalMessageAction } from "@/app/backstage/portal/actions";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { slug } = await params;
  const { notice, type } = await searchParams;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const messages = backstageSettings.messages;
  const activityLog = backstageSettings.activityLog;
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.messagesPage.title}
      subtitle={backstageSettings.messagesPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="space-y-6">
        {notice ? (
          <div
            className={`rounded-[16px] border px-4 py-3 text-[14px] font-body leading-[1.7] ${
              type === "success"
                ? "border-[#0f8b4c]/15 bg-[#0f8b4c]/6 text-[#0f8b4c]"
                : "border-[#CE2127]/15 bg-[#CE2127]/6 text-[#9f1b20]"
            }`}
          >
            {notice}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Messages" value={`${messages.length}`} />
          <MetricCard label="Follow-up entries" value={`${activityLog.length}`} />
          <MetricCard label="Last update" value={messages[0]?.date ?? "-"} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Send a message
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Reply to the Mainstage team
              </h2>
              <p className="mt-3 max-w-[720px] text-[15px] font-body leading-[1.8] text-black/62">
                Use this space to ask a question, send feedback, or follow up on a live project.
              </p>

              <form action={sendClientPortalMessageAction} className="mt-5 space-y-4">
                <input type="hidden" name="client_slug" value={access.client.slug} />
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Subject
                  </span>
                  <input
                    name="subject"
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                    placeholder="What is this message about?"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={6}
                    className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 outline-none focus:border-[#CE2127]"
                    placeholder="Write your message here..."
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Send message
                </button>
              </form>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Conversation
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Conversation with Mainstage
              </h2>
              <p className="mt-3 max-w-[720px] text-[15px] font-body leading-[1.8] text-black/62">
                Every message sent by your team and by Mainstage will appear here in one shared thread.
              </p>
              <div className="mt-5 space-y-3">
                {messages.map((message) => (
                  <MessageRow key={message.id} {...message} />
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Follow-up history
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Activity log
            </h2>
            <div className="mt-5 space-y-3">
              {activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                      {entry.item}
                    </p>
                    <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
                      {entry.date}
                    </p>
                  </div>
                  <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/62">
                    {entry.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
