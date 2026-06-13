import { cn } from "@/lib/utils";
import foxLogo from "@/assets/focus-logo.png.asset.json";

export function FocusLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={foxLogo.url}
        alt="Focus CRM"
        width={42}
        height={42}
        className="h-[42px] w-[42px] object-contain"
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">
            Focus<span className="text-primary"> CRM</span>
          </span>
          <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
            by Focus Tech
          </span>
        </div>
      )}
    </div>
  );
}
