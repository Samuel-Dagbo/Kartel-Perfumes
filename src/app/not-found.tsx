import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory to-mist/20 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-serif text-gold/60 mb-6 tracking-tight">404</h1>
        <h2 className="text-xl font-serif text-charcoal mb-3">Page not found</h2>
        <p className="text-sm text-charcoal/40 mb-10">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-charcoal text-cream text-xs tracking-[0.2em] uppercase font-medium rounded-xl hover:bg-charcoal-light transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}