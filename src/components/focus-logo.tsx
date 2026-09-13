import { cn } from "@/lib/utils";
import foxLogo from "@/assets/fox-logo.png";

interface FocusLogoProps {
  className?: string;
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function FocusLogo({
  className,
  showText = true,
  size = "md",
}: FocusLogoProps) {
  // Dimension mappings
  const iconSizes = {
    xs: "h-6 w-6",
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const textTitleSizes = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const textSubtitleSizes = {
    xs: "text-[8px]",
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm",
  };

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Official Fox Mascot */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={foxLogo}
          alt="Focus CRM Fox"
          className={cn("object-contain transition-transform duration-200 hover:scale-105", iconSizes[size])}
        />
      </div>

      {/* Official Typography & Slogan */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-display font-extrabold tracking-tight text-foreground",
                textTitleSizes[size]
              )}
            >
              Focus
            </span>
            <span
              className={cn(
                "font-display font-black tracking-tight text-[#FF6400]",
                textTitleSizes[size]
              )}
            >
              CRM
            </span>
          </div>
          <span
            className={cn(
              "font-medium tracking-normal text-muted-foreground/90 mt-0.5 whitespace-nowrap",
              textSubtitleSizes[size]
            )}
          >
            powered by focus tech<span className="text-[0.75em] ml-0.5">®</span>
          </span>
        </div>
      )}
    </div>
  );
}



