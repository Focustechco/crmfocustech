import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  CalendarCheck,
  CheckSquare,
  Target,
  Plus,
  Search,
  Video,
  ExternalLink,
  Clock,
  FileAudio,
  Layers,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Trophy,
  Users,
  Building2,
  Phone,
  FileText,
  Calendar as CalendarIcon,
  Flag,
  ArrowRight,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Zap,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tarefas e Agenda · Focus CRM" }] }),
  component: TasksAndAgendaPage,
});

// ==========================================
// TIPAGENS RELACIONAIS
// ==========================================

export type MeetingType =
  | "diagnostico"
  | "proposta"
  | "fechamento"
  | "followup"
  | "1on1"
  | "alinhamento";

export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";

export interface MeetingItem {
  id: string;
  title: string;
  meetingType: MeetingType;
  scheduledStart: string; // ISO date-time string
  scheduledEnd: string;
  durationMinutes: number;
  meetLink: string;
  hostId: string;
  leadName?: string;
  companyName?: string;
  attendees: { name: string; role: string; email?: string }[];
  status: MeetingStatus;
  notes?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskCategory = "comercial" | "follow_up" | "contrato" | "operacional" | "tecnico";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface SubChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  leadName?: string;
  companyName?: string;
  dueAt?: string; // YYYY-MM-DD
  completedAt?: string;
  checklist: SubChecklistItem[];
  createdAt: string;
}

export type GoalMetricType = "revenue" | "deals_won" | "meetings_held" | "proposals_sent" | "activities";

export interface UserGoalItem {
  id: string;
  userId: string;
  periodMonth: number;
  periodYear: number;
  goalType: GoalMetricType;
  title: string;
  targetValue: number;
  currentValue: number;
  metricUnit: "BRL" | "unidades" | "reunioes" | "propostas" | "ligacoes";
  status: "active" | "achieved" | "missed";
  notes?: string;
}

// ==========================================
// DADOS INICIAIS RELACIONAIS (MOCKS REALISTAS)
// ==========================================

const STORAGE_MEETINGS_KEY = "focus_crm_meetings_relational";
const STORAGE_TASKS_KEY = "focus_crm_tasks_checklist_relational";
const STORAGE_GOALS_KEY = "focus_crm_user_goals_relational";

const getTodayString = (hourOffset = 0, minuteOffset = 0) => {
  const d = new Date();
  d.setHours(d.getHours() + hourOffset, d.getMinutes() + minuteOffset, 0, 0);
  return d.toISOString();
};

const getFutureDateString = (daysOffset: number, hours = 14, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: "meet-1",
    title: "Diagnóstico de Operação Comercial & CRM",
    meetingType: "diagnostico",
    scheduledStart: getTodayString(1, 0),
    scheduledEnd: getTodayString(1, 45),
    durationMinutes: 45,
    meetLink: "https://meet.google.com/xyz-abck-qwe",
    hostId: "user-1",
    leadName: "Carlos Eduardo Silva",
    companyName: "TechVanguard Soluções",
    attendees: [
      { name: "Felipe Focus", role: "Consultor Comercial", email: "felipe@focustech.co" },
      { name: "Carlos Eduardo", role: "CEO TechVanguard", email: "carlos@techvanguard.com.br" },
    ],
    status: "scheduled",
    notes: "Lead veio do inbound. Estão com 12 vendedores perdendo follow-up em planilhas.",
  },
  {
    id: "meet-2",
    title: "Apresentação de Proposta Focus Tech Enterprise",
    meetingType: "proposta",
    scheduledStart: getTodayString(3, 30),
    scheduledEnd: getTodayString(4, 30),
    durationMinutes: 60,
    meetLink: "https://meet.google.com/opq-rst-uvw",
    hostId: "user-2",
    leadName: "Mariana Alcantara",
    companyName: "Alcantara Logística & Transportes",
    attendees: [
      { name: "Adriano Gestor", role: "Executivo de Vendas", email: "adriano@focustech.co" },
      { name: "Mariana Alcantara", role: "Diretora de Operações", email: "mariana@alcantara.com.br" },
      { name: "Roberto Mendes", role: "Gerente de TI", email: "ti@alcantara.com.br" },
    ],
    status: "scheduled",
    notes: "Proposta customizada com módulo de Transcrição IA e Integração WhatsApp.",
  },
  {
    id: "meet-3",
    title: "Alinhamento Contratual & Fechamento de Ciclo",
    meetingType: "fechamento",
    scheduledStart: getFutureDateString(1, 10, 0),
    scheduledEnd: getFutureDateString(1, 10, 45),
    durationMinutes: 45,
    meetLink: "https://meet.google.com/def-ghij-klm",
    hostId: "user-1",
    leadName: "Rodrigo Mendonça",
    companyName: "Nova Era Consultoria",
    attendees: [
      { name: "Felipe Focus", role: "Account Executive", email: "felipe@focustech.co" },
      { name: "Rodrigo Mendonça", role: "Sócio-Diretor", email: "rodrigo@novaeraconsultoria.com" },
    ],
    status: "scheduled",
    notes: "Últimos ajustes de SLA e data de início de onboarding.",
  },
  {
    id: "meet-4",
    title: "1-on-1 Semanal: Metas & Pipeline Review",
    meetingType: "1on1",
    scheduledStart: getFutureDateString(2, 16, 0),
    scheduledEnd: getFutureDateString(2, 16, 30),
    durationMinutes: 30,
    meetLink: "https://meet.google.com/int-focus-1on1",
    hostId: "user-2",
    attendees: [
      { name: "Adriano Gestor", role: "Diretor Comercial", email: "adriano@focustech.co" },
      { name: "Larissa SDR", role: "SDR Pleno", email: "larissa@focustech.co" },
    ],
    status: "scheduled",
    notes: "Revisão de taxa de conversão do outbound e qualificação BANT.",
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Enviar proposta comercial customizada com SLA e modelo de implantação",
    description: "Revisar precificação com o time técnico antes de enviar em PDF e link interativo.",
    category: "comercial",
    priority: "urgent",
    status: "in_progress",
    assignedToId: "user-1",
    leadName: "Mariana Alcantara",
    companyName: "Alcantara Logística",
    dueAt: new Date().toISOString().split("T")[0],
    checklist: [
      { id: "sub-1", title: "Validar valores de setup com time de engenharia", done: true },
      { id: "sub-2", title: "Gerar PDF da proposta no Prospecção Hub", done: true },
      { id: "sub-3", title: "Enviar via WhatsApp com mensagem executiva", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Follow-up pós reunião de diagnóstico para coletar organograma",
    description: "Carlos solicitou envio de caso de sucesso no segmento dele.",
    category: "follow_up",
    priority: "high",
    status: "todo",
    assignedToId: "user-1",
    leadName: "Carlos Eduardo Silva",
    companyName: "TechVanguard Soluções",
    dueAt: new Date().toISOString().split("T")[0],
    checklist: [
      { id: "sub-4", title: "Selecionar case de sucesso em Tech/SaaS", done: false },
      { id: "sub-5", title: "Agendar apresentação de proposta", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Elaborar minuta de contrato e coletar dados cadastrais para assinatura",
    description: "Contrato padrão com cláusula de confidencialidade e SLA de 99.8%.",
    category: "contrato",
    priority: "medium",
    status: "todo",
    assignedToId: "user-2",
    leadName: "Rodrigo Mendonça",
    companyName: "Nova Era Consultoria",
    dueAt: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    checklist: [
      { id: "sub-6", title: "Preencher CNPJ e dados do representante legal", done: false },
      { id: "sub-7", title: "Subir no sistema de assinatura eletrônica", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Qualificar 25 leads do Outbound via Cadência de 7 Dias",
    description: "Executar cadência multicanal (LinkedIn + Ligação + WhatsApp).",
    category: "comercial",
    priority: "high",
    status: "in_progress",
    assignedToId: "user-4",
    dueAt: new Date().toISOString().split("T")[0],
    checklist: [
      { id: "sub-8", title: "10 abordagens LinkedIn com Script de Conexão", done: true },
      { id: "sub-9", title: "10 ligações com Script de Cold Call", done: true },
      { id: "sub-10", title: "5 mensagens de WhatsApp personalizadas", done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Configuração do ambiente de homologação e importação de contatos",
    description: "Realizar carga inicial de planilha de contatos sanitizada.",
    category: "tecnico",
    priority: "low",
    status: "done",
    assignedToId: "user-3",
    leadName: "Grupo Vanguarda",
    companyName: "Vanguarda Participações",
    dueAt: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    completedAt: new Date().toISOString(),
    checklist: [
      { id: "sub-11", title: "Validar formato das colunas do CSV", done: true },
      { id: "sub-12", title: "Executar script de importação", done: true },
    ],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_GOALS: UserGoalItem[] = [
  {
    id: "goal-1",
    userId: "user-1",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "revenue",
    title: "Faturamento em Novos Contratos",
    targetValue: 80000,
    currentValue: 62500,
    metricUnit: "BRL",
    status: "active",
    notes: "Foco em fechamento de contas Enterprise no Q3.",
  },
  {
    id: "goal-2",
    userId: "user-1",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "deals_won",
    title: "Contratos Fechados (Deals Won)",
    targetValue: 8,
    currentValue: 6,
    metricUnit: "unidades",
    status: "active",
    notes: "Ticket médio alvo: R$ 10.000/mês.",
  },
  {
    id: "goal-3",
    userId: "user-2",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "revenue",
    title: "Faturamento em Novos Contratos",
    targetValue: 120000,
    currentValue: 98000,
    metricUnit: "BRL",
    status: "active",
    notes: "Foco em expansão de contas e novos canais de parceria.",
  },
  {
    id: "goal-4",
    userId: "user-2",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "meetings_held",
    title: "Reuniões Estratégicas / Apresentações",
    targetValue: 25,
    currentValue: 22,
    metricUnit: "reunioes",
    status: "active",
    notes: "Reuniões de proposta e alinhamento de diretoria.",
  },
  {
    id: "goal-5",
    userId: "user-4",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "meetings_held",
    title: "Reuniões de Diagnóstico Agendadas",
    targetValue: 30,
    currentValue: 26,
    metricUnit: "reunioes",
    status: "active",
    notes: "Agendamentos qualificados via outbound e inbound.",
  },
  {
    id: "goal-6",
    userId: "user-4",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "activities",
    title: "Contatos e Abordagens Efetivas",
    targetValue: 400,
    currentValue: 345,
    metricUnit: "ligacoes",
    status: "active",
    notes: "Ligações + WhatsApp + LinkedIn abordados.",
  },
  {
    id: "goal-7",
    userId: "user-3",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    goalType: "revenue",
    title: "Faturamento em Novos Contratos",
    targetValue: 50000,
    currentValue: 53000,
    metricUnit: "BRL",
    status: "achieved",
    notes: "Meta batida com 10 dias de antecedência! 🏆",
  },
];

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function TasksAndAgendaPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("agenda");

  const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEETINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [goals, setGoals] = useState<UserGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GOALS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_MEETINGS_KEY, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  // Filtros
  const [meetingTimeFilter, setMeetingTimeFilter] = useState<"today" | "week" | "all">("today");
  const [meetingHostFilter, setMeetingHostFilter] = useState<string>("all");
  const [meetingSearch, setMeetingSearch] = useState<string>("");

  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "pending" | "done">("pending");
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState<string>("all");
  const [taskSearch, setTaskSearch] = useState<string>("");

  const [goalUserFilter, setGoalUserFilter] = useState<string>("all");

  // Modais
  const [openMeetingModal, setOpenMeetingModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openGoalModal, setOpenGoalModal] = useState(false);

  // Forms
  const [newMeetingForm, setNewMeetingForm] = useState({
    title: "",
    meetingType: "diagnostico" as MeetingType,
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    durationMinutes: 45,
    meetLink: "https://meet.google.com/new",
    hostId: TEAM_MEMBERS[0].id,
    leadName: "",
    companyName: "",
    notes: "",
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    category: "comercial" as TaskCategory,
    priority: "medium" as TaskPriority,
    assignedToId: TEAM_MEMBERS[0].id,
    leadName: "",
    companyName: "",
    dueAt: new Date().toISOString().split("T")[0],
    subtasksInput: "",
  });

  const [newGoalForm, setNewGoalForm] = useState({
    userId: TEAM_MEMBERS[0].id,
    goalType: "revenue" as GoalMetricType,
    title: "Meta Mensal de Faturamento",
    targetValue: 50000,
    currentValue: 0,
    metricUnit: "BRL" as const,
    notes: "",
  });

  const MEETING_TYPES_CONFIG: Record<
    MeetingType,
    { label: string; icon: any; color: string; badge: string }
  > = {
    diagnostico: {
      label: "Diagnóstico",
      icon: Search,
      color: "text-blue-500",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    proposta: {
      label: "Apresentação de Proposta",
      icon: FileText,
      color: "text-amber-500",
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    fechamento: {
      label: "Fechamento",
      icon: Trophy,
      color: "text-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    followup: {
      label: "Follow-up",
      icon: RotateCcw,
      color: "text-purple-500",
      badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    "1on1": {
      label: "1-on-1 Alinhamento",
      icon: Users,
      color: "text-indigo-500",
      badge: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    alinhamento: {
      label: "Alinhamento Interno",
      icon: Layers,
      color: "text-rose-500",
      badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    },
  };

  const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; badge: string; dotColor: string }
  > = {
    urgent: {
      label: "Urgente",
      badge: "bg-red-500/10 text-red-600 border-red-500/30 font-semibold animate-pulse",
      dotColor: "bg-red-500",
    },
    high: {
      label: "Alta",
      badge: "bg-orange-500/10 text-orange-600 border-orange-500/20 font-medium",
      dotColor: "bg-orange-500",
    },
    medium: {
      label: "Média",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      dotColor: "bg-blue-500",
    },
    low: {
      label: "Baixa",
      badge: "bg-slate-500/10 text-slate-600 border-slate-500/20",
      dotColor: "bg-slate-400",
    },
  };

  const CATEGORY_CONFIG: Record<TaskCategory, { label: string; badge: string }> = {
    comercial: { label: "Comercial", badge: "bg-emerald-500/10 text-emerald-700" },
    follow_up: { label: "Follow-up", badge: "bg-purple-500/10 text-purple-700" },
    contrato: { label: "Contratos", badge: "bg-amber-500/10 text-amber-700" },
    operacional: { label: "Operacional", badge: "bg-blue-500/10 text-blue-700" },
    tecnico: { label: "Técnico", badge: "bg-indigo-500/10 text-indigo-700" },
  };

  const filteredMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    return meetings.filter((m) => {
      const meetDate = m.scheduledStart.split("T")[0];
      if (meetingTimeFilter === "today" && meetDate !== today) return false;
      if (meetingTimeFilter === "week" && (meetDate < today || meetDate > sevenDays)) return false;
      if (meetingHostFilter !== "all" && m.hostId !== meetingHostFilter) return false;

      if (meetingSearch.trim()) {
        const query = meetingSearch.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(query);
        const matchLead = m.leadName?.toLowerCase().includes(query);
        const matchCompany = m.companyName?.toLowerCase().includes(query);
        if (!matchTitle && !matchLead && !matchCompany) return false;
      }
      return true;
    });
  }, [meetings, meetingTimeFilter, meetingHostFilter, meetingSearch]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskStatusFilter === "pending" && t.status === "done") return false;
      if (taskStatusFilter === "done" && t.status !== "done") return false;
      if (taskCategoryFilter !== "all" && t.category !== taskCategoryFilter) return false;
      if (taskPriorityFilter !== "all" && t.priority !== taskPriorityFilter) return false;
      if (taskAssigneeFilter !== "all" && t.assignedToId !== taskAssigneeFilter) return false;

      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchLead = t.leadName?.toLowerCase().includes(q);
        const matchCompany = t.companyName?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLead && !matchCompany) return false;
      }
      return true;
    });
  }, [tasks, taskStatusFilter, taskCategoryFilter, taskPriorityFilter, taskAssigneeFilter, taskSearch]);

  const globalStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayMeetings = meetings.filter((m) => m.scheduledStart.split("T")[0] === today);
    const pendingTasks = tasks.filter((t) => t.status !== "done");
    const overdueTasks = pendingTasks.filter((t) => t.dueAt && t.dueAt < today);

    const totalTarget = goals.reduce((acc, g) => acc + g.targetValue, 0);
    const totalCurrent = goals.reduce((acc, g) => acc + g.currentValue, 0);
    const avgGoalPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

    return {
      todayMeetingsCount: todayMeetings.length,
      pendingTasksCount: pendingTasks.length,
      overdueTasksCount: overdueTasks.length,
      avgGoalPct,
    };
  }, [meetings, tasks, goals]);

  // Handlers
  const handleCreateMeeting = () => {
    if (!newMeetingForm.title.trim()) {
      toast.error("Informe o título da reunião");
      return;
    }

    const startDateTime = new Date(`${newMeetingForm.date}T${newMeetingForm.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + newMeetingForm.durationMinutes * 60000);

    const generatedLink =
      newMeetingForm.meetLink.trim() ||
      `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random()
        .toString(36)
        .substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    const host = TEAM_MEMBERS.find((m) => m.id === newMeetingForm.hostId) || TEAM_MEMBERS[0];

    const newMeeting: MeetingItem = {
      id: `meet-${Date.now()}`,
      title: newMeetingForm.title,
      meetingType: newMeetingForm.meetingType,
      scheduledStart: startDateTime.toISOString(),
      scheduledEnd: endDateTime.toISOString(),
      durationMinutes: newMeetingForm.durationMinutes,
      meetLink: generatedLink,
      hostId: newMeetingForm.hostId,
      leadName: newMeetingForm.leadName.trim() || undefined,
      companyName: newMeetingForm.companyName.trim() || undefined,
      attendees: [
        { name: host.name, role: host.role, email: host.email },
        ...(newMeetingForm.leadName ? [{ name: newMeetingForm.leadName, role: "Decisor do Cliente" }] : []),
      ],
      status: "scheduled",
      notes: newMeetingForm.notes,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    toast.success("Reunião agendada com sucesso!");
    setOpenMeetingModal(false);
    setNewMeetingForm({
      title: "",
      meetingType: "diagnostico",
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      durationMinutes: 45,
      meetLink: "https://meet.google.com/new",
      hostId: TEAM_MEMBERS[0].id,
      leadName: "",
      companyName: "",
      notes: "",
    });
  };

  const handleToggleMeetingStatus = (id: string, newStatus: MeetingStatus) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    toast.success("Status da reunião atualizado!");
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast.success("Reunião removida!");
  };

  const handleCreateTask = () => {
    if (!newTaskForm.title.trim()) {
      toast.error("Informe o título da tarefa");
      return;
    }

    const subtasks: SubChecklistItem[] = newTaskForm.subtasksInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: line.replace(/^-\s*/, ""),
        done: false,
      }));

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description || undefined,
      category: newTaskForm.category,
      priority: newTaskForm.priority,
      status: "todo",
      assignedToId: newTaskForm.assignedToId,
      leadName: newTaskForm.leadName.trim() || undefined,
      companyName: newTaskForm.companyName.trim() || undefined,
      dueAt: newTaskForm.dueAt || undefined,
      checklist: subtasks,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success("Tarefa adicionada ao checklist!");
    setOpenTaskModal(false);
    setNewTaskForm({
      title: "",
      description: "",
      category: "comercial",
      priority: "medium",
      assignedToId: TEAM_MEMBERS[0].id,
      leadName: "",
      companyName: "",
      dueAt: new Date().toISOString().split("T")[0],
      subtasksInput: "",
    });
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === "done";
          const newStatus: TaskStatus = isDone ? "todo" : "done";
          const updatedChecklist = isDone
            ? t.checklist
            : t.checklist.map((sub) => ({ ...sub, done: true }));
          return {
            ...t,
            status: newStatus,
            completedAt: !isDone ? new Date().toISOString() : undefined,
            checklist: updatedChecklist,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedChecklist = t.checklist.map((sub) =>
            sub.id === subtaskId ? { ...sub, done: !sub.done } : sub
          );
          const allDone = updatedChecklist.length > 0 && updatedChecklist.every((s) => s.done);
          return {
            ...t,
            checklist: updatedChecklist,
            status: allDone ? "done" : t.status === "done" ? "in_progress" : t.status,
            completedAt: allDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tarefa removida!");
  };

  const handleCreateGoal = () => {
    if (!newGoalForm.title.trim() || newGoalForm.targetValue <= 0) {
      toast.error("Informe um título válido e o valor alvo");
      return;
    }

    const newGoal: UserGoalItem = {
      id: `goal-${Date.now()}`,
      userId: newGoalForm.userId,
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      goalType: newGoalForm.goalType,
      title: newGoalForm.title,
      targetValue: Number(newGoalForm.targetValue),
      currentValue: Number(newGoalForm.currentValue) || 0,
      metricUnit: newGoalForm.metricUnit,
      status: Number(newGoalForm.currentValue) >= Number(newGoalForm.targetValue) ? "achieved" : "active",
      notes: newGoalForm.notes,
    };

    setGoals((prev) => [newGoal, ...prev]);
    toast.success("Meta atribuída com sucesso!");
    setOpenGoalModal(false);
    setNewGoalForm({
      userId: TEAM_MEMBERS[0].id,
      goalType: "revenue",
      title: "Meta Mensal de Faturamento",
      targetValue: 50000,
      currentValue: 0,
      metricUnit: "BRL",
      notes: "",
    });
  };

  const handleIncrementGoal = (id: string, incrementBy: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newVal = Math.max(0, g.currentValue + incrementBy);
          const achieved = newVal >= g.targetValue;
          if (achieved && g.status !== "achieved") {
            toast.success(`🎉 Parabéns! Meta "${g.title}" batida!`);
          }
          return {
            ...g,
            currentValue: newVal,
            status: achieved ? "achieved" : "active",
          };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Meta removida!");
  };

  const getDueBadge = (dueAt?: string, isDone?: boolean) => {
    if (isDone) {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
          <Check className="h-3 w-3 mr-1" /> Concluída
        </Badge>
      );
    }
    if (!dueAt) return null;

    const today = new Date().toISOString().split("T")[0];
    if (dueAt < today) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs font-medium">
          <AlertCircle className="h-3 w-3 mr-1" /> Atrasada ({dueAt.split("-").reverse().join("/")})
        </Badge>
      );
    }
    if (dueAt === today) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-medium">
          <Clock className="h-3 w-3 mr-1" /> Vence Hoje
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
        <CalendarIcon className="h-3 w-3 mr-1" /> {dueAt.split("-").reverse().join("/")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Título e Ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Tarefas e Agenda
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão de compromissos com Google Meet, checklist de execução e metas individuais por membro da equipe.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setOpenMeetingModal(true)}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white shadow-xs h-8 sm:h-9 text-xs px-2 sm:px-3 font-medium cursor-pointer"
          >
            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 shrink-0" />
            <span>+ Reunião</span>
          </Button>
          <Button
            onClick={() => setOpenTaskModal(true)}
            variant="outline"
            className="border-border hover:bg-muted h-8 sm:h-9 text-xs px-2 sm:px-3 font-medium cursor-pointer"
          >
            <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-blue-500 shrink-0" />
            <span>+ Tarefa</span>
          </Button>
          <Button
            onClick={() => setOpenGoalModal(true)}
            variant="outline"
            className="border-border hover:bg-muted h-8 sm:h-9 text-xs px-2 sm:px-3 font-medium cursor-pointer"
          >
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-emerald-500 shrink-0" />
            <span>+ Meta</span>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500 bg-card shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reuniões de Hoje
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {globalStats.todayMeetingsCount}
              </span>
              <span className="text-xs text-muted-foreground">compromissos</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <CalendarDays className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500 bg-card shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Checklist Ativo
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {globalStats.pendingTasksCount}
              </span>
              <span className="text-xs text-muted-foreground">
                pendentes {globalStats.overdueTasksCount > 0 && `(${globalStats.overdueTasksCount} atrasadas)`}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <CheckSquare className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 bg-card shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Metas da Equipe (Mês)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {globalStats.avgGoalPct}%
              </span>
              <span className="text-xs text-muted-foreground">atingimento global</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
          <TabsList className="bg-muted/60 p-1 border">
            <TabsTrigger value="agenda" className="gap-2 data-[state=active]:bg-background">
              <CalendarDays className="h-4 w-4 text-[#FF6B00]" />
              <span>Agenda & Reuniões</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {meetings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2 data-[state=active]:bg-background">
              <CheckSquare className="h-4 w-4 text-blue-500" />
              <span>Checklist de Tarefas</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {tasks.filter((t) => t.status !== "done").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 data-[state=active]:bg-background">
              <Target className="h-4 w-4 text-emerald-500" />
              <span>Metas & OKRs</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {goals.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA 1: AGENDA */}
        <TabsContent value="agenda" className="space-y-4">
          <div className="flex flex-col gap-2 bg-muted/30 p-2.5 sm:p-3 rounded-lg border">
            {/* Linha 1: Busca + Filtro de Tempo */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por reunião, lead ou empresa..."
                  value={meetingSearch}
                  onChange={(e) => setMeetingSearch(e.target.value)}
                  className="pl-8 bg-background h-8 sm:h-9 text-xs"
                />
              </div>

              <div className="flex items-center bg-background rounded-md border p-0.5 shrink-0">
                <Button
                  size="sm"
                  variant={meetingTimeFilter === "today" ? "default" : "ghost"}
                  onClick={() => setMeetingTimeFilter("today")}
                  className={meetingTimeFilter === "today" ? "bg-[#FF6B00] text-white h-7 text-xs px-2 sm:px-2.5 cursor-pointer" : "h-7 text-xs px-2 sm:px-2.5 cursor-pointer"}
                >
                  Hoje
                </Button>
                <Button
                  size="sm"
                  variant={meetingTimeFilter === "week" ? "default" : "ghost"}
                  onClick={() => setMeetingTimeFilter("week")}
                  className={meetingTimeFilter === "week" ? "bg-[#FF6B00] text-white h-7 text-xs px-2 sm:px-2.5 cursor-pointer" : "h-7 text-xs px-2 sm:px-2.5 cursor-pointer"}
                >
                  7 Dias
                </Button>
                <Button
                  size="sm"
                  variant={meetingTimeFilter === "all" ? "default" : "ghost"}
                  onClick={() => setMeetingTimeFilter("all")}
                  className={meetingTimeFilter === "all" ? "bg-[#FF6B00] text-white h-7 text-xs px-2 sm:px-2.5 cursor-pointer" : "h-7 text-xs px-2 sm:px-2.5 cursor-pointer"}
                >
                  Todas
                </Button>
              </div>
            </div>

            {/* Linha 2: Responsável + Contador */}
            <div className="flex items-center justify-between gap-2">
              <Select value={meetingHostFilter} onValueChange={setMeetingHostFilter}>
                <SelectTrigger className="w-full sm:w-[220px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Responsáveis</SelectItem>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline-block">
                Mostrando <strong>{filteredMeetings.length}</strong> compromisso(s)
              </span>
            </div>
          </div>

          {filteredMeetings.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium">Nenhuma reunião encontrada para este filtro</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Agende novas chamadas e envie links do Google Meet diretamente para seus clientes e equipe.
              </p>
              <Button
                onClick={() => setOpenMeetingModal(true)}
                className="mt-4 bg-[#FF6B00] hover:bg-[#E65C00] text-white h-8 text-xs"
              >
                <Video className="h-3.5 w-3.5 mr-1" /> Agendar Primeira Reunião
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMeetings.map((meeting) => {
                const typeCfg = MEETING_TYPES_CONFIG[meeting.meetingType] || MEETING_TYPES_CONFIG.diagnostico;
                const TypeIcon = typeCfg.icon;
                const host = TEAM_MEMBERS.find((m) => m.id === meeting.hostId) || TEAM_MEMBERS[0];

                const startDate = new Date(meeting.scheduledStart);
                const timeStr = startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                const dateStr = startDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });

                return (
                  <Card
                    key={meeting.id}
                    className="p-4 md:p-5 border transition-all hover:shadow-md bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="h-14 w-14 rounded-xl bg-muted/80 border flex flex-col items-center justify-center shrink-0 text-center">
                        <span className="text-xs font-bold uppercase text-[#FF6B00]">
                          {dateStr.split(",")[0]}
                        </span>
                        <span className="text-sm font-bold text-foreground leading-tight">
                          {timeStr}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {meeting.durationMinutes}min
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 border ${typeCfg.badge}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeCfg.label}
                          </Badge>

                          {meeting.status === "completed" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                              <Check className="h-3 w-3 mr-1" /> Concluída
                            </Badge>
                          )}
                          {meeting.status === "in_progress" && (
                            <Badge className="bg-blue-500 text-white animate-pulse text-xs">
                              🔴 Em Andamento
                            </Badge>
                          )}
                          {meeting.status === "cancelled" && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                              Cancelada
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-foreground truncate">
                          {meeting.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {meeting.leadName && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Building2 className="h-3.5 w-3.5 text-[#FF6B00]" />
                              {meeting.companyName ? `${meeting.companyName} (${meeting.leadName})` : meeting.leadName}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={host.avatar} />
                              <AvatarFallback className="text-[9px]">{host.name[0]}</AvatarFallback>
                            </Avatar>
                            Host: {host.name}
                          </span>

                          {meeting.notes && (
                            <span className="italic text-muted-foreground/80 line-clamp-1 max-w-xs">
                              "{meeting.notes}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <a
                        href={meeting.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Entrar no Meet
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast.info("Abrindo módulo de Transcrição...");
                          navigate({ to: "/transcription" });
                        }}
                        className="h-8 text-xs border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                      >
                        <FileAudio className="h-3.5 w-3.5 mr-1 text-purple-500" />
                        Transcrever
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Olá! Segue o link da nossa reunião: ${meeting.title}\nHorário: ${dateStr} às ${timeStr}\nLink Google Meet: ${meeting.meetLink}`
                              );
                              toast.success("Convite copiado para o WhatsApp!");
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2 text-emerald-600" />
                            Copiar Convite (WhatsApp)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleMeetingStatus(meeting.id, "completed")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                            Marcar como Realizada
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleMeetingStatus(meeting.id, "cancelled")}
                          >
                            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                            Marcar como Cancelada
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Reunião
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ABA 2: CHECKLIST */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="flex flex-col gap-2 bg-muted/30 p-2.5 sm:p-3 rounded-lg border">
            {/* Linha 1: Busca + Filtro de Status */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefa ou subitem..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-8 bg-background h-8 sm:h-9 text-xs"
                />
              </div>

              <div className="flex items-center bg-background rounded-md border p-0.5 shrink-0">
                <Button
                  size="sm"
                  variant={taskStatusFilter === "pending" ? "default" : "ghost"}
                  onClick={() => setTaskStatusFilter("pending")}
                  className={taskStatusFilter === "pending" ? "bg-blue-600 text-white h-7 text-xs px-2 cursor-pointer" : "h-7 text-xs px-2 cursor-pointer"}
                >
                  Pendentes
                </Button>
                <Button
                  size="sm"
                  variant={taskStatusFilter === "done" ? "default" : "ghost"}
                  onClick={() => setTaskStatusFilter("done")}
                  className={taskStatusFilter === "done" ? "bg-emerald-600 text-white h-7 text-xs px-2 cursor-pointer" : "h-7 text-xs px-2 cursor-pointer"}
                >
                  Concluídas
                </Button>
                <Button
                  size="sm"
                  variant={taskStatusFilter === "all" ? "default" : "ghost"}
                  onClick={() => setTaskStatusFilter("all")}
                  className={taskStatusFilter === "all" ? "bg-[#FF6B00] text-white h-7 text-xs px-2 cursor-pointer" : "h-7 text-xs px-2 cursor-pointer"}
                >
                  Todas
                </Button>
              </div>
            </div>

            {/* Linha 2: 3 Seletores (Categoria, Prioridade, Responsável) + Contador */}
            <div className="flex items-center justify-between gap-2">
              <div className="grid grid-cols-3 gap-1.5 flex-1 min-w-0">
                <Select value={taskCategoryFilter} onValueChange={setTaskCategoryFilter}>
                  <SelectTrigger className="w-full h-8 text-xs bg-background px-2">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={taskPriorityFilter} onValueChange={setTaskPriorityFilter}>
                  <SelectTrigger className="w-full h-8 text-xs bg-background px-2">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Prioridades</SelectItem>
                    {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={taskAssigneeFilter} onValueChange={setTaskAssigneeFilter}>
                  <SelectTrigger className="w-full h-8 text-xs bg-background px-2">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Responsáveis</SelectItem>
                    {TEAM_MEMBERS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline-block">
                <strong>{filteredTasks.length}</strong> item(ns)
              </span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium">Nenhuma tarefa encontrada</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Organize todas as ações diárias, prazos e responsabilidades em formato de checklist prático.
              </p>
              <Button
                onClick={() => setOpenTaskModal(true)}
                className="mt-4 bg-[#FF6B00] hover:bg-[#E65C00] text-white h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Criar Primeira Tarefa
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const assignee = TEAM_MEMBERS.find((m) => m.id === task.assignedToId) || TEAM_MEMBERS[0];
                const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const categoryCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.comercial;
                const isDone = task.status === "done";

                const completedSubtasks = task.checklist.filter((s) => s.done).length;
                const totalSubtasks = task.checklist.length;
                const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

                return (
                  <Card
                    key={task.id}
                    className={`p-4 transition-all border ${
                      isDone ? "bg-muted/40 border-muted opacity-85" : "bg-card hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-muted-foreground/40 hover:border-[#FF6B00]"
                        }`}
                      >
                        {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              isDone ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>

                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryCfg.badge}`}>
                            {categoryCfg.label}
                          </Badge>

                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full mr-1 ${priorityCfg.dotColor}`} />
                            {priorityCfg.label}
                          </Badge>

                          {getDueBadge(task.dueAt, isDone)}
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}

                        {totalSubtasks > 0 && (
                          <div className="space-y-2 pt-1 border-t mt-2">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                              <span>Checklist de Etapas:</span>
                              <span>
                                {completedSubtasks} de {totalSubtasks} concluídos ({Math.round(subtaskProgress)}%)
                              </span>
                            </div>
                            <Progress value={subtaskProgress} className="h-1.5 bg-muted" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {task.checklist.map((sub) => (
                                <label
                                  key={sub.id}
                                  className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <Checkbox
                                    checked={sub.done}
                                    onCheckedChange={() => handleToggleSubtask(task.id, sub.id)}
                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                  />
                                  <span
                                    className={`truncate ${
                                      sub.done ? "line-through text-muted-foreground" : "text-foreground"
                                    }`}
                                  >
                                    {sub.title}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback className="text-[8px]">{assignee.name[0]}</AvatarFallback>
                              </Avatar>
                              {assignee.name}
                            </span>

                            {task.leadName && (
                              <span className="flex items-center gap-1 font-medium text-foreground">
                                <Building2 className="h-3 w-3 text-[#FF6B00]" />
                                {task.companyName ? `${task.companyName} (${task.leadName})` : task.leadName}
                              </span>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ABA 3: METAS */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-muted/30 p-2.5 sm:p-3 rounded-lg border">
            {/* Linha 1 no mobile: Seletor de Usuário + Badge Período */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Select value={goalUserFilter} onValueChange={setGoalUserFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-8 sm:h-9 text-xs bg-background">
                  <SelectValue placeholder="Filtrar por Usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda a Equipe</SelectItem>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="outline" className="bg-background text-[11px] py-1 px-2 shrink-0">
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </Badge>
            </div>

            {/* Linha 2 no mobile (ou inline no desktop): Botão de Ação */}
            <Button
              onClick={() => setOpenGoalModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 sm:h-9 text-xs shadow-xs shrink-0 cursor-pointer"
            >
              <Target className="h-3.5 w-3.5 mr-1" />
              <span>+ Meta</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_MEMBERS.filter((m) => goalUserFilter === "all" || m.id === goalUserFilter).map((member) => {
              const userGoals = goals.filter((g) => g.userId === member.id);
              if (userGoals.length === 0 && goalUserFilter !== "all") return null;

              const totalAchieved = userGoals.filter((g) => g.currentValue >= g.targetValue).length;

              return (
                <Card key={member.id} className="p-5 space-y-4 bg-card border shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          totalAchieved > 0
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {totalAchieved}/{userGoals.length} Batidas
                      </Badge>
                    </div>
                  </div>

                  {userGoals.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-md">
                      Nenhuma meta atribuída para este período.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userGoals.map((goal) => {
                        const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                        const isAchieved = goal.currentValue >= goal.targetValue;

                        return (
                          <div
                            key={goal.id}
                            className="p-3 rounded-lg border bg-background/50 space-y-2 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                                {goal.title}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {isAchieved ? (
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 font-bold">
                                    <Trophy className="h-3 w-3 mr-1" /> 100% Batida!
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 ${
                                      pct >= 70
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                        : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                    }`}
                                  >
                                    {pct}% Atingido
                                  </Badge>
                                )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleIncrementGoal(goal.id, goal.metricUnit === "BRL" ? 5000 : 1)}>
                                      <Plus className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                                      {goal.metricUnit === "BRL" ? "Adicionar +R$ 5.000" : "Adicionar +1"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleIncrementGoal(goal.id, goal.metricUnit === "BRL" ? -5000 : -1)}>
                                      <Trash2 className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                      {goal.metricUnit === "BRL" ? "Diminuir -R$ 5.000" : "Diminuir -1"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-red-600">
                                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                      Excluir Meta
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>Realizado:</span>
                                <span className="font-semibold text-foreground">
                                  {goal.metricUnit === "BRL"
                                    ? `${formatBRL(goal.currentValue)} / ${formatBRL(goal.targetValue)}`
                                    : `${goal.currentValue} / ${goal.targetValue} ${goal.metricUnit}`}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, pct)}
                                className={`h-2 ${isAchieved ? "[&>div]:bg-emerald-600" : pct >= 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-600"}`}
                              />
                            </div>

                            {goal.notes && (
                              <p className="text-[10px] text-muted-foreground italic">
                                Nota: {goal.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL REUNIÃO */}
      <Dialog open={openMeetingModal} onOpenChange={setOpenMeetingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-[#FF6B00]" />
              Agendar Nova Reunião
            </DialogTitle>
            <DialogDescription>
              Gere o link do Google Meet e associe ao Lead e Responsável da equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Título da Reunião *</label>
              <Input
                placeholder="Ex: Diagnóstico Comercial & Alinhamento de Escopo"
                value={newMeetingForm.title}
                onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Tipo de Reunião</label>
                <Select
                  value={newMeetingForm.meetingType}
                  onValueChange={(v) => setNewMeetingForm({ ...newMeetingForm, meetingType: v as MeetingType })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEETING_TYPES_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Duração</label>
                <Select
                  value={String(newMeetingForm.durationMinutes)}
                  onValueChange={(v) => setNewMeetingForm({ ...newMeetingForm, durationMinutes: Number(v) })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Data</label>
                <Input
                  type="date"
                  value={newMeetingForm.date}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Horário de Início</label>
                <Input
                  type="time"
                  value={newMeetingForm.time}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Lead / Decisor</label>
                <Input
                  placeholder="Ex: Carlos Eduardo"
                  value={newMeetingForm.leadName}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, leadName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Empresa</label>
                <Input
                  placeholder="Ex: TechVanguard"
                  value={newMeetingForm.companyName}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, companyName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Host (Responsável da Equipe)</label>
              <Select
                value={newMeetingForm.hostId}
                onValueChange={(v) => setNewMeetingForm({ ...newMeetingForm, hostId: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Link do Google Meet (Opcional)</label>
              <Input
                placeholder="https://meet.google.com/..."
                value={newMeetingForm.meetLink}
                onChange={(e) => setNewMeetingForm({ ...newMeetingForm, meetLink: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMeetingModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMeeting} className="bg-[#FF6B00] hover:bg-[#E65C00] text-white">
              Agendar Reunião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL TAREFA */}
      <Dialog open={openTaskModal} onOpenChange={setOpenTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              Adicionar Tarefa ao Checklist
            </DialogTitle>
            <DialogDescription>
              Crie uma tarefa executável com subetapas, responsável e data limite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Título da Tarefa *</label>
              <Input
                placeholder="Ex: Enviar proposta comercial e fazer alinhamento prévio"
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Categoria</label>
                <Select
                  value={newTaskForm.category}
                  onValueChange={(v) => setNewTaskForm({ ...newTaskForm, category: v as TaskCategory })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Prioridade</label>
                <Select
                  value={newTaskForm.priority}
                  onValueChange={(v) => setNewTaskForm({ ...newTaskForm, priority: v as TaskPriority })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Responsável</label>
                <Select
                  value={newTaskForm.assignedToId}
                  onValueChange={(v) => setNewTaskForm({ ...newTaskForm, assignedToId: v })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
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

              <div className="space-y-1">
                <label className="text-xs font-semibold">Prazo de Entrega</label>
                <Input
                  type="date"
                  value={newTaskForm.dueAt}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueAt: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Lead / Empresa Vinculada (Opcional)</label>
              <Input
                placeholder="Ex: Mariana Alcantara - Alcantara Log"
                value={newTaskForm.companyName}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, companyName: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Subitens do Checklist (1 por linha)</label>
              <Textarea
                placeholder={"Validar valores com a diretoria\nGerar PDF da proposta\nEnviar via WhatsApp"}
                value={newTaskForm.subtasksInput}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, subtasksInput: e.target.value })}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTaskModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700 text-white">
              Criar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL META */}
      <Dialog open={openGoalModal} onOpenChange={setOpenGoalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Atribuir Meta ao Membro da Equipe
            </DialogTitle>
            <DialogDescription>
              Defina targets de faturamento, reuniões ou contratos para o mês vigente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Membro da Equipe *</label>
              <Select
                value={newGoalForm.userId}
                onValueChange={(v) => setNewGoalForm({ ...newGoalForm, userId: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Tipo de Meta</label>
              <Select
                value={newGoalForm.goalType}
                onValueChange={(v) => {
                  const type = v as GoalMetricType;
                  let unit: any = "unidades";
                  let defaultTitle = "Meta de Desempenho";
                  if (type === "revenue") {
                    unit = "BRL";
                    defaultTitle = "Faturamento em Novos Contratos";
                  } else if (type === "meetings_held") {
                    unit = "reunioes";
                    defaultTitle = "Reuniões Realizadas";
                  } else if (type === "deals_won") {
                    unit = "unidades";
                    defaultTitle = "Contratos Fechados";
                  } else if (type === "activities") {
                    unit = "ligacoes";
                    defaultTitle = "Atividades e Abordagens";
                  }
                  setNewGoalForm({
                    ...newGoalForm,
                    goalType: type,
                    metricUnit: unit,
                    title: defaultTitle,
                  });
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Faturamento R$ (Receita)</SelectItem>
                  <SelectItem value="deals_won">Contratos Fechados (Deals Won)</SelectItem>
                  <SelectItem value="meetings_held">Reuniões Realizadas</SelectItem>
                  <SelectItem value="proposals_sent">Propostas Enviadas</SelectItem>
                  <SelectItem value="activities">Atividades / Abordagens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Título Descritivo da Meta</label>
              <Input
                value={newGoalForm.title}
                onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Valor Alvo (Target) *</label>
                <Input
                  type="number"
                  placeholder="Ex: 50000 ou 20"
                  value={newGoalForm.targetValue || ""}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, targetValue: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Valor Inicial Já Realizado</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newGoalForm.currentValue || ""}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, currentValue: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Notas / Foco Estratégico (Opcional)</label>
              <Input
                placeholder="Ex: Foco no segmento de Logística e Varejo"
                value={newGoalForm.notes}
                onChange={(e) => setNewGoalForm({ ...newGoalForm, notes: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenGoalModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGoal} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Salvar e Atribuir Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
