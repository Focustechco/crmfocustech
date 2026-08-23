import { cn } from "@/lib/utils";
import logoDark from "@/assets/focus-crm-logo-dark.png.asset.json";
import logoLight from "@/assets/focus-crm-logo-light.png.asset.json";
import logoIcon from "@/assets/focus-crm-icon.png.asset.json";

export function FocusLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  if (!showText) {
    return (
      <img
        src={logoIcon.url}
        alt="Focus CRM"
        className={cn("h-8 w-8 object-contain", className)}
      />
    );
  }

  return (
    <>
      <img
        src={logoLight.url}
        alt="Focus CRM — powered by Focus Tech"
        className={cn("block h-auto w-[120px] object-contain md:w-[140px] dark:hidden", className)}
      />
      <img
        src={logoDark.url}
        alt="Focus CRM — powered by Focus Tech"
        className={cn("hidden h-auto w-[120px] object-contain md:w-[140px] dark:block", className)}
      />
    </>
  );
}
