import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Target,
  CalendarCheck,
  MessageCircle,
  Mail,
  Compass,
  FileAudio,
  CreditCard,
  BarChart3,
  Boxes,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { FocusLogo } from "./focus-logo";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: KanbanSquare },
  { title: "Prospecção", url: "/deals", icon: Compass },
  { title: "Tarefas e Agenda", url: "/tasks", icon: CalendarCheck },
  { title: "Comercial OS", url: "/clients", icon: Target },
  { title: "Transcrição", url: "/transcription", icon: FileAudio },
];

const soonItems = [
  { title: "WhatsApp", url: "#", icon: MessageCircle },
  { title: "E-mail", url: "#", icon: Mail },
  { title: "Focus Pay", url: "#", icon: CreditCard },
  { title: "B.I Focus", url: "#", icon: BarChart3 },
  { title: "ERP Focus", url: "#", icon: Boxes },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 p-0 justify-center">
        <div className={cn("flex h-14 items-center transition-all duration-200", collapsed ? "justify-center px-0" : "justify-start px-3")}>
          <FocusLogo showText={!collapsed} size={collapsed ? "sm" : "md"} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Em breve</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {soonItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled className="opacity-60">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex items-center gap-2">
                        {item.title}
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase text-accent-foreground">
                          soon
                        </span>
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Configurações</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
