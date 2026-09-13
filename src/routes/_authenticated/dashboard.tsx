import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Percent,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Focus CRM" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ count: leadsCount }, { data: leads }, { data: activities }] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("potential_value, is_client, created_at"),
        supabase.from("activities").select("id, title, due_at, completed").eq("completed", false).limit(5),
      ]);
      const totalValue = (leads ?? []).reduce((s, l) => s + Number(l.potential_value ?? 0), 0);
      const clients = (leads ?? []).filter((l) => l.is_client).length;
      const conversion = leadsCount && leadsCount > 0 ? Math.round((clients / leadsCount) * 100) : 0;
      return {
        leadsCount: leadsCount ?? 0,
        totalValue,
        clients,
        conversion,
        pendingTasks: activities?.length ?? 0,
        upcomingActivities: activities ?? [],
      };
    },
  });

  const funnel = [
    { stage: "Novo", value: 42 },
    { stage: "Contato", value: 28 },
    { stage: "Qualif.", value: 18 },
    { stage: "Proposta", value: 10 },
    { stage: "Fechamento", value: 6 },
  ];
  const revenue = [
    { m: "Jan", v: 12000 },
    { m: "Fev", v: 18500 },
    { m: "Mar", v: 16800 },
    { m: "Abr", v: 24100 },
    { m: "Mai", v: 28900 },
    { m: "Jun", v: 34200 },
  ];

  const kpis = [
    { label: "Total de Leads", value: stats?.leadsCount ?? 0, icon: Users, hint: "+12% vs mês anterior" },
    {
      label: "Receita Potencial",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.totalValue ?? 0),
      icon: DollarSign,
      hint: "Pipeline ativo",
    },
    { label: "Conversão", value: `${stats?.conversion ?? 0}%`, icon: Percent, hint: "Lead → cliente" },
    { label: "Tarefas Pendentes", value: stats?.pendingTasks ?? 0, icon: CheckCircle2, hint: "Para hoje" },
  ];

  return (
    <div className="space-y-6">
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do seu CRM em tempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold">{k.value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <ArrowUpRight className="h-3 w-3" /> {k.hint}
                  </p>
                </div>
                <div className="rounded-lg bg-accent p-2 text-primary">
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Receita mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="var(--color-muted-foreground)" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Atividades pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.upcomingActivities?.length ? (
            <ul className="divide-y">
              {stats.upcomingActivities.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{a.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {a.due_at ? new Date(a.due_at).toLocaleString("pt-BR") : "Sem data"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma atividade pendente. Aproveite para criar um novo lead.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
