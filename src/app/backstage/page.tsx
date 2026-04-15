import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientGatewayPage() {
  const backstageSettings = await getBackstagePortalSettings();
  const gateway = backstageSettings.gateway;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#f6f4f1] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10 lg:p-12">
          <div className="max-w-[760px]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.2em] text-[#CE2127]">
              {gateway.eyebrow}
            </p>
            <h1 className="mt-4 text-[40px] font-body font-bold leading-[1.02] tracking-[-0.05em] text-[#181818] md:text-[58px]">
              {gateway.title}
            </h1>
            <p className="mt-5 max-w-[700px] text-[16px] font-body leading-[1.85] text-black/64 md:text-[17px]">
              {gateway.subtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-black/8 bg-[#111111] p-7 text-white shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                {gateway.existingEyebrow}
              </p>
              <h2 className="mt-3 text-[30px] font-body font-bold tracking-[-0.04em]">
                {gateway.existingTitle}
              </h2>
              <p className="mt-4 max-w-[420px] text-[15px] font-body leading-[1.8] text-white/72">
                {gateway.existingDescription}
              </p>
              <a
                href="/backstage/login"
                className="mt-7 inline-flex h-[50px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[15px] font-body font-semibold text-white transition-opacity hover:opacity-90"
              >
                {gateway.existingCtaLabel}
              </a>
            </div>

            <div className="rounded-[26px] border border-black/8 bg-[#fbfaf8] p-7 shadow-[0_18px_36px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                {gateway.joinEyebrow}
              </p>
              <h2 className="mt-3 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                {gateway.joinTitle}
              </h2>
              <p className="mt-4 max-w-[420px] text-[15px] font-body leading-[1.8] text-black/64">
                {gateway.joinDescription}
              </p>
              <a
                href="/contact"
                className="mt-7 inline-flex h-[50px] items-center justify-center rounded-[12px] border border-[#CE2127] px-5 text-[15px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
              >
                {gateway.joinCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
