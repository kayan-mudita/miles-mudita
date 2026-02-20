import SoundWave from "@/components/ui/SoundWave";

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-gold-500/10">
      <SoundWave className="opacity-50" />
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-cream-100">Miles</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-500 font-body mt-0.5">
              by Mudita
            </span>
          </div>

          <div className="flex items-center gap-8">
            <a
              href="/submit"
              className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
            >
              Submit Idea
            </a>
            <a
              href="/#how-it-works"
              className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
            >
              How It Works
            </a>
            <a
              href="/#faq"
              className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
            >
              FAQ
            </a>
          </div>

          <p className="text-xs text-cream-300/50 font-body">
            &copy; {new Date().getFullYear()} Mudita. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
