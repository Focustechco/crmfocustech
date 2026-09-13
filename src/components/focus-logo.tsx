import { cn } from "@/lib/utils";

export function FocusLogo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Icon Flame / Focus Aperture */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#E65C00] shadow-sm shadow-[#FF6B00]/25">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5 text-white"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized Focus Aperture / Target */}
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          <path d="M5.5 5.5l2 2m9 9l2 2m-13 0l2-2m9-9l2-2" strokeWidth="1.6" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-display text-base font-extrabold tracking-tight text-foreground">
              Focus
            </span>
            <span className="font-display text-base font-bold tracking-tight text-[#FF6B00]">
              CRM
            </span>
          </div>
          <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase mt-0.5">
            by Focus Tech
          </span>
        </div>
      )}
    </div>
  );
}

