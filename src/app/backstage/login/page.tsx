import { signInClientPortalAction } from "@/app/backstage/login/actions";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please enter the client email and password.",
  invalid: "These credentials didn’t match a client portal account.",
  access: "This account doesn’t have access to a client portal yet.",
  auth: "Please sign in to continue.",
  config: "Client portal authentication is not configured yet.",
};

export default async function BackstagePartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const backstageSettings = await getBackstagePortalSettings();
  const { error } = await searchParams;
  const login = backstageSettings.login;
  const errorMessage =
    typeof error === "string" && error in ERROR_MESSAGES
      ? ERROR_MESSAGES[error]
      : null;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#f6f4f1] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-[720px] rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10 lg:p-12">
        <p className="text-[12px] font-body font-semibold uppercase tracking-[0.2em] text-[#CE2127]">
          {login.eyebrow}
        </p>
        <h1 className="mt-4 text-[38px] font-body font-bold leading-[1.04] tracking-[-0.05em] text-[#181818] md:text-[52px]">
          {login.title}
        </h1>
        <p className="mt-5 max-w-[540px] text-[16px] font-body leading-[1.85] text-black/64">
          {login.subtitle}
        </p>

        <form
          action={signInClientPortalAction}
          className="mt-8 rounded-[20px] border border-black/8 bg-[#fbfaf8] p-6"
        >
          {errorMessage ? (
            <div className="mb-5 rounded-[14px] border border-[#CE2127]/15 bg-[#fff4f4] px-4 py-3 text-[14px] font-body text-[#9f1b20]">
              {errorMessage}
            </div>
          ) : null}

          <label className="block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Email
            </span>
            <input
              name="email"
              type="email"
              className="mt-2 h-[52px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none focus:border-[#CE2127]"
              placeholder="name@company.com"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Password
            </span>
            <input
              name="password"
              type="password"
              className="mt-2 h-[52px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none focus:border-[#CE2127]"
              placeholder="••••••••••"
            />
          </label>

          <button
            type="submit"
            className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#CE2127] text-[15px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            {login.submitLabel}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="/backstage"
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black/10 px-5 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
          >
            {login.backLabel}
          </a>
          <a
            href="/contact"
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#CE2127] px-5 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
          >
            {login.contactLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
