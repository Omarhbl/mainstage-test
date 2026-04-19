import { updateBackstagePortalSettingsAction } from "@/app/backoffice/backstage/actions";
import BackstageProjectsEditor from "@/components/backoffice/BackstageProjectsEditor";
import type { BackstagePortalSettings } from "@/lib/backstage-portal";

type BackstageSection =
  | "gateway"
  | "login"
  | "shell"
  | "overview"
  | "campaigns"
  | "approvals"
  | "files"
  | "reports"
  | "messages";

function sectionTarget(section: BackstageSection) {
  return `backstage:${section}`;
}

function Card({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-body font-medium text-black/60">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={4}
          className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-4 outline-none focus:border-[#CE2127]"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
        />
      )}
    </label>
  );
}

function DeleteToggle({ name, label }: { name: string; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] font-body font-medium text-[#9f1b20]">
      <input
        type="checkbox"
        name={name}
        value="1"
        className="h-4 w-4 rounded border border-black/15 accent-[#CE2127]"
      />
      {label}
    </label>
  );
}

export default function BackstageSectionEditor({
  section,
  settings,
  clientSlug,
  clientName,
  focusProjectId,
}: {
  section: BackstageSection;
  settings: BackstagePortalSettings;
  clientSlug?: string;
  clientName?: string;
  focusProjectId?: string;
}) {
  const redirectTarget = clientSlug
    ? `${sectionTarget(section)}?client=${encodeURIComponent(clientSlug)}`
    : sectionTarget(section);

  const clientContext = clientName ? (
    <p className="mt-4 rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3 text-[14px] font-body text-black/62">
      You are editing this section for{" "}
      <span className="font-semibold text-[#181818]">{clientName}</span>.
    </p>
  ) : null;

  if (section === "gateway") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Gateway" title="Edit the partner entry page">
          <input type="hidden" name="section" value="gateway" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Eyebrow" name="gateway_eyebrow" defaultValue={settings.gateway.eyebrow} />
            <div className="md:col-span-2">
              <Field label="Title" name="gateway_title" defaultValue={settings.gateway.title} textarea />
            </div>
            <div className="md:col-span-2">
              <Field label="Subtitle" name="gateway_subtitle" defaultValue={settings.gateway.subtitle} textarea />
            </div>
            <Field label="Partner card eyebrow" name="gateway_existing_eyebrow" defaultValue={settings.gateway.existingEyebrow} />
            <Field label="Partner card CTA" name="gateway_existing_cta_label" defaultValue={settings.gateway.existingCtaLabel} />
            <Field label="Partner card title" name="gateway_existing_title" defaultValue={settings.gateway.existingTitle} />
            <Field label="Join card CTA" name="gateway_join_cta_label" defaultValue={settings.gateway.joinCtaLabel} />
            <div className="md:col-span-2">
              <Field label="Partner card description" name="gateway_existing_description" defaultValue={settings.gateway.existingDescription} textarea />
            </div>
            <Field label="Join card eyebrow" name="gateway_join_eyebrow" defaultValue={settings.gateway.joinEyebrow} />
            <Field label="Join card title" name="gateway_join_title" defaultValue={settings.gateway.joinTitle} />
            <div className="md:col-span-2">
              <Field label="Join card description" name="gateway_join_description" defaultValue={settings.gateway.joinDescription} textarea />
            </div>
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save gateway
          </button>
        </Card>
      </form>
    );
  }

  if (section === "login") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Login" title="Edit the partner login page">
          <input type="hidden" name="section" value="login" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Eyebrow" name="login_eyebrow" defaultValue={settings.login.eyebrow} />
            <Field label="Submit button" name="login_submit_label" defaultValue={settings.login.submitLabel} />
            <div className="md:col-span-2">
              <Field label="Title" name="login_title" defaultValue={settings.login.title} textarea />
            </div>
            <div className="md:col-span-2">
              <Field label="Subtitle" name="login_subtitle" defaultValue={settings.login.subtitle} textarea />
            </div>
            <Field label="Back button" name="login_back_label" defaultValue={settings.login.backLabel} />
            <Field label="Contact button" name="login_contact_label" defaultValue={settings.login.contactLabel} />
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save login
          </button>
        </Card>
      </form>
    );
  }

  if (section === "shell") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Portal shell" title="Edit the shared portal frame">
          <input type="hidden" name="section" value="shell" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Eyebrow" name="shell_eyebrow" defaultValue={settings.shell.eyebrow} />
            <Field label="Portal title" name="shell_title" defaultValue={settings.shell.title} />
            <div className="md:col-span-2">
              <Field label="Portal description" name="shell_description" defaultValue={settings.shell.description} textarea />
            </div>
            <Field label="Contact email" name="shell_contact_email" defaultValue={settings.shell.contactEmail} />
            <Field label="Contact description" name="shell_contact_description" defaultValue={settings.shell.contactDescription} textarea />
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save shell
          </button>
        </Card>
      </form>
    );
  }

  if (section === "overview") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Overview" title="Edit the overview page">
          <input type="hidden" name="section" value="overview" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 space-y-4">
            <Field label="Page title" name="overview_title" defaultValue={settings.overview.title} />
            <Field label="Page subtitle" name="overview_subtitle" defaultValue={settings.overview.subtitle} textarea />
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save overview
          </button>
        </Card>
      </form>
    );
  }

  if (section === "campaigns") {
    return (
      <BackstageProjectsEditor
        settings={settings}
        redirectTarget={redirectTarget}
        clientSlug={clientSlug}
        clientContext={clientContext}
        focusProjectId={focusProjectId}
      />
    );
  }

  if (section === "approvals") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Approvals" title="Edit the approval queue">
          <input type="hidden" name="section" value="approvals" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 space-y-4">
            <Field label="Page title" name="approvals_page_title" defaultValue={settings.approvalsPage.title} />
            <Field label="Page subtitle" name="approvals_page_subtitle" defaultValue={settings.approvalsPage.subtitle} textarea />
          </div>
          <div className="mt-6 space-y-5">
            {Array.from({ length: 5 }, (_, index) => {
              const item = settings.approvals[index];
              return (
                <div key={`approval-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                  <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                    Approval {index + 1}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Title" name={`approval_title_${index + 1}`} defaultValue={item?.title ?? ""} />
                    <Field label="Type" name={`approval_type_${index + 1}`} defaultValue={item?.type ?? ""} />
                    <Field label="Due date" name={`approval_due_date_${index + 1}`} defaultValue={item?.dueDate ?? ""} />
                    <Field label="Assignee" name={`approval_assignee_${index + 1}`} defaultValue={item?.assignee ?? ""} />
                    <label className="block md:col-span-2">
                      <span className="text-[13px] font-body font-medium text-black/60">Status</span>
                      <select name={`approval_status_${index + 1}`} defaultValue={item?.status ?? "Waiting"} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]">
                        <option value="Waiting">Waiting</option>
                        <option value="Approved">Approved</option>
                        <option value="Needs changes">Needs changes</option>
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save approvals
          </button>
        </Card>
      </form>
    );
  }

  if (section === "files") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Deliverables" title="Edit client files and downloads">
          <input type="hidden" name="section" value="files" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 space-y-4">
            <Field label="Page title" name="files_page_title" defaultValue={settings.filesPage.title} />
            <Field label="Page subtitle" name="files_page_subtitle" defaultValue={settings.filesPage.subtitle} textarea />
          </div>
          <div className="mt-6 space-y-5">
            {Array.from({ length: 6 }, (_, index) => {
              const item = settings.files[index];
              return (
                <div key={`file-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                  <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                    File {index + 1}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Name" name={`file_name_${index + 1}`} defaultValue={item?.name ?? ""} />
                    <Field label="Category" name={`file_category_${index + 1}`} defaultValue={item?.category ?? ""} />
                    <Field label="Updated at" name={`file_updated_at_${index + 1}`} defaultValue={item?.updatedAt ?? ""} />
                    <Field label="Format" name={`file_format_${index + 1}`} defaultValue={item?.format ?? ""} />
                    <Field label="Size" name={`file_size_${index + 1}`} defaultValue={item?.size ?? ""} />
                  </div>
                </div>
              );
            })}
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save deliverables
          </button>
        </Card>
      </form>
    );
  }

  if (section === "reports") {
    return (
      <form action={updateBackstagePortalSettingsAction}>
        <Card eyebrow="Reports" title="Edit reports and invoices">
          <input type="hidden" name="section" value="reports" />
          <input type="hidden" name="redirect_target" value={redirectTarget} />
          <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
          {clientContext}
          <div className="mt-5 space-y-4">
            <Field label="Page title" name="reports_page_title" defaultValue={settings.reportsPage.title} />
            <Field label="Page subtitle" name="reports_page_subtitle" defaultValue={settings.reportsPage.subtitle} textarea />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="space-y-5">
              <p className="text-[16px] font-body font-bold text-[#181818]">Reports</p>
              {Array.from({ length: 4 }, (_, index) => {
                const item = settings.reports[index];
                return (
                  <div key={`report-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Title" name={`report_title_${index + 1}`} defaultValue={item?.title ?? ""} />
                      <Field label="Period" name={`report_period_${index + 1}`} defaultValue={item?.period ?? ""} />
                      <Field label="Summary" name={`report_summary_${index + 1}`} defaultValue={item?.summary ?? ""} textarea />
                      <Field label="Metric" name={`report_metric_${index + 1}`} defaultValue={item?.metric ?? ""} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-5">
              <p className="text-[16px] font-body font-bold text-[#181818]">Invoices</p>
              {Array.from({ length: 4 }, (_, index) => {
                const item = settings.invoices[index];
                return (
                  <div key={`invoice-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Title" name={`invoice_title_${index + 1}`} defaultValue={item?.title ?? ""} />
                      <Field label="Period" name={`invoice_period_${index + 1}`} defaultValue={item?.period ?? ""} />
                      <Field label="Summary" name={`invoice_summary_${index + 1}`} defaultValue={item?.summary ?? ""} textarea />
                      <Field label="Metric" name={`invoice_metric_${index + 1}`} defaultValue={item?.metric ?? ""} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
            Save reports
          </button>
        </Card>
      </form>
    );
  }

  return (
    <form action={updateBackstagePortalSettingsAction}>
      <Card eyebrow="Messages" title="Edit the message feed and activity log">
        <input type="hidden" name="section" value="messages" />
        <input type="hidden" name="redirect_target" value={redirectTarget} />
        <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
        <input
          type="hidden"
          name="message_count"
          value={String(settings.messages.length + 1)}
        />
        <input
          type="hidden"
          name="activity_count"
          value={String(settings.activityLog.length + 1)}
        />
        {clientContext}
        <div className="mt-5 space-y-4">
          <Field label="Page title" name="messages_page_title" defaultValue={settings.messagesPage.title} />
          <Field label="Page subtitle" name="messages_page_subtitle" defaultValue={settings.messagesPage.subtitle} textarea />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-5">
            <p className="text-[16px] font-body font-bold text-[#181818]">Messages</p>
            {[...settings.messages, null].map((item, index) => {
              const isNewSlot = !item;
              return (
                <div key={`message-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                      {isNewSlot ? "New message" : `Message ${index + 1}`}
                    </p>
                    {!isNewSlot ? (
                      <DeleteToggle
                        name={`message_delete_${index + 1}`}
                        label="Delete this message"
                      />
                    ) : (
                      <span className="text-[12px] font-body text-black/45">
                        Fill this slot to add a new message.
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Author" name={`message_author_${index + 1}`} defaultValue={item?.author ?? ""} />
                    <Field label="Role" name={`message_role_${index + 1}`} defaultValue={item?.role ?? ""} />
                    <Field label="Date" name={`message_date_${index + 1}`} defaultValue={item?.date ?? ""} />
                    <Field label="Message" name={`message_body_${index + 1}`} defaultValue={item?.message ?? ""} textarea />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-5">
            <p className="text-[16px] font-body font-bold text-[#181818]">Follow-up history</p>
            {[...settings.activityLog, null].map((item, index) => {
              const isNewSlot = !item;
              return (
                <div key={`activity-${index + 1}`} className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                      {isNewSlot ? "New log entry" : `Log entry ${index + 1}`}
                    </p>
                    {!isNewSlot ? (
                      <DeleteToggle
                        name={`activity_delete_${index + 1}`}
                        label="Delete this entry"
                      />
                    ) : (
                      <span className="text-[12px] font-body text-black/45">
                        Fill this slot to add a new activity entry.
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Date" name={`activity_date_${index + 1}`} defaultValue={item?.date ?? ""} />
                    <Field label="Item" name={`activity_item_${index + 1}`} defaultValue={item?.item ?? ""} />
                    <Field label="Note" name={`activity_note_${index + 1}`} defaultValue={item?.note ?? ""} textarea />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button type="submit" className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white">
          Save messages
        </button>
      </Card>
    </form>
  );
}
