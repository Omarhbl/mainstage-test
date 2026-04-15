import Link from "next/link";

export default function SectionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-[18px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <h2 className="text-[22px] font-body font-bold tracking-[-0.03em] text-[#181818]">
        {title}
      </h2>
      <p className="mt-3 text-[14px] font-body font-normal leading-[1.75] text-black/60">
        {description}
      </p>
      {href ? (
        <p className="mt-5 text-[13px] font-body font-semibold text-[#CE2127]">
          Open section
        </p>
      ) : null}
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
