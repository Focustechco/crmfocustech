import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  LogOut,
  Search,
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Video,
  FileAudio,
  Trophy,
  CheckSquare,
  Users,
  Target,
  ExternalLink,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  moduleSource: "pipeline" | "leads" | "deals" | "tasks" | "clients" | "transcription" | "system";
  notificationType: "meeting_reminder" | "lead_assigned" | "deal_won" | "task_overdue" | "transcription_ready" | "goal_achieved";
  priority: "low" | "normal" | "high" | "urgent";
  title: string;
  message: string;
  actionUrl: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

const STORAGE_NOTIFICATIONS_KEY = "focus_crm_notifications_system";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    moduleSource: "tasks",
    notificationType: "meeting_reminder",
    priority: "urgent",
    title: "Reunião no Google Meet em 15 minutos",
    message: "Diagnóstico Comercial com Carlos Eduardo Silva (TechVanguard Soluções).",
    actionUrl: "/tasks",
    actionLabel: "Abrir Agenda",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "notif-2",
    moduleSource: "transcription",
    notificationType: "transcription_ready",
    priority: "high",
    title: "Relatório de Reunião IA Concluído",
    message: "A transcrição da reunião de Apresentação de Proposta foi estruturada com sucesso.",
    actionUrl: "/transcription",
    actionLabel: "Ver Transcrição",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "notif-3",
    moduleSource: "clients",
    notificationType: "goal_achieved",
    priority: "normal",
    title: "🏆 Meta Batida pela Equipe!",
    message: "Lucas Closer atingiu 100% da meta mensal de faturamento (R$ 53.000).",
    actionUrl: "/clients",
    actionLabel: "Ver Comercial OS",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "notif-4",
    moduleSource: "pipeline",
    notificationType: "lead_assigned",
    priority: "normal",
    title: "Novo Lead Qualificado Inbound",
    message: "Mariana Alcantara (Alcantara Logística) solicitou proposta Enterprise.",
    actionUrl: "/pipeline",
    actionLabel: "Ver no Funil",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const getModuleTitle = (path: string) => {
  if (path === "/dashboard" || path === "/") return "Dashboard";
  if (path.startsWith("/pipeline")) return "Funil de Leads";
  if (path.startsWith("/leads")) return "Leads";
  if (path.startsWith("/deals")) return "Prospecção";
  if (path.startsWith("/clients")) return "Comercial OS";
  if (path.startsWith("/tasks")) return "Tarefas e Agenda";
  if (path.startsWith("/transcription")) return "Transcrição";
  if (path.startsWith("/settings")) return "Configurações";
  return "Focus CRM";
};

export function AppTopbar({ email }: { email?: string | null }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { toggleSidebar } = useSidebar();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("Todas as notificações foram marcadas como lidas.");
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.success("Histórico de notificações limpo.");
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setNotificationsOpen(false);
    navigate({ to: item.actionUrl });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "unread") return !n.isRead;
    return true;
  });

  const getNotificationIcon = (item: NotificationItem) => {
    switch (item.moduleSource) {
      case "tasks":
        return <Video className="h-4 w-4 text-emerald-500" />;
      case "transcription":
        return <FileAudio className="h-4 w-4 text-purple-500" />;
      case "clients":
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case "pipeline":
      case "leads":
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-[#FF6B00]" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return "Agora mesmo";
    if (mins < 60) return `há ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const moduleTitle = getModuleTitle(currentPath);

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

      {/* Mobile: Back Arrow + Module Title */}
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
          placeholder="Buscar leads, clientes, tarefas, transcrições..."
          className="pl-9 bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder:text-white/70 border-white/20 focus-visible:ring-white/40 h-9 rounded-lg text-xs"
        />
      </div>

      {/* Ações da Direita */}
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {/* POPOVER / DROPDOWN DE NOTIFICAÇÕES */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificações"
              className="text-white hover:bg-white/15 hover:text-white rounded-lg h-9 w-9 relative cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#FF6B00] animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[360px] sm:w-[400px] p-0 shadow-xl border bg-card">
            {/* Header do Popover */}
            <div className="flex items-center justify-between p-3.5 border-b bg-muted/40">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#FF6B00]" />
                <span className="font-bold text-sm text-foreground">Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20 text-[11px] px-1.5 py-0">
                    {unreadCount} novas
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Lidas
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearNotifications}
                    className="h-7 w-7 text-muted-foreground hover:text-red-600"
                    title="Limpar todas"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtro Rápido */}
            <div className="flex items-center px-3 py-1.5 border-b bg-muted/20 gap-2">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filterTab === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filterTab === "unread"
                    ? "bg-background text-foreground shadow-xs font-semibold text-[#FF6B00]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Não Lidas ({unreadCount})
              </button>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-[380px] overflow-y-auto divide-y">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="font-medium text-foreground">Você está em dia!</p>
                  <p>Nenhuma notificação {filterTab === "unread" ? "não lida" : "recente"}.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !item.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 border">
                      {getNotificationIcon(item)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs leading-tight truncate ${!item.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && (
                        <div className="pt-1">
                          <span className="inline-flex items-center text-[11px] font-semibold text-[#FF6B00] hover:underline">
                            {item.actionLabel} <ExternalLink className="h-2.5 w-2.5 ml-1" />
                          </span>
                        </div>
                      )}
                    </div>

                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#FF6B00] shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer do Popover */}
            <div className="p-2 border-t bg-muted/30 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate({ to: "/settings" });
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-7 w-full flex items-center justify-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" />
                Configurar Preferências de Notificação
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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

        {/* Menu do Usuário / Badge Circular FOCUS com borda branca */}
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
                <span className="text-xs text-muted-foreground truncate">{email || "admin@focustech.co"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggle} className="md:hidden flex items-center justify-between">
              <span>Modo {theme === "dark" ? "Claro" : "Escuro"}</span>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
