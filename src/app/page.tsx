import HeroDrop from "@/components/home/HeroDrop";
import EditorialGrid from "@/components/home/EditorialGrid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroDrop />
      <EditorialGrid />
      
      {/* Footer */}
      <footer className="container mx-auto px-4 md:px-8 py-20 border-t border-border-main flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 mt-auto">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary">THE</span>
          <h2 className="text-3xl font-display tracking-tighter text-text-primary uppercase italic">MAINSTAGENT</h2>
          <p className="mt-4 text-[10px] font-header tracking-[0.2em] text-text-muted uppercase italic">
            © 2026 THE MAINSTAGENT. ALL RIGHTS RESERVED. <br className="md:hidden" />
            BORN IN CASABLANCA.
          </p>
        </div>
        
        <div className="flex items-center space-x-8 md:space-x-12">
          <FooterLink href="#" label="Instagram" />
          <FooterLink href="#" label="TikTok" />
          <FooterLink href="#" label="Spotify" />
          <FooterLink href="#" label="Twitter" />
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a 
      href={href} 
      className="text-[10px] font-header font-bold tracking-[0.2em] text-text-secondary hover:text-primary transition-colors uppercase italic"
    >
      {label}
    </a>
  );
}
