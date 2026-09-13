import { Moon, Sun, LogOut, Search, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
import { useNavigate, useRouterState } from "@tanstack/react-router";

const getModuleTitle = (path: string) => {
  if (path === "/dashboard" || path === "/") return "Dashboard";
  if (path.startsWith("/pipeline")) return "Funil de Leads";
  if (path.startsWith("/leads")) return "Leads";
  if (path.startsWith("/deals")) return "Negócios";
  if (path.startsWith("/clients")) return "Comercial OS";
  if (path.startsWith("/tasks")) return "Tarefas";
  if (path.startsWith("/settings")) return "Configurações";
  return "Focus CRM";
};

export function AppTopbar({ email }: { email?: string | null }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { toggleSidebar } = useSidebar();

  const moduleTitle = getModuleTitle(currentPath);
  const initials = (email?.[0] ?? "F").toUpperCase();

  const signOut = async () => {
    localStorage.removeItem("focus_crm_admin_mode");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E65C00] bg-[#FF6B00] px-4 text-white shadow-xs">
      {/* Desktop: Sidebar Trigger */}
      <div className="hidden md:block text-white hover:bg-white/15 rounded-md p-1 transition-colors [&>button]:text-white">
        <SidebarTrigger />
      </div>

      {/* Mobile: Back Arrow + Module Title (Conforme referência) */}
      <div className="flex md:hidden items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center h-8 w-8 -ml-1 text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Abrir Menu / Voltar"
          aria-label="Abrir Menu / Voltar"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-tight truncate font-sans">
          {moduleTitle}
        </h1>
      </div>

      {/* Desktop: Search Bar */}
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
        <Input
          placeholder="Buscar leads, clientes, negócios..."
          className="pl-9 bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder:text-white/70 border-white/20 focus-visible:ring-white/40 h-9 rounded-lg"
        />
      </div>

      {/* Ações da Direita */}
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {/* Sino de Notificações com indicador (conforme print) */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="text-white hover:bg-white/15 hover:text-white rounded-lg h-9 w-9 relative cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full ring-2 ring-[#FF6B00]" />
        </Button>

        {/* Alternador de Tema (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Alternar tema"
          className="hidden md:flex text-white hover:bg-white/15 hover:text-white rounded-lg h-9 w-9"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Menu do Usuário / Badge Circular FOCUS com borda branca (conforme print) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/15 p-0.5 cursor-pointer">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-xs">
                <AvatarFallback className="bg-[#FF6B00] text-white text-[9px] font-black tracking-tighter uppercase border border-white/40">
                  FOCUS
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
            <DropdownMenuItem onClick={toggle} className="md:hidden flex items-center justify-between">
              <span>Modo {theme === "dark" ? "Claro" : "Escuro"}</span>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
