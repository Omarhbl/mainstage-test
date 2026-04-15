export default function LegalContentRenderer({
  effectiveDate,
  content,
}: {
  effectiveDate?: string;
  content: string;
}) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
      {effectiveDate ? <p className="font-semibold">Effective date: {effectiveDate}</p> : null}

      <div className="mt-8 space-y-6">
        {blocks.map((block, index) => {
          const lines = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          const isBulletList = lines.length > 0 && lines.every((line) => line.startsWith("- "));

          if (isBulletList) {
            return (
              <ul key={`legal-block-${index}`} className="list-disc pl-5">
                {lines.map((line, itemIndex) => (
                  <li key={`legal-item-${index}-${itemIndex}`}>{line.replace(/^- /, "")}</li>
                ))}
              </ul>
            );
          }

          return (
            <p
              key={`legal-block-${index}`}
              className="whitespace-pre-line"
            >
              {block}
            </p>
          );
        })}
      </div>
    </>
  );
}
