import SiteFooter from "@/components/layout/SiteFooter";

export default function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[900px] px-4 py-14 md:px-8 md:py-18">
          <h1 className="text-center text-[33px] font-body font-bold tracking-[-0.03em] text-[#1a1a1a] uppercase">
            {title}
          </h1>

          <div className="mx-auto mt-12 max-w-[760px] text-[14px] font-body font-normal leading-[1.75] text-[rgba(0,0,0,0.78)]">
            {children}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
