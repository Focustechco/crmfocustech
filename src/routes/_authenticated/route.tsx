import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const isAdminMode = localStorage.getItem("focus_crm_admin_mode");
      if (isAdminMode) {
        return {
          user: {
            id: "00000000-0000-0000-0000-000000000001",
            email: "admin@focustech.com",
            user_metadata: { full_name: "Administrador Focus Tech", role: "admin" },
          },
        };
      }
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [email, setEmail] = useState<string | null>(user?.email ?? null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminMode = localStorage.getItem("focus_crm_admin_mode");
    if (isAdminMode) {
      setEmail("admin@focustech.com");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user && !localStorage.getItem("focus_crm_admin_mode")) {
        navigate({ to: "/auth", replace: true });
      } else {
        setEmail(session?.user?.email ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AppTopbar email={email} />
            <main className="flex-1 p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
