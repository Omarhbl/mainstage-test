import Link from "next/link";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import {
  createBackstageClientAction,
  removeBackstageClientAction,
} from "@/app/backoffice/backstage/actions";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getBackstageClients } from "@/lib/supabase/server";

export default async function BackofficeBackstageClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { notice, type } = await searchParams;
  const clients = await getBackstageClients();

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Client portals"
        subtitle="Create client logins, remove access, and open the editor for each partner’s own backstage portal."
      />

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)]">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Client directory
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Current partner portals
          </h2>

          {clients.length > 0 ? (
            <div className="mt-5 space-y-4">
              {clients.map((client) => (
                <div
                  key={client.slug}
                  className="rounded-[18px] border border-black/8 bg-[#faf8f6] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-black/8 bg-white">
                        {client.logoUrl ? (
                          <img
                            src={client.logoUrl}
                            alt={`${client.companyName} logo`}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-[20px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                            {getInitials(client.companyName) || "CL"}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                          {client.companyName}
                        </p>
                        <p className="mt-1 text-[14px] font-body text-black/54">
                          {client.contactName} • {client.email}
                        </p>
                        <p className="mt-1 text-[13px] font-body text-black/46">
                          Portal slug: /backstage/portal/{client.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/backoffice/backstage/clients/${client.slug}`}
                        className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-white"
                      >
                        Manage portal
                      </Link>
                      <Link
                        href={`/backstage/portal/${client.slug}`}
                        className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-[#CE2127] px-4 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
                      >
                        Open portal
                      </Link>
                      <form action={removeBackstageClientAction}>
                        <input type="hidden" name="client_slug" value={client.slug} />
                        <button
                          type="submit"
                          className="inline-flex h-[42px] items-center justify-center rounded-[12px] bg-[#111111] px-4 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Remove client
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-[14px] font-body leading-[1.75] text-black/60">
              No client portal has been created yet.
            </p>
          )}
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            New client
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Add a partner portal
          </h2>
          <form action={createBackstageClientAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Company name
              </span>
              <input
                name="company_name"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Company name"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Logo URL
              </span>
              <input
                name="logo_url"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://..."
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Main contact
              </span>
              <input
                name="contact_name"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Full name"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Email
              </span>
              <input
                name="email"
                type="email"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="name@client.com"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Password
              </span>
              <input
                name="password"
                type="password"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Create a password"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Portal slug
              </span>
              <input
                name="slug"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="flormar"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create client
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
