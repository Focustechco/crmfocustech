import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  Phone,
  Calendar,
  RotateCcw,
  Trophy,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  Activity,
  ArrowUpRight,
  MessageCircle,
  MoreVertical,
  Trash2,
  Check,
  Flame,
  Award,
  Users,
  Settings,
  ChevronRight,
  CalendarDays,
  FileCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Comercial OS · Focus CRM" }] }),
  component: ComercialOSPage,
});

export type ActivityType = "call" | "meeting" | "followup" | "deal_won";
export type ActivityStatus = "completed" | "scheduled" | "pending";

export interface CommercialActivity {
  id: string;
  type: ActivityType;
  title: string;
  leadName: string;
  company?: string;
  responsibleId: string;
  date: string;
  time: string;
  duration?: string;
  value?: number;
  status: ActivityStatus;
  notes: string;
  phone?: string;
  createdAt: string;
}

export interface ConsultantGoal {
  userId: string;
  monthlyRevenueTarget: number;
  callsTarget: number;
  meetingsTarget: number;
  followupsTarget: number;
  dealsTarget: number;
}

const STORAGE_ACTIVITIES_KEY = "focus_crm_comercial_os_activities";
const STORAGE_GOALS_KEY = "focus_crm_comercial_os_goals";

// Metas padrão por consultor
const DEFAULT_GOALS: Record<string, ConsultantGoal> = {
  "user-1": {
    userId: "user-1",
    monthlyRevenueTarget: 75000,
    callsTarget: 60,
    meetingsTarget: 25,
    followupsTarget: 40,
    dealsTarget: 6,
  },
  "user-2": {
    userId: "user-2",
    monthlyRevenueTarget: 65000,
    callsTarget: 50,
    meetingsTarget: 20,
    followupsTarget: 35,
    dealsTarget: 5,
  },
  "user-3": {
    userId: "user-3",
    monthlyRevenueTarget: 50000,
    callsTarget: 45,
    meetingsTarget: 18,
    followupsTarget: 30,
    dealsTarget: 4,
  },
  "user-4": {
    userId: "user-4",
    monthlyRevenueTarget: 40000,
    callsTarget: 40,
    meetingsTarget: 15,
    followupsTarget: 25,
    dealsTarget: 3,
  },
};

// Atividades iniciais de demonstração rica
const INITIAL_ACTIVITIES: CommercialActivity[] = [
  {
    id: "act-1",
    type: "deal_won",
    title: "Contrato Assinado - Plano Enterprise",
    leadName: "Carlos Eduardo Silva",
    company: "TechVanguard Soluções",
    responsibleId: "user-1",
    date: new Date().toISOString().split("T")[0],
    time: "10:30",
    value: 28500,
    status: "completed",
    notes: "Contrato anual fechado com pagamento à vista. Onboarding agendado para próxima segunda.",
    phone: "11987654321",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "act-2",
    type: "meeting",
    title: "Apresentação de Proposta Comercial",
    leadName: "Mariana Albuquerque",
    company: "Inovare Distribuidora",
    responsibleId: "user-2",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    duration: "45 min",
    status: "completed",
    notes: "Demonstração do CRM para diretoria. Feedback muito positivo, enviando minuta final.",
    phone: "21998765432",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "act-3",
    type: "call",
    title: "Ligação de Qualificação / Diagnóstico",
    leadName: "Roberto Mendonça",
    company: "Alfa Logística & Fretes",
    responsibleId: "user-1",
    date: new Date().toISOString().split("T")[0],
    time: "11:15",
    duration: "18 min",
    status: "completed",
    notes: "Lead tem 15 vendedores internos. Tem interesse urgente no módulo de pipeline e automações.",
    phone: "31987651234",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "act-4",
    type: "followup",
    title: "Follow-up pós-envio de Proposta",
    leadName: "Fernanda Costa",
    company: "Nexus Saúde Integrada",
    responsibleId: "user-3",
    date: new Date().toISOString().split("T")[0],
    time: "16:00",
    status: "scheduled",
    notes: "Alinhar dúvidas sobre integração de API com ERP legado.",
    phone: "41991234567",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "act-5",
    type: "deal_won",
    title: "Fechamento de Renovação + Expansão",
    leadName: "Guilherme Santos",
    company: "OmniPay Brasil",
    responsibleId: "user-2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "17:45",
    value: 42000,
    status: "completed",
    notes: "Adição de 25 licenças de consultores e módulo BI avançado.",
    phone: "11976543210",
    createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
  },
  {
    id: "act-6",
    type: "call",
    title: "Cold Call / Prospecção Ativa",
    leadName: "Patrícia Vianna",
    company: "Prime Real Estate",
    responsibleId: "user-4",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "09:30",
    duration: "12 min",
    status: "completed",
    notes: "Interesse em gestão de corretores. Reunião de demo agendada para quinta-feira.",
    phone: "71988887777",
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: "act-7",
    type: "meeting",
    title: "Reunião de Alinhamento Técnico",
    leadName: "Luciana Martins",
    company: "Solaris Energia Solar",
    responsibleId: "user-1",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    time: "15:00",
    duration: "60 min",
    status: "completed",
    notes: "Apresentamos a segurança de dados e integrações com WhatsApp corporativo.",
    phone: "85992223344",
    createdAt: new Date(Date.now() - 86400000 * 2.2).toISOString(),
  },
  {
    id: "act-8",
    type: "followup",
    title: "Follow-up de Contrato em Revisão Jurídica",
    leadName: "André Guimarães",
    company: "Grupo Construtor Horizonte",
    responsibleId: "user-3",
    date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    time: "11:00",
    status: "completed",
    notes: "Jurídico aprovou cláusulas padrão. Aguardando assinatura digital.",
    phone: "19981112233",
    createdAt: new Date(Date.now() - 86400000 * 3.3).toISOString(),
  },
  {
    id: "act-9",
    type: "deal_won",
    title: "Contrato Assinado - Plano Growth",
    leadName: "Renata Vasconcelos",
    company: "Vanguard Contabilidade",
    responsibleId: "user-4",
    date: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
    time: "16:20",
    value: 19800,
    status: "completed",
    notes: "Contrato fechado com sucesso após 3 semanas de negociação.",
    phone: "31977778888",
    createdAt: new Date(Date.now() - 86400000 * 4.1).toISOString(),
  },
];

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function ComercialOSPage() {
  const qc = useQueryClient();

  // Estados locais
  const [activities, setActivities] = useState<CommercialActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACTIVITIES;
  });

  const [goals, setGoals] = useState<Record<string, ConsultantGoal>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GOALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_GOALS;
  });

  const [activeTab, setActiveTab] = useState<"ranking" | "activities" | "charts" | "deals">("ranking");
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("month");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modais
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<TeamMember | null>(null);

  // Form de Atividade
  const [formType, setFormType] = useState<ActivityType>("call");
  const [formTitle, setFormTitle] = useState("");
  const [formLeadName, setFormLeadName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formResponsibleId, setFormResponsibleId] = useState(TEAM_MEMBERS[0].id);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formTime, setFormTime] = useState("14:00");
  const [formDuration, setFormDuration] = useState("15 min");
  const [formValue, setFormValue] = useState("");
  const [formStatus, setFormStatus] = useState<ActivityStatus>("completed");
  const [formNotes, setFormNotes] = useState("");

  // Salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
    } catch {}
  }, [goals]);

  // Consulta leads do Supabase para vincular com negócios fechados
  const { data: supabaseLeads = [] } = useQuery({
    queryKey: ["leads-comercial-os"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*");
      return data ?? [];
    },
  });

  // Filtragem de atividades por período e responsável
  const filteredActivities = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    return activities.filter((act) => {
      if (selectedConsultant !== "all" && act.responsibleId !== selectedConsultant) {
        return false;
      }
      if (activityTypeFilter !== "all" && act.type !== activityTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          act.title.toLowerCase().includes(q) ||
          act.leadName.toLowerCase().includes(q) ||
          (act.company && act.company.toLowerCase().includes(q)) ||
          act.notes.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      const actDate = new Date(act.date);
      if (selectedPeriod === "today") {
        return act.date === todayStr;
      }
      if (selectedPeriod === "week") {
        return actDate >= weekAgo;
      }
      if (selectedPeriod === "month") {
        return actDate >= monthAgo;
      }
      return true;
    });
  }, [activities, selectedConsultant, selectedPeriod, activityTypeFilter, searchQuery]);

  // Contabilizadores Globais / KPIs
  const metrics = useMemo(() => {
    const list = filteredActivities;
    const calls = list.filter((a) => a.type === "call");
    const meetings = list.filter((a) => a.type === "meeting");
    const followups = list.filter((a) => a.type === "followup");
    const dealsWon = list.filter((a) => a.type === "deal_won");

    const totalRevenue = dealsWon.reduce((acc, a) => acc + (a.value || 0), 0);
    const totalTarget = Object.values(goals).reduce(
      (acc, g) => acc + g.monthlyRevenueTarget,
      0,
    );
    const quotaPct = totalTarget > 0 ? Math.min(100, Math.round((totalRevenue / totalTarget) * 100)) : 0;

    const completedCalls = calls.filter((a) => a.status === "completed").length;
    const completedMeetings = meetings.filter((a) => a.status === "completed").length;
    const completedFollowups = followups.filter((a) => a.status === "completed").length;
    const pendingFollowups = followups.filter((a) => a.status !== "completed").length;

    return {
      totalActivities: list.length,
      callsCount: calls.length,
      completedCalls,
      meetingsCount: meetings.length,
      completedMeetings,
      followupsCount: followups.length,
      completedFollowups,
      pendingFollowups,
      dealsWonCount: dealsWon.length,
      totalRevenue,
      totalTarget,
      quotaPct,
    };
  }, [filteredActivities, goals]);

  // Performance por Membro da Equipe
  const teamPerformance = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberActs = activities.filter((a) => a.responsibleId === member.id);
      const calls = memberActs.filter((a) => a.type === "call");
      const meetings = memberActs.filter((a) => a.type === "meeting");
      const followups = memberActs.filter((a) => a.type === "followup");
      const deals = memberActs.filter((a) => a.type === "deal_won");

      const revenue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
      const memberGoal = goals[member.id] || {
        monthlyRevenueTarget: 50000,
        callsTarget: 40,
        meetingsTarget: 20,
        followupsTarget: 30,
        dealsTarget: 4,
      };

      const revenuePct =
        memberGoal.monthlyRevenueTarget > 0
          ? Math.round((revenue / memberGoal.monthlyRevenueTarget) * 100)
          : 0;

      // Taxa de conversão: reuniões -> contratos
      const conversionRate =
        meetings.length > 0
          ? Math.min(100, Math.round((deals.length / meetings.length) * 100))
          : deals.length > 0
          ? 100
          : 0;

      const avgTicket = deals.length > 0 ? Math.round(revenue / deals.length) : 0;

      return {
        member,
        callsCount: calls.length,
        meetingsCount: meetings.length,
        followupsCount: followups.length,
        dealsCount: deals.length,
        revenue,
        target: memberGoal.monthlyRevenueTarget,
        revenuePct,
        conversionRate,
        avgTicket,
        goals: memberGoal,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [activities, goals]);

  // Dados para gráficos
  const barChartData = useMemo(() => {
    return teamPerformance.map((tp) => ({
      name: tp.member.name.split(" ")[0],
      fullName: tp.member.name,
      Ligações: tp.callsCount,
      Reuniões: tp.meetingsCount,
      FollowUps: tp.followupsCount,
      Fechamentos: tp.dealsCount,
      Receita: tp.revenue,
    }));
  }, [teamPerformance]);

  // Handler para Registrar Ação Resumida
  const handleCreateActivity = () => {
    if (!formLeadName.trim()) {
      return toast.error("Informe o nome do lead ou cliente.");
    }

    const defaultTitle =
      formType === "call"
        ? "Ligação Comercial"
        : formType === "meeting"
        ? "Reunião de Alinhamento"
        : formType === "followup"
        ? "Follow-up Comercial"
        : "Contrato Fechado";

    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const newAct: CommercialActivity = {
      id: `act-${Date.now()}`,
      type: formType,
      title: defaultTitle,
      leadName: formLeadName.trim(),
      responsibleId: formResponsibleId,
      date: formDate,
      time: timeStr,
      value: formType === "deal_won" ? Number(formValue.replace(/\D/g, "")) || 0 : undefined,
      status: formStatus,
      notes: "",
      createdAt: now.toISOString(),
    };

    setActivities((prev) => [newAct, ...prev]);
    toast.success(
      formType === "deal_won"
        ? "🏆 Contrato registrado com sucesso!"
        : "Ação registrada com sucesso!",
    );

    // Reset form resumido
    setFormLeadName("");
    setFormValue("");
    setIsActivityModalOpen(false);
  };

  // Toggle status de atividade
  const toggleActivityStatus = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus: ActivityStatus = a.status === "completed" ? "pending" : "completed";
          toast.info(`Status alterado para: ${nextStatus === "completed" ? "Concluído" : "Pendente"}`);
          return { ...a, status: nextStatus };
        }
        return a;
      }),
    );
  };

  // Excluir atividade
  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success("Atividade removida.");
  };

  // Abrir WhatsApp do lead
  const openWhatsApp = (phone?: string, name?: string) => {
    if (!phone) {
      toast.error("Telefone não informado para este contato.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const formatted = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(`Olá ${name || ""}, tudo bem? Sou da equipe comercial Focus Tech.`);
    window.open(`https://wa.me/${formatted}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Título e Ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Comercial OS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sistema Operacional Comercial & Produtividade da Equipe em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto md:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGoalsModalOpen(true)}
            className="gap-1.5 border-border hover:bg-muted text-xs h-9"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Metas da Equipe
          </Button>

          <Button
            onClick={() => {
              setFormType("call");
              setFormTitle("Ligação de Prospecção / Follow-up");
              setIsActivityModalOpen(true);
            }}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white gap-1.5 font-medium shadow-xs text-xs h-9"
          >
            <Plus className="h-4 w-4" />
            Registrar Ação
          </Button>
        </div>
      </div>

      {/* Mini-Cockpit / KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Ligações */}
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ligações
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Phone className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{metrics.callsCount}</span>
            <span className="text-xs text-muted-foreground">
              ({metrics.completedCalls} efetuadas)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Taxa de Contato</span>
            <span className="font-semibold text-foreground">
              {metrics.callsCount > 0
                ? `${Math.round((metrics.completedCalls / metrics.callsCount) * 100)}%`
                : "100%"}
            </span>
          </div>
        </Card>

        {/* KPI 2: Reuniões */}
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reuniões
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{metrics.meetingsCount}</span>
            <span className="text-xs text-muted-foreground">
              ({metrics.completedMeetings} feitas)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Comparecimento</span>
            <span className="font-semibold text-emerald-600">
              {metrics.meetingsCount > 0
                ? `${Math.round((metrics.completedMeetings / metrics.meetingsCount) * 100)}%`
                : "100%"}
            </span>
          </div>
        </Card>

        {/* KPI 3: Follow-ups */}
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Follow-ups
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{metrics.followupsCount}</span>
            {metrics.pendingFollowups > 0 && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                {metrics.pendingFollowups} pendentes
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>No prazo</span>
            <span className="font-semibold text-foreground">
              {metrics.completedFollowups} realizados
            </span>
          </div>
        </Card>

        {/* KPI 4: Contratos Fechados */}
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fechamentos
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              {metrics.dealsWonCount}
            </span>
            <span className="text-xs text-muted-foreground">contratos</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Receita Faturada</span>
            <span className="font-semibold text-emerald-600">
              {formatBRL(metrics.totalRevenue)}
            </span>
          </div>
        </Card>

        {/* KPI 5: Meta Global da Equipe */}
        <Card className="col-span-2 md:col-span-1 p-4 bg-gradient-to-br from-primary/5 via-card to-card border-primary/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Meta do Mês
            </span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-primary">
              {metrics.quotaPct}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatBRL(metrics.totalRevenue)} / {formatBRL(metrics.totalTarget)}
            </span>
          </div>
          <div className="mt-2">
            <Progress value={metrics.quotaPct} className="h-1.5 bg-muted" />
          </div>
        </Card>
      </div>

      {/* Barra de Filtros e Controles Rápidos */}
      <Card className="p-2 sm:p-2.5 bg-card border-border/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Abas de visualização na mesma linha */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg overflow-x-auto no-scrollbar shrink-0">
            <Button
              variant={activeTab === "ranking" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ranking")}
              className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
                activeTab === "ranking"
                  ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              Ranking
            </Button>
            <Button
              variant={activeTab === "activities" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("activities")}
              className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
                activeTab === "activities"
                  ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              Atividades
            </Button>
            <Button
              variant={activeTab === "charts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("charts")}
              className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
                activeTab === "charts"
                  ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              Produtividade
            </Button>
            <Button
              variant={activeTab === "deals" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("deals")}
              className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
                activeTab === "deals"
                  ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                  : "text-foreground hover:text-foreground"
              }`}
            >
              Contratos
            </Button>
          </div>

          {/* Filtros de Vendedor e Período na mesma linha */}
          <div className="flex items-center gap-1.5 shrink-0 justify-between sm:justify-end w-full lg:w-auto">
            {/* Filtro de Consultor */}
            <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
              <SelectTrigger className="h-7.5 text-xs w-[140px] sm:w-[160px] bg-background px-2">
                <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Toda a Equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda a Equipe</SelectItem>
                {TEAM_MEMBERS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Período */}
            <Select
              value={selectedPeriod}
              onValueChange={(v) => setSelectedPeriod(v as any)}
            >
              <SelectTrigger className="h-7.5 text-xs w-[115px] sm:w-[130px] bg-background px-2">
                <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="all">Histórico</SelectItem>
              </SelectContent>
            </Select>

            {/* Ação Mobile: Registrar Atividade */}
            <Button
              onClick={() => {
                setFormType("call");
                setFormTitle("Ligação Comercial");
                setIsActivityModalOpen(true);
              }}
              size="sm"
              className="lg:hidden brand-gradient text-white h-7.5 text-xs px-2.5 font-semibold cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              + Ação
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* ABA 1: RANKING & PERFORMANCE DA EQUIPE */}
      {/* ========================================================================= */}
      {activeTab === "ranking" && (
        <div className="space-y-6">
          {/* Top 3 Pódio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamPerformance.slice(0, 3).map((perf, index) => {
              const medals = ["🥇 1º Lugar", "🥈 2º Lugar", "🥉 3º Lugar"];
              const borderColors = [
                "border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-card to-card shadow-amber-500/5",
                "border-slate-300/60 bg-gradient-to-b from-slate-400/10 via-card to-card",
                "border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-card to-card",
              ];

              return (
                <Card
                  key={perf.member.id}
                  className={`p-5 relative border ${borderColors[index]} shadow-md transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-bold text-xs bg-background/80">
                      {medals[index]}
                    </Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                      {perf.revenuePct}% da Meta
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-3.5">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/30 shadow-md">
                      <AvatarImage src={perf.member.avatar} />
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {perf.member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base truncate">{perf.member.name}</h3>
                      <p className="text-xs text-muted-foreground">{perf.member.role}</p>
                      <p className="mt-1 text-base font-extrabold text-primary">
                        {formatBRL(perf.revenue)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso de Meta */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Meta: {formatBRL(perf.target)}</span>
                      <span className="font-medium text-foreground">{perf.dealsCount} fechamentos</span>
                    </div>
                    <Progress value={perf.revenuePct} className="h-2 bg-muted" />
                  </div>

                  {/* Mini Grid de Ações */}
                  <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t text-center text-xs">
                    <div className="bg-muted/40 p-2 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Ligações</span>
                      <span className="font-bold text-foreground">{perf.callsCount}</span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Reuniões</span>
                      <span className="font-bold text-foreground">{perf.meetingsCount}</span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Conversão</span>
                      <span className="font-bold text-emerald-600">{perf.conversionRate}%</span>
                    </div>
                  </div>

                  {/* Ação rápida */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormResponsibleId(perf.member.id);
                        setFormType("call");
                        setFormTitle(`Ligação - ${perf.member.name}`);
                        setIsActivityModalOpen(true);
                      }}
                      className="w-full text-xs font-medium cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Registrar Ação
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserForDetail(perf.member)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Detalhes
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabela Completa de Performance de Todos os Membros */}
          <Card className="p-0 overflow-hidden border-border/80 shadow-xs">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Desempenho Geral dos Consultores</h3>
                <p className="text-xs text-muted-foreground">
                  Acompanhamento consolidado de atividades, metas e taxas de conversão.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Consultor</th>
                    <th className="py-3 px-3 text-center">Ligações</th>
                    <th className="py-3 px-3 text-center">Reuniões</th>
                    <th className="py-3 px-3 text-center">Follow-ups</th>
                    <th className="py-3 px-3 text-center">Contratos</th>
                    <th className="py-3 px-4">Progresso da Meta</th>
                    <th className="py-3 px-4 text-right">Faturado</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {teamPerformance.map((tp, idx) => (
                    <tr key={tp.member.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={tp.member.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {tp.member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {tp.member.name}
                              {idx === 0 && <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{tp.member.role}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
                          {tp.callsCount}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600">
                          {tp.meetingsCount}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600">
                          {tp.followupsCount}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {tp.dealsCount}
                      </td>

                      <td className="py-3 px-4 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-primary">{tp.revenuePct}%</span>
                            <span className="text-[11px] text-muted-foreground">
                              Meta {formatBRL(tp.target)}
                            </span>
                          </div>
                          <Progress value={tp.revenuePct} className="h-1.5 bg-muted" />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        {formatBRL(tp.revenue)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormResponsibleId(tp.member.id);
                            setIsActivityModalOpen(true);
                          }}
                          className="h-8 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          + Ação
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: FEED DE ATIVIDADES EM TEMPO REAL */}
      {/* ========================================================================= */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          {/* Filtros da Linha do Tempo */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
              {[
                { id: "all", label: "Todas" },
                { id: "call", label: "📞 Ligações" },
                { id: "meeting", label: "📅 Reuniões" },
                { id: "followup", label: "🔄 Follow-ups" },
                { id: "deal_won", label: "🏆 Fechamentos" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activityTypeFilter === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivityTypeFilter(tab.id)}
                  className={`text-xs h-8 cursor-pointer shrink-0 ${
                    activityTypeFilter === tab.id ? "bg-primary text-white" : ""
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar lead, empresa ou nota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>
          </div>

          {/* Timeline de Atividades */}
          {filteredActivities.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Activity className="h-6 w-6" />
              </div>
              <p className="font-semibold">Nenhuma atividade encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente ajustar os filtros ou registre uma nova ação comercial.
              </p>
              <Button
                onClick={() => setIsActivityModalOpen(true)}
                size="sm"
                className="mt-4 brand-gradient text-white text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar Atividade
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                const member = TEAM_MEMBERS.find((m) => m.id === act.responsibleId) || TEAM_MEMBERS[0];

                const typeConfig = {
                  call: {
                    label: "Ligação",
                    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    icon: Phone,
                  },
                  meeting: {
                    label: "Reunião",
                    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    icon: Calendar,
                  },
                  followup: {
                    label: "Follow-up",
                    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                    icon: RotateCcw,
                  },
                  deal_won: {
                    label: "Contrato Fechado",
                    color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
                    icon: Trophy,
                  },
                }[act.type];

                const Icon = typeConfig.icon;

                return (
                  <Card
                    key={act.id}
                    className="p-4 bg-card border-border/80 shadow-xs hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      {/* Lado Esquerdo: Ícone + Detalhes Principais */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl border shrink-0 ${typeConfig.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground">{act.title}</h4>
                            <Badge variant="outline" className={`text-[10px] font-semibold ${typeConfig.color}`}>
                              {typeConfig.label}
                            </Badge>
                            {act.value && (
                              <Badge className="bg-emerald-600 text-white font-bold text-[11px]">
                                {formatBRL(act.value)}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {act.leadName}
                            </span>
                            {act.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {act.company}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {act.date} às {act.time}
                              {act.duration && ` (${act.duration})`}
                            </span>
                          </div>

                          {act.notes && (
                            <p className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
                              "{act.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Lado Direito: Responsável + Ações */}
                      <div className="flex items-center md:flex-col md:items-end justify-between gap-2.5 pt-2 md:pt-0 border-t md:border-t-0">
                        {/* Avatar do Consultor Responsável */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 ring-1 ring-border">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary text-white text-[10px]">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left md:text-right">
                            <p className="text-xs font-semibold leading-none">{member.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{member.role}</p>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-1.5">
                          {act.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWhatsApp(act.phone, act.leadName)}
                              title="Abrir WhatsApp"
                              className="h-7 px-2 text-[11px] gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </Button>
                          )}

                          <Button
                            variant={act.status === "completed" ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleActivityStatus(act.id)}
                            className={`h-7 px-2.5 text-[11px] cursor-pointer ${
                              act.status === "completed"
                                ? "text-muted-foreground hover:text-foreground"
                                : "bg-primary text-white"
                            }`}
                          >
                            {act.status === "completed" ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                Concluído
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Marcar Feito
                              </>
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground cursor-pointer">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => deleteActivity(act.id)}
                                className="text-destructive text-xs cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Excluir Registro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: PRODUTIVIDADE & GRÁFICOS */}
      {/* ========================================================================= */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Volume de Atividades por Consultor */}
            <Card className="p-5 border-border/80 shadow-xs">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-foreground">
                  Volume de Atividades por Consultor
                </h3>
                <p className="text-xs text-muted-foreground">
                  Comparativo de ligações, reuniões e fechamentos por vendedor.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="Ligações" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Reuniões" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Fechamentos" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Gráfico 2: Receita Faturada por Consultor */}
            <Card className="p-5 border-border/80 shadow-xs">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-foreground">
                  Faturamento Gerado por Consultor (R$)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Total de vendas convertidas no período selecionado.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `R$${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatBRL(Number(val)), "Receita"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="Receita" fill="#FF6B00" radius={[6, 6, 0, 0]}>
                      {barChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#FF6B00" : "#F97316"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Gráfico 3: Ritmo Operacional e Eficiência Comercial */}
          <Card className="p-5 border-border/80 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Eficiência e Conversão do Time
                </h3>
                <p className="text-xs text-muted-foreground">
                  Relação entre esforço comercial (contatos e reuniões) e contratos ganhos.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Média do Time: {Math.round(metrics.dealsWonCount / Math.max(1, metrics.meetingsCount) * 100)}% de Conversão
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {teamPerformance.map((tp) => (
                <div key={tp.member.id} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tp.member.avatar} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {tp.member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{tp.member.name}</p>
                      <p className="text-[10px] text-muted-foreground">Ticket Médio: {formatBRL(tp.avgTicket)}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Taxa Reunião → Fechamento</span>
                      <span className="font-bold text-emerald-600">{tp.conversionRate}%</span>
                    </div>
                    <Progress value={tp.conversionRate} className="h-1.5 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: CONTRATOS FECHADOS & CLIENTES ATIVOS */}
      {/* ========================================================================= */}
      {activeTab === "deals" && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden border-border/80 shadow-xs">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Base de Contratos Fechados</h3>
                <p className="text-xs text-muted-foreground">
                  Clientes e negócios convertidos com sucesso pela equipe comercial.
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                Total: {formatBRL(metrics.totalRevenue)}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Cliente / Empresa</th>
                    <th className="py-3 px-4">Contrato / Detalhe</th>
                    <th className="py-3 px-3 text-center">Consultor</th>
                    <th className="py-3 px-3 text-center">Data</th>
                    <th className="py-3 px-4 text-right">Valor do Contrato</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredActivities
                    .filter((a) => a.type === "deal_won")
                    .map((deal) => {
                      const member =
                        TEAM_MEMBERS.find((m) => m.id === deal.responsibleId) || TEAM_MEMBERS[0];

                      return (
                        <tr key={deal.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{deal.leadName}</div>
                            {deal.company && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3" />
                                {deal.company}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <p className="text-xs font-medium text-foreground">{deal.title}</p>
                            {deal.notes && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                                {deal.notes}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-[10px] bg-primary text-white">
                                  {member.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{member.name.split(" ")[0]}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center text-xs text-muted-foreground">
                            {deal.date}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-emerald-600 text-sm">
                            {formatBRL(deal.value || 0)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {deal.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openWhatsApp(deal.phone, deal.leadName)}
                                className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                Contato
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR ATIVIDADE COMERCIAL */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR AÇÃO RESUMIDA (SEM TEXTO/DESCRIÇÃO LONGA) */}
      {/* ========================================================================= */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Target className="h-4 w-4 text-primary" />
              Registrar Ação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Seletor Rápido de Tipo de Ação */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "call", label: "Ligação", icon: Phone, color: "text-blue-500", bg: "hover:bg-blue-500/10" },
                { id: "meeting", label: "Reunião", icon: Calendar, color: "text-amber-500", bg: "hover:bg-amber-500/10" },
                { id: "followup", label: "Follow-up", icon: RotateCcw, color: "text-purple-500", bg: "hover:bg-purple-500/10" },
                { id: "deal_won", label: "Fechamento", icon: Trophy, color: "text-emerald-500", bg: "hover:bg-emerald-500/10" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = formType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFormType(tab.id as ActivityType)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 font-bold shadow-xs scale-102"
                        : `border-border/60 ${tab.bg}`
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${tab.color}`} />
                    <span className="text-[11px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Lead / Cliente */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Lead / Cliente *</label>
              <Input
                value={formLeadName}
                onChange={(e) => setFormLeadName(e.target.value)}
                placeholder="Nome do lead ou empresa"
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            {/* Consultor Responsável */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Consultor</label>
              <Select value={formResponsibleId} onValueChange={setFormResponsibleId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Se Fechamento: Valor / Caso contrário: Status + Data */}
            {formType === "deal_won" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Valor do Contrato (R$)</label>
                <Input
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Ex: 15.000"
                  className="h-9 text-xs font-bold text-emerald-600"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ActivityStatus)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Data</label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActivityModalOpen(false)}
              className="cursor-pointer text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreateActivity}
              className="brand-gradient text-white font-medium cursor-pointer text-xs h-8"
            >
              + Salvar Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIGURAR METAS DA EQUIPE */}
      {/* ========================================================================= */}
      <Dialog open={isGoalsModalOpen} onOpenChange={setIsGoalsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Metas Comerciais da Equipe
            </DialogTitle>
            <DialogDescription>
              Defina as metas mensais de faturamento e volume de atividades para cada consultor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {TEAM_MEMBERS.map((member) => {
              const g = goals[member.id] || {
                monthlyRevenueTarget: 50000,
                callsTarget: 40,
                meetingsTarget: 20,
                followupsTarget: 30,
                dealsTarget: 4,
              };

              return (
                <div key={member.id} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Meta Receita (R$)
                      </label>
                      <Input
                        type="number"
                        value={g.monthlyRevenueTarget}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setGoals((prev) => ({
                            ...prev,
                            [member.id]: { ...g, monthlyRevenueTarget: val },
                          }));
                        }}
                        className="h-8 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Meta Calls
                      </label>
                      <Input
                        type="number"
                        value={g.callsTarget}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setGoals((prev) => ({
                            ...prev,
                            [member.id]: { ...g, callsTarget: val },
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Meta Reuniões
                      </label>
                      <Input
                        type="number"
                        value={g.meetingsTarget}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setGoals((prev) => ({
                            ...prev,
                            [member.id]: { ...g, meetingsTarget: val },
                          }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Meta Contratos
                      </label>
                      <Input
                        type="number"
                        value={g.dealsTarget}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setGoals((prev) => ({
                            ...prev,
                            [member.id]: { ...g, dealsTarget: val },
                          }));
                        }}
                        className="h-8 text-xs font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              size="sm"
              onClick={() => {
                setIsGoalsModalOpen(false);
                toast.success("Metas comerciais salvas com sucesso!");
              }}
              className="brand-gradient text-white font-medium cursor-pointer"
            >
              Salvar Metas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: DETALHES DO CONSULTOR */}
      {/* ========================================================================= */}
      {selectedUserForDetail && (
        <Dialog open={!!selectedUserForDetail} onOpenChange={() => setSelectedUserForDetail(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/40">
                  <AvatarImage src={selectedUserForDetail.avatar} />
                  <AvatarFallback className="bg-primary text-white font-bold">
                    {selectedUserForDetail.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>{selectedUserForDetail.name}</DialogTitle>
                  <DialogDescription>{selectedUserForDetail.role}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Atividades Registradas pelo Consultor
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-card p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px]">Ligações</span>
                    <span className="font-bold text-foreground">
                      {activities.filter((a) => a.responsibleId === selectedUserForDetail.id && a.type === "call").length}
                    </span>
                  </div>
                  <div className="bg-card p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px]">Reuniões</span>
                    <span className="font-bold text-foreground">
                      {activities.filter((a) => a.responsibleId === selectedUserForDetail.id && a.type === "meeting").length}
                    </span>
                  </div>
                  <div className="bg-card p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px]">Follow-ups</span>
                    <span className="font-bold text-foreground">
                      {activities.filter((a) => a.responsibleId === selectedUserForDetail.id && a.type === "followup").length}
                    </span>
                  </div>
                  <div className="bg-card p-2 rounded-lg border">
                    <span className="text-muted-foreground block text-[10px]">Fechamentos</span>
                    <span className="font-bold text-emerald-600">
                      {activities.filter((a) => a.responsibleId === selectedUserForDetail.id && a.type === "deal_won").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForDetail(null)}
                className="cursor-pointer"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

