import { site } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect x="2" y="2" width="28" height="28" rx="6" fill="#cd9a54" />
        <path d="M7 11c5-2 13-2 18 0M7 16c5-2 13-2 18 0M7 21c5-2 13-2 18 0" stroke="#33241a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M9 26 L23 6" stroke="#fbf6ee" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">{site.name}</span>
    </span>
  );
}
