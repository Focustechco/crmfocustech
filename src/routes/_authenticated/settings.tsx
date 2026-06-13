import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · Focus CRM" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setCompany(profile.company ?? "");
      setJobRole(profile.role ?? "");
    }
  }, [profile]);

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: u.user.id, full_name: fullName, company, role: jobRole });
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferências.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fn">Nome completo</Label>
            <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="co">Empresa</Label>
              <Input id="co" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rl">Cargo</Label>
              <Input id="rl" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
            </div>
          </div>
          <Button onClick={save} className="brand-gradient text-white hover:opacity-90">
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo escuro</p>
              <p className="text-sm text-muted-foreground">
                Alterne entre o tema claro e escuro do Focus CRM.
              </p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Módulos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            CRM, Pipeline e Clientes estão ativos. Tarefas, WhatsApp, Automação, E-mail,
            Financeiro e Focus AI chegam nas próximas fases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
