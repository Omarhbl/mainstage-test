import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import {
  createSupabaseAdminClient,
  getDashboardEditorialNote,
  hasSupabaseServiceRoleEnv,
} from "@/lib/supabase/server";
import {
  createMemberAction,
  removeMemberAccessAction,
  updateDashboardEditorialNoteAction,
  updateMemberRoleAction,
} from "@/app/backoffice/team/actions";

type TeamMember = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
};

export default async function BackofficeTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { notice, type } = await searchParams;

  const canLoadMembers = hasSupabaseServiceRoleEnv();
  const adminClient = createSupabaseAdminClient();
  const editorialNote = await getDashboardEditorialNote();
  let teamMembers: TeamMember[] = [];

  if (canLoadMembers && adminClient) {
    const [{ data: profiles }, { data: usersData }] = await Promise.all([
      adminClient
      .from("profiles")
      .select("id, full_name, role")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true }),
      adminClient.auth.admin.listUsers(),
    ]);

    const emailById = new Map(
      (usersData?.users ?? []).map((user) => [user.id, user.email ?? null])
    );

    teamMembers = ((profiles as TeamMember[] | null) ?? []).map((member) => ({
      ...member,
      email: emailById.get(member.id) ?? null,
    }));
  }

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Team"
        subtitle="Keep track of the people behind Mainstage and how each role supports the editorial flow."
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[22px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Team roles
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["Admin", "Full access to content, settings, feeds, and team management."],
              ["Editor", "Create and edit articles, manage homepage placements, and save drafts."],
              ["Access rule", "Only users with the role admin or editor can enter the backstage."],
              ["Good practice", "Create the user first in Supabase Authentication, then assign the role in profiles."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5"
              >
                <h3 className="text-[16px] font-body font-bold text-[#181818]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Team access
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Add a team member
          </h2>
          <form action={createMemberAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Full name
              </span>
              <input
                name="full_name"
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
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Create a password"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Role
              </span>
              <select
                name="role"
                defaultValue="editor"
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Add member
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Dashboard note
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Edit the editorial note
          </h2>
          <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/60">
            This note appears on the dashboard and helps the team stay aligned on
            the current editorial focus.
          </p>

          <form action={updateDashboardEditorialNoteAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Note title
              </span>
              <input
                name="title"
                defaultValue={editorialNote.title}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Today's priority"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Note message
              </span>
              <textarea
                name="message"
                defaultValue={editorialNote.message}
                rows={5}
                className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 outline-none focus:border-[#CE2127]"
                placeholder="Write the message the team should see on the dashboard."
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Save editorial note
            </button>
          </form>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Current dashboard note
          </h2>
          <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/60">
            This is the note currently shown on the dashboard for the team.
          </p>
          <div className="mt-4 rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3">
            <p className="mt-2 text-[16px] font-body font-bold text-[#181818]">
              {editorialNote.title}
            </p>
            <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
              {editorialNote.message}
            </p>
            <p className="mt-3 text-[13px] font-body text-black/45">
              Updated: {editorialNote.updatedAt}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Team directory
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Current access list
          </h2>

          {canLoadMembers ? (
            teamMembers.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-[16px] border border-black/8">
                <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4 border-b border-black/8 bg-[#faf8f6] px-4 py-3 text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                  <span>Name</span>
                  <span>Access</span>
                </div>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[minmax(0,1fr)_280px] gap-4 border-b border-black/6 px-4 py-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-[15px] font-body font-medium text-[#181818]">
                        {member.full_name?.trim() || "Unnamed member"}
                      </p>
                      <p className="mt-1 text-[13px] font-body text-black/50">
                        {member.email || member.id}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <form action={updateMemberRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="member_id" value={member.id} />
                        <select
                          name="role"
                          defaultValue={member.role ?? "editor"}
                          className="h-[38px] rounded-[10px] border border-black/10 bg-[#faf8f6] px-3 text-[13px] font-body outline-none focus:border-[#CE2127]"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex h-[38px] items-center justify-center rounded-[10px] bg-[#111111] px-3 text-[12px] font-body font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Save
                        </button>
                      </form>
                      <form action={removeMemberAccessAction}>
                        <input type="hidden" name="member_id" value={member.id} />
                        <button
                          type="submit"
                          className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#CE2127]/20 bg-[#CE2127]/6 px-3 text-[12px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127]/10"
                        >
                          Remove access
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[16px] border border-black/8 bg-[#faf8f6] px-4 py-4 text-[14px] font-body leading-[1.7] text-black/62">
                No team members are showing yet. Add users in Supabase Authentication,
                then assign them a role in the profiles table.
              </div>
            )
          ) : (
            <div className="mt-5 rounded-[16px] border border-black/8 bg-[#faf8f6] px-4 py-4 text-[14px] font-body leading-[1.7] text-black/62">
              Add <span className="font-semibold text-[#181818]">SUPABASE_SERVICE_ROLE_KEY</span> to
              your <span className="font-semibold text-[#181818]">.env.local</span> if you want this
              page to display the full team list automatically.
            </div>
          )}
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Access overview
          </h2>
          <div className="mt-4 space-y-3">
            {[
              "Admins can manage team access, dashboard notes, and editorial settings.",
              "Editors can work on content and homepage updates without changing team access.",
              "Removing access takes someone out of the backstage while keeping their account in Supabase.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3 text-[14px] font-body leading-[1.7] text-black/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
