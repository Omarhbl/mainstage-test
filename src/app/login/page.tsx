import { redirect } from "next/navigation";
import { signInAction } from "@/app/login/actions";
import { signOutAction } from "@/app/backoffice/actions";
import {
  createSupabaseServerClient,
  hasSupabaseEnv,
} from "@/lib/supabase/server";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "Please sign in to access the backstage.",
  config:
    "Supabase credentials are missing. Add them to .env.local to activate team login.",
  invalid: "We couldn’t sign you in with those credentials. Please try again.",
  missing: "Please enter both email and password.",
  access: "Your account does not yet have backstage access.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  let errorMessage = error ? ERROR_MESSAGES[error] : null;
  const supabaseEnabled = hasSupabaseEnv();
  let unauthorizedSignedIn = false;

  if (supabaseEnabled) {
      const supabase = await createSupabaseServerClient("team");

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await requireBackofficeAccess();
          redirect("/backoffice");
        } catch {
          unauthorizedSignedIn = true;
          errorMessage =
            "This account is signed in but doesn’t currently have backstage access. You can sign out below and use another account.";
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f4f1] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1280px] overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#111111] p-8 text-white md:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(206,33,39,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(206,33,39,0.12),transparent_32%)]" />
          <div className="relative">
            <img
              src="/mainstage-logo.png"
              alt="Mainstage"
              className="w-[180px]"
            />
            <div className="mt-12 max-w-[520px]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.2em] text-[#CE2127]">
                Team Access
              </p>
              <h1 className="mt-4 text-[40px] font-body font-bold leading-[1.05] tracking-[-0.05em] text-white md:text-[52px]">
                Editorial control, curation, and publishing in one place.
              </h1>
              <p className="mt-5 max-w-[480px] text-[16px] font-body font-normal leading-[1.8] text-white/72">
                This is where you publish stories, update the homepage, manage
                media, and keep Mainstage moving every day.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-white/55">
                Articles
              </p>
              <p className="mt-2 text-[14px] font-body leading-[1.7] text-white/78">
                Create, review, and update stories from one editorial space.
              </p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-white/55">
                Homepage
              </p>
              <p className="mt-2 text-[14px] font-body leading-[1.7] text-white/78">
                Control featured spots, banners, and key promotional blocks.
              </p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-white/55">
                Team
              </p>
              <p className="mt-2 text-[14px] font-body leading-[1.7] text-white/78">
                Keep access clear for editors, reviewers, and everyone involved in publishing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10 lg:p-12">
          <div className="w-full max-w-[460px] rounded-[28px] border border-black/8 bg-[#fbfaf8] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <div>
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.18em] text-[#CE2127]">
                Login
              </p>
              <h2 className="mt-2 text-[34px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Your entrance to the backstage
              </h2>
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-[14px] border border-[#CE2127]/15 bg-[#CE2127]/6 px-4 py-3 text-[14px] font-body leading-[1.7] text-[#9f1b20]">
                {errorMessage}
              </div>
            ) : null}

            {unauthorizedSignedIn ? (
              <form action={signOutAction} className="mt-4">
                <button
                  type="submit"
                  className="inline-flex h-[46px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
                >
                  Sign out and use another account
                </button>
              </form>
            ) : null}

            <form action={signInAction} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
                  placeholder="name@themainstagent.com"
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
                  placeholder="••••••••••"
                />
              </label>

              <button
                type="submit"
                className="inline-flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#CE2127] text-[15px] font-body font-semibold text-white transition-opacity hover:opacity-90"
              >
                Enter Backstage
              </button>
            </form>

            {!supabaseEnabled ? (
              <p className="mt-5 text-[13px] font-body leading-[1.7] text-black/50">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
                to `.env.local` to activate team login.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
