import { Moon, Sun, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export function AppTopbar({ email }: { email?: string | null }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const initials = (email?.[0] ?? "F").toUpperCase();

  const signOut = async () => {
    localStorage.removeItem("focus_crm_admin_mode");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E65C00] bg-[#FF6B00] px-4 text-white shadow-xs">
      <div className="text-white hover:bg-white/15 rounded-md p-1 transition-colors [&>button]:text-white">
        <SidebarTrigger />
      </div>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
        <Input
          placeholder="Buscar leads, clientes, negócios..."
          className="pl-9 bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder:text-white/70 border-white/20 focus-visible:ring-white/40 h-9 rounded-lg"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Alternar tema"
          className="text-white hover:bg-white/15 hover:text-white rounded-lg h-9 w-9"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/15 p-0.5">
              <Avatar className="h-8 w-8 ring-2 ring-white/30">
                <AvatarFallback className="bg-white text-[#FF6B00] text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Minha conta</span>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
