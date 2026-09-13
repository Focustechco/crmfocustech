import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  DollarSign,
  Percent,
  KanbanSquare,
  TrendingUp,
  Layers,
  Award,
  ChevronRight,
  Sparkles,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  INITIAL_STAGES,
  INITIAL_DEALS,
  TEAM_MEMBERS,
  PipelineStage,
  DealItem,
} from "./pipeline";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Focus CRM" }] }),
  component: DashboardPage,
});

const BRL = (num: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(num);

// Custom Tooltip para o Gráfico de Pizza por Status
function StatusPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-3 rounded-xl border border-border shadow-lg text-xs space-y-1 z-50">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span>{data.name}</span>
        </div>
        <p className="text-muted-foreground">
          Quantidade: <strong className="text-foreground">{data.value} {data.value === 1 ? "negócio" : "negócios"}</strong>
        </p>
        <p className="text-muted-foreground">
          Valor acumulado: <strong className="text-[#FF6B00]">{BRL(data.totalAmount)}</strong>
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          Participação: <strong className="text-foreground">{data.percentage}% do funil</strong>
        </p>
      </div>
    );
  }
  return null;
}

// Custom Tooltip para o Gráfico de Funil
function FunnelBarTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-3 rounded-xl border border-border shadow-lg text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{data.fullName || data.stage}</p>
        <p className="text-muted-foreground">
          Negócios: <strong className="text-foreground">{data.count}</strong>
        </p>
        <p className="text-muted-foreground">
          Valor Total: <strong className="text-[#FF6B00]">{BRL(data.amount)}</strong>
        </p>
      </div>
    );
  }
  return null;
}

export function DashboardPage() {
  // 1. Carregar estágios e negócios sincronizados com o Pipeline CRM
  const [stages, setStages] = useState<PipelineStage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_stages_store");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_STAGES;
  });

  const [deals, setDeals] = useState<DealItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_deals_store");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_DEALS;
  });

  // Atualizar quando houver alterações em outras abas/módulos
  useEffect(() => {
    const syncData = () => {
      const savedStages = localStorage.getItem("focus_crm_stages_store");
      if (savedStages) {
        try {
          setStages(JSON.parse(savedStages));
        } catch {}
      }
      const savedDeals = localStorage.getItem("focus_crm_deals_store");
      if (savedDeals) {
        try {
          setDeals(JSON.parse(savedDeals));
        } catch {}
      }
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("focus", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("focus", syncData);
    };
  }, []);

  // 2. Query do Supabase para leads adicionais e atividades
  useQuery({
    queryKey: ["dashboard-db-stats"],
    queryFn: async () => {
      const [{ count: leadsCount }, { data: leads }, { data: activities }] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id, name, company, potential_value, is_client, created_at"),
        supabase.from("activities").select("id, title, due_at, completed").eq("completed", false).limit(5),
      ]);
      return {
        leadsCount: leadsCount ?? 0,
        leads: leads ?? [],
        activities: activities ?? [],
      };
    },
  });

  // 3. Cálculos Dinâmicos de KPIs integrados ao Pipeline
  const metrics = useMemo(() => {
    const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
    const totalDealsCount = deals.length;
    const avgTicket = totalDealsCount > 0 ? Math.round(totalPipelineValue / totalDealsCount) : 0;

    // Consideramos fechados/ganhos negócios na última coluna ou com status won
    const lastStageId = stages[stages.length - 1]?.id;
    const wonDeals = deals.filter(
      (d) => d.stage_id === lastStageId || d.status === "won"
    );
    const wonValue = wonDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
    const conversionRate =
      totalDealsCount > 0 ? Math.round((wonDeals.length / totalDealsCount) * 100) : 0;

    return {
      totalPipelineValue,
      totalDealsCount,
      avgTicket,
      wonDealsCount: wonDeals.length,
      wonValue,
      conversionRate,
    };
  }, [deals, stages]);

  // 4. Dados do Gráfico de Pizza por Status (Colunas Existentes do Funil)
  const statusPieData = useMemo(() => {
    const totalVal = metrics.totalPipelineValue || 1;
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage_id === stage.id);
      const stageVal = stageDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
      const percentage = Math.round((stageVal / totalVal) * 100);

      return {
        name: stage.name,
        value: stageDeals.length,
        totalAmount: stageVal,
        color: stage.color || "#FF6B00",
        percentage,
      };
    });
  }, [stages, deals, metrics.totalPipelineValue]);

  // 5. Dados do Gráfico de Funil de Vendas por Etapas (Barras)
  const funnelBarData = useMemo(() => {
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage_id === stage.id);
      const amount = stageDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
      return {
        stage: stage.name.length > 15 ? `${stage.name.substring(0, 15)}...` : stage.name,
        fullName: stage.name,
        count: stageDeals.length,
        amount,
        color: stage.color || "#FF6B00",
      };
    });
  }, [stages, deals]);

  // 6. Dados do Gráfico de Desempenho por Responsável
  const memberPerformanceData = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberDeals = deals.filter((d) => d.responsible?.id === member.id);
      const amount = memberDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
      return {
        name: member.name.split(" ")[0] + " " + (member.name.split(" ")[1]?.[0] || "") + ".",
        fullName: member.name,
        avatar: member.avatar,
        dealsCount: memberDeals.length,
        amount,
      };
    });
  }, [deals]);

  // 7. Dados de Evolução e Previsão Mensal
  const revenueTrendData = [
    { month: "Jan", realizado: 42000, previsto: 50000 },
    { month: "Fev", realizado: 68500, previsto: 75000 },
    { month: "Mar", realizado: 94800, previsto: 110000 },
    { month: "Abr", realizado: 124100, previsto: 135000 },
    { month: "Mai", realizado: 158900, previsto: 170000 },
    { month: "Jun", realizado: metrics.totalPipelineValue || 180920, previsto: Math.round((metrics.totalPipelineValue || 180920) * 1.2) },
  ];

  const kpis = [
    {
      label: "Oportunidades no Funil",
      value: metrics.totalDealsCount,
      icon: KanbanSquare,
      hint: `${stages.length} etapas ativas no CRM`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Valor Total do Pipeline",
      value: BRL(metrics.totalPipelineValue),
      icon: DollarSign,
      hint: "Em negociação no funil",
      color: "text-[#FF6B00]",
      bg: "bg-[#FF6B00]/10",
    },
    {
      label: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      icon: Percent,
      hint: `${metrics.wonDealsCount} negócios finalizados`,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Ticket Médio",
      value: BRL(metrics.avgTicket),
      icon: TrendingUp,
      hint: "Média por negócio",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Desktop (no Mobile o título fica integrado na navbar) */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral inteligente em tempo real integrada ao Funil de Leads.
          </p>
        </div>
        <Button asChild className="bg-[#FF6B00] hover:bg-[#E65C00] text-white cursor-pointer shadow-xs">
          <Link to="/pipeline">
            <KanbanSquare className="mr-2 h-4 w-4" /> Ir para o Funil de Leads
          </Link>
        </Button>
      </div>

      {/* 1. KPIs Principais */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-xs border-border/80 hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground truncate">{k.label}</p>
                  <p className="mt-2 font-display text-xl md:text-2xl font-black tracking-tight truncate">
                    {k.value}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{k.hint}</span>
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 shrink-0 ${k.bg} ${k.color}`}>
                  <k.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Grid de Gráficos: Pizza por Status (Colunas do Funil) + Funil em Barras */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Gráfico de Pizza por Status (Colunas Existentes do Funil) */}
        <Card className="lg:col-span-5 shadow-xs border-border/80 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#FF6B00]" />
                  Distribuição por Status (Colunas)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Proporção de negócios pelas etapas ativas do Funil
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#FF6B00] border-[#FF6B00]/30">
                {stages.length} Colunas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--color-card)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Customizada das Colunas Existentes */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 max-h-36 overflow-y-auto pr-1">
              {statusPieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-foreground truncate text-[11px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-foreground text-[11px] shrink-0 ml-1">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras do Funil de Vendas */}
        <Card className="lg:col-span-7 shadow-xs border-border/80 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <KanbanSquare className="h-4 w-4 text-[#FF6B00]" />
                  Volume Financeiro por Etapa do Funil
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Valor total e contagem de negócios em cada fase
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-[#FF6B00]">
                Total: {BRL(metrics.totalPipelineValue)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[340px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelBarData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} opacity={0.6} />
                <XAxis
                  type="number"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="var(--color-foreground)"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                />
                <Tooltip content={<FunnelBarTooltip />} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {funnelBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Grid Inferior: Evolução de Receita + Desempenho da Equipe */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Evolução de Receita & Previsão */}
        <Card className="lg:col-span-7 shadow-xs border-border/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
                  Evolução & Previsão de Receita (R$)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Comparativo entre receita faturada e projeção do pipeline
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[270px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="realizadoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="previstoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.6} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [BRL(Number(value)), ""]}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  name="Realizado"
                  dataKey="realizado"
                  stroke="#FF6B00"
                  strokeWidth={2.5}
                  fill="url(#realizadoGrad)"
                />
                <Area
                  type="monotone"
                  name="Projeção"
                  dataKey="previsto"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#previstoGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desempenho por Responsável */}
        <Card className="lg:col-span-5 shadow-xs border-border/80 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-[#FF6B00]" />
              Desempenho da Equipe Comercial
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Volume e negócios sob gestão por consultor
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 pt-2">
            {memberPerformanceData.map((member) => (
              <div
                key={member.fullName}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {member.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{member.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{member.dealsCount} negócios ativos</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-[#FF6B00]">{BRL(member.amount)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Pipeline</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 4. Lista dos Últimos Negócios do Pipeline */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                Oportunidades Recentes no Pipeline
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Últimos negócios cadastrados e em andamento
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-[#FF6B00] hover:text-[#E65C00] cursor-pointer">
              <Link to="/pipeline" className="flex items-center gap-1">
                Ver todos no Kanban <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {deals.slice(0, 5).map((deal) => {
              const stage = stages.find((s) => s.id === deal.stage_id) || stages[0];
              return (
                <div key={deal.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-1.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: stage?.color || "#FF6B00" }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{deal.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {deal.client_name} {deal.company_name ? `· ${deal.company_name}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      style={{
                        backgroundColor: `${stage?.color || "#FF6B00"}15`,
                        color: stage?.color || "#FF6B00",
                        borderColor: `${stage?.color || "#FF6B00"}35`,
                      }}
                      className="text-[10px] font-bold uppercase border hidden sm:inline-flex"
                    >
                      {stage?.name}
                    </Badge>
                    <span className="text-xs font-extrabold text-foreground">
                      {BRL(deal.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
