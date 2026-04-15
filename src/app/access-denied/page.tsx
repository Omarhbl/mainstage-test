import Link from "next/link";
import { signOutAction } from "@/app/backoffice/actions";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#f6f4f1] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[900px] items-center justify-center">
        <div className="w-full rounded-[32px] border border-black/8 bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-12">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.18em] text-[#CE2127]">
            Backstage access
          </p>
          <h1 className="mt-4 text-[40px] font-body font-bold tracking-[-0.05em] text-[#181818]">
            Access not available
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] font-body leading-[1.8] text-black/62">
            Your account is signed in, but it does not currently have access to the
            Mainstage backstage. Please ask an admin to assign you the right role.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black/10 bg-[#faf8f6] px-5 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
            >
              Go back to website
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
              >
                Return to login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
