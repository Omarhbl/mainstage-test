import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getBackstageClients } from "@/lib/supabase/server";

export default async function BackofficeBackstagePage() {
  await requireBackofficeAccess(["admin"]);
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
        title="Backstage portal"
        subtitle="Manage the client-facing portal in two layers: shared public elements first, then each client’s own portal space and projects."
      />

      <section className="space-y-5">
        <div>
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Shared controls
          </p>
          <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Global backstage settings
          </h2>
          <p className="mt-2 max-w-[760px] text-[15px] font-body leading-[1.8] text-black/62">
            These cards affect the public entry flow and the shared frame every client sees
            before entering their own portal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SectionCard
            title="Clients"
            description="Create partner accounts, remove access, and open each client’s dedicated portal manager."
            href="/backoffice/backstage/clients"
          />
          <SectionCard
            title="Gateway"
            description="Edit the public partner entry page and both call-to-action cards."
            href="/backoffice/backstage/gateway"
          />
          <SectionCard
            title="Login"
            description="Control the wording used before a client enters the backstage."
            href="/backoffice/backstage/login"
          />
          <SectionCard
            title="Portal shell"
            description="Update the shared portal title, contact block, and sidebar framing."
            href="/backoffice/backstage/shell"
          />
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Client spaces
          </p>
          <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Manage each client by portal and project
          </h2>
          <p className="mt-2 max-w-[760px] text-[15px] font-body leading-[1.8] text-black/62">
            Each client card opens a dedicated workspace where we can manage their overview and
            all project-related content separately.
          </p>
        </div>

        {clients.length ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {clients.map((client) => (
              <a
                key={client.slug}
                href={`/backoffice/backstage/clients/${client.slug}`}
                className="group rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-black/8 bg-[#faf8f6]">
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

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                      Client portal
                    </p>
                    <h3 className="mt-2 text-[26px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                      {client.companyName}
                    </h3>
                    <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
                      {client.contactName} • {client.email}
                    </p>
                    <p className="mt-1 text-[13px] font-body leading-[1.7] text-black/46">
                      Open this client to manage overview content and the projects shown inside
                      their portal.
                    </p>
                    <span className="mt-4 inline-flex items-center text-[14px] font-body font-semibold text-[#CE2127] transition-transform group-hover:translate-x-1">
                      Open client space
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-black/8 bg-white p-6 text-[15px] font-body leading-[1.8] text-black/62 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            No client portal exists yet. Create the first one from the{" "}
            <a href="/backoffice/backstage/clients" className="font-semibold text-[#CE2127]">
              Clients
            </a>{" "}
            section.
          </div>
        )}
      </section>
    </div>
  );
}
