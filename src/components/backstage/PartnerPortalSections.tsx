import Link from "next/link";
import type {
  PartnerApproval,
  PartnerCampaign,
  PartnerFile,
  PartnerMessage,
  PartnerReport,
} from "@/lib/backstage-portal";

export function MetricCard({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "rounded-[18px] border border-white/10 bg-white/6 px-5 py-4"
          : "rounded-[18px] border border-black/8 bg-[#fbfaf8] px-5 py-4"
      }
    >
      <p
        className={
          dark
            ? "text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-white/50"
            : "text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/38"
        }
      >
        {label}
      </p>
      <p
        className={
          dark
            ? "mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-white"
            : "mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function ApprovalRow({
  title,
  type,
  dueDate,
  status,
  assignee,
}: PartnerApproval) {
  const tone =
    status === "Approved"
      ? "text-[#2f7a3a] bg-[#eef8f0]"
      : status === "Needs changes"
        ? "text-[#9f1b20] bg-[#fff1f2]"
        : "text-[#8a5b00] bg-[#fff6e6]";

  return (
    <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            {title}
          </p>
          <p className="mt-1 text-[13px] font-body font-medium text-black/48">
            {type} • Assigned to {assignee}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-body font-semibold uppercase tracking-[0.12em] ${tone}`}
        >
          {status}
        </span>
      </div>
      <p className="mt-3 text-[13px] font-body font-medium text-black/48">
        Due {dueDate}
      </p>
    </div>
  );
}

export function FileRow({
  name,
  category,
  updatedAt,
  format,
  size,
}: PartnerFile) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
          {name}
        </p>
        <p className="mt-1 text-[13px] font-body font-medium text-black/48">
          {category} • {format} • {size}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-[13px] font-body font-medium text-black/48">
          Updated {updatedAt}
        </p>
        <button
          type="button"
          className="mt-2 inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#CE2127] px-3 text-[13px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
        >
          Download
        </button>
      </div>
    </div>
  );
}

export function ReportRow({
  title,
  period,
  summary,
  metric,
}: PartnerReport) {
  return (
    <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
        {title}
      </p>
      <p className="mt-1 text-[13px] font-body font-medium text-black/46">
        {period}
      </p>
      <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/62">
        {summary}
      </p>
      <p className="mt-3 text-[14px] font-body font-semibold text-[#CE2127]">
        {metric}
      </p>
    </div>
  );
}

export function MessageRow({
  author,
  role,
  date,
  message,
}: PartnerMessage) {
  return (
    <div className="rounded-[20px] border border-black/8 bg-[#fbfaf8] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            {author}
          </p>
          <p className="text-[13px] font-body font-medium text-black/48">
            {role}
          </p>
        </div>
        <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
          {date}
        </p>
      </div>
      <p className="mt-4 text-[15px] font-body leading-[1.85] text-black/64">
        {message}
      </p>
    </div>
  );
}

export function CampaignCard({
  campaign,
  showLink = false,
  portalBasePath = "/backstage/portal",
}: {
  campaign: PartnerCampaign;
  showLink?: boolean;
  portalBasePath?: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white p-6 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
            {campaign.brand}
          </p>
          <h3 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            {campaign.name}
          </h3>
        </div>
        <span className="inline-flex rounded-full bg-[#fbf1f1] px-3 py-1 text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-[#CE2127]">
          {campaign.status}
        </span>
      </div>

      <p className="mt-4 max-w-[740px] text-[15px] font-body leading-[1.85] text-black/64">
        {campaign.objective}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Progress" value={`${campaign.progress}%`} />
        <MetricCard label="Budget" value={campaign.budget} />
        <MetricCard label="Start" value={campaign.startDate} />
        <MetricCard label="End" value={campaign.endDate} />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] font-body text-black/52">
          Managed with {campaign.lead}
        </p>
        {showLink ? (
          <Link
            href={`${portalBasePath}/messages`}
            className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
          >
            Open campaign thread
          </Link>
        ) : null}
      </div>
    </div>
  );
}
