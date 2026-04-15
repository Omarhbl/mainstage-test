export default function BackofficeHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-black/8 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[12px] font-body font-semibold uppercase tracking-[0.18em] text-[#CE2127]">
          Mainstage Back Office
        </p>
        <h1 className="mt-2 text-[34px] font-body font-bold tracking-[-0.04em] text-[#181818]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-[760px] text-[15px] font-body font-normal leading-[1.7] text-black/60">
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
