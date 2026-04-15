export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-black/45">
        {label}
      </p>
      <p className="mt-3 text-[34px] font-body font-bold tracking-[-0.04em] text-[#181818]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[13px] font-body font-normal leading-[1.6] text-black/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
