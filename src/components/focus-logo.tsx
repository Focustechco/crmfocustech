import { cn } from "@/lib/utils";
import foxLogo from "@/assets/fox-logo.png";

export function FocusLogo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <img
        src={foxLogo}
        alt="Focus CRM"
        className="h-8 w-8 object-contain shrink-0"
      />

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


