import Link from "next/link";
import { deleteGuestlistSignupAction } from "@/app/backoffice/settings/actions";
import type { GuestlistSignup } from "@/lib/supabase/server";

function formatSignupDate(value: string) {
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

export default function GuestlistSectionEditor({
  signups,
}: {
  signups: GuestlistSignup[];
}) {
  const latestSignup = signups[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Guestlist
          </p>
          <h2 className="mt-3 text-[36px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            {signups.length}
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            Total emails currently collected from the website footer form.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Latest signup
          </p>
          <h2 className="mt-3 text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            {latestSignup?.email ?? "No emails yet"}
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            {latestSignup
              ? `Joined on ${formatSignupDate(latestSignup.subscribedAt)}`
              : "Once people subscribe from the footer, they will appear here automatically."}
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Export
          </p>
          <h2 className="mt-3 text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Download the list
          </h2>
          <p className="mt-2 text-[14px] font-body leading-[1.7] text-black/55">
            Export the guestlist as CSV anytime to share it with partnerships, CRM, or newsletter workflows.
          </p>
          <a
            href="/api/guestlist/export"
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
              Collected emails
            </p>
            <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Guestlist signups
            </h2>
            <p className="mt-2 max-w-[720px] text-[14px] font-body leading-[1.7] text-black/55">
              Every footer signup is listed here from newest to oldest. You can export the list or remove an email if it needs to be cleaned up.
            </p>
          </div>

          <Link
            href="/backoffice/settings"
            className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[13px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            Back to settings
          </Link>
        </div>

        {signups.length ? (
          <div className="mt-5 overflow-hidden rounded-[16px] border border-black/8">
            <div className="grid grid-cols-[minmax(0,1.8fr)_120px_140px_110px] gap-4 bg-[#faf8f6] px-5 py-4 text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-black/45">
              <span>Email</span>
              <span>Source</span>
              <span>Joined</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-black/6">
              {signups.map((signup) => (
                <div
                  key={`${signup.email}-${signup.subscribedAt}`}
                  className="grid grid-cols-[minmax(0,1.8fr)_120px_140px_110px] gap-4 px-5 py-4 text-[14px] font-body text-[#181818]"
                >
                  <span className="truncate font-medium">{signup.email}</span>
                  <span className="capitalize text-black/55">
                    {signup.source.replaceAll("_", " ")}
                  </span>
                  <span className="text-black/55">
                    {formatSignupDate(signup.subscribedAt)}
                  </span>
                  <form action={deleteGuestlistSignupAction}>
                    <input type="hidden" name="email" value={signup.email} />
                    <input type="hidden" name="subscribed_at" value={signup.subscribedAt} />
                    <button
                      type="submit"
                      className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#CE2127]/20 bg-[#CE2127]/8 px-3 text-[12px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-85"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] border border-dashed border-black/10 bg-[#faf8f6] px-5 py-8 text-[14px] font-body leading-[1.7] text-black/55">
            No guestlist emails yet. Once someone submits the footer form, the signup will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
