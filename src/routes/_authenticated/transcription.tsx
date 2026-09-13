import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  Sparkles,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  Trash2,
  MoreVertical,
  Flame,
  FileAudio,
  CheckSquare,
  Send,
  HelpCircle,
  FileText,
  Zap,
  ArrowRight,
  Filter,
  Layers,
  Award,
  BookOpen,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";

export const Route = createFileRoute("/_authenticated/transcription")({
  head: () => ({ meta: [{ title: "Transcrição IA · Focus CRM" }] }),
  component: TranscriptionPage,
});

// Tipos de Reunião
export type MeetingType = "diagnostico" | "proposta" | "fechamento" | "followup" | "parceria";
export type SentimentTemperature = "hot" | "warm" | "cold";

export interface Participant {
  name: string;
  role: string;
  side: "client" | "team";
}

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface ObjectionItem {
  topic: string;
  quote: string;
  counterArgument: string;
  resolved: boolean;
}

export interface StructuredMeeting {
  id: string;
  title: string;
  leadName: string;
  company: string;
  consultantId: string;
  meetingType: MeetingType;
  date: string;
  durationMinutes: number;
  sentiment: SentimentTemperature;
  fitScore: number;
  rawTranscript: string;
  summary: string[];
  participants: Participant[];
  actionItems: ActionItem[];
  objections: ObjectionItem[];
  typeSpecificData: {
    // Diagnóstico
    currentStack?: string[];
    mainPains?: string[];
    // Proposta
    valueDiscussed?: number;
    decisionDeadline?: string;
    // Fechamento
    onboardingDate?: string;
    slaAgreed?: string;
    // Follow-up
    resolvedPoints?: string[];
    // Parceria
    commissionModel?: string;
  };
  createdAt: string;
}

const STORAGE_KEY = "focus_crm_transcriptions_data";

// Transcrições iniciais ricas cobrindo as 5 categorias
const INITIAL_MEETINGS: StructuredMeeting[] = [
  {
    id: "meet-1",
    title: "Reunião de Diagnóstico Comercial & Mapeamento de Processos",
    leadName: "Carlos Eduardo Silva",
    company: "TechVanguard Soluções",
    consultantId: "user-1",
    meetingType: "diagnostico",
    date: new Date().toISOString().split("T")[0],
    durationMinutes: 42,
    sentiment: "hot",
    fitScore: 92,
    rawTranscript: `Ana Laura: Olá Carlos, obrigado pelo tempo. Me conta um pouco de como está estruturada a operação de vendas da TechVanguard hoje?
Carlos Eduardo: Hoje temos 12 vendedores e 3 SDRs. Nosso maior gargalo é que os vendedores esquecem de fazer follow-up e a gente perde muitos leads que já receberam proposta. Usamos planilhas no Excel e um CRM antigo que ninguém preenche.
Ana Laura: Entendi perfeitamente. E qual é a meta de crescimento de vocês para este semestre?
Carlos Eduardo: Queremos dobrar o faturamento, mas sem visibilidade do pipeline fica impossível prever receita. Precisamos de algo com Comercial OS e automação de WhatsApp urgente.
Ana Laura: Perfeito. Vamos preparar uma apresentação prática com simulação para seu time na quinta-feira.`,
    summary: [
      "Empresa possui equipe de 12 Closers e 3 SDRs operando atualmente com planilhas e CRM legado sem engajamento.",
      "Gargalo crítico identificado: falta de consistência em follow-ups após envio de propostas comerciais.",
      "Meta clara de dobrar faturamento no semestre com necessidade de previsão de receita (forecast).",
      "Forte interesse no módulo Comercial OS e integração nativa com WhatsApp.",
    ],
    participants: [
      { name: "Carlos Eduardo Silva", role: "Diretor Comercial", side: "client" },
      { name: "Mariana Pontes", role: "Coordenadora de Vendas", side: "client" },
      { name: "Ana Laura Lima", role: "Executiva de Contas", side: "team" },
    ],
    actionItems: [
      {
        id: "act-1",
        task: "Montar proposta personalizada com módulo Comercial OS para 15 licenças",
        assignedTo: "Ana Laura Lima",
        dueDate: "Quinta-feira, 14:00",
        completed: false,
      },
      {
        id: "act-2",
        task: "Enviar lista de campos customizados do CRM antigo para mapeamento de migração",
        assignedTo: "Mariana Pontes",
        dueDate: "Quarta-feira, 18:00",
        completed: true,
      },
    ],
    objections: [
      {
        topic: "Tempo de Migração",
        quote: "Temos receio da equipe demorar a se adaptar e parar as vendas durante a troca.",
        counterArgument: "Demonstrado que o onboarding leva apenas 48h com importação automática de planilhas sem interrupção.",
        resolved: true,
      },
    ],
    typeSpecificData: {
      currentStack: ["Excel", "Pipedrive Legado", "WhatsApp Pessoal"],
      mainPains: [
        "Falta de follow-up consistente",
        "Ausência de métricas individuais por consultor",
        "Perda de histórico de conversas com clientes",
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "meet-2",
    title: "Apresentação de Proposta Comercial & Demonstração Focus Pro",
    leadName: "Roberto Mendonça",
    company: "Alfa Logística & Fretes",
    consultantId: "user-2",
    meetingType: "proposta",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    durationMinutes: 50,
    sentiment: "warm",
    fitScore: 85,
    rawTranscript: `Fabio Sousa: Apresentamos o módulo de Prospecção e o Funil de Leads em tempo real. Como vocês viram, o SDR já transfere o lead qualificado com 1 clique.
Roberto Mendonça: Achei a interface excelente, muito mais limpa do que as ferramentas tradicionais. Quanto ao valor da proposta de R$ 3.800/mês, podemos negociar se fecharmos contrato anual?
Fabio Sousa: Para contrato anual conseguimos 15% de desconto com pagamento à vista ou parcelado no cartão corporativo.
Roberto Mendonça: Perfeito, vou levar para o comitê financeiro até segunda-feira.`,
    summary: [
      "Apresentação detalhada do fluxo SDR -> Closer com aprovação total da interface pelo cliente.",
      "Valores apresentados: Plano Enterprise para 20 usuários com valor base de R$ 3.800/mês.",
      "Cliente solicitou condição especial para contratação no plano anual com pagamento antecipado.",
      "Decisão final agendada para segunda-feira com o comitê diretivo.",
    ],
    participants: [
      { name: "Roberto Mendonça", role: "Sócio-Diretor", side: "client" },
      { name: "Fabio Sousa", role: "Consultor Comercial", side: "team" },
    ],
    actionItems: [
      {
        id: "act-3",
        task: "Enviar minuta da proposta anual com 15% de desconto e detalhamento de SLA",
        assignedTo: "Fabio Sousa",
        dueDate: "Sexta-feira, 11:00",
        completed: true,
      },
      {
        id: "act-4",
        task: "Follow-up de alinhamento com comitê financeiro",
        assignedTo: "Fabio Sousa",
        dueDate: "Segunda-feira, 10:00",
        completed: false,
      },
    ],
    objections: [
      {
        topic: "Condição de Pagamento",
        quote: "O valor mensal está um pouco acima do teto inicial do nosso trimestre.",
        counterArgument: "Apresentada economia de 15% no anual + isenção da taxa de setup de R$ 2.500.",
        resolved: true,
      },
    ],
    typeSpecificData: {
      valueDiscussed: 38760,
      decisionDeadline: "Próxima Segunda-feira (16/09)",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "meet-3",
    title: "Reunião de Fechamento & Alinhamento de Contrato",
    leadName: "Guilherme Santos",
    company: "OmniPay Brasil",
    consultantId: "user-2",
    meetingType: "fechamento",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    durationMinutes: 35,
    sentiment: "hot",
    fitScore: 98,
    rawTranscript: `Fabio Sousa: Guilherme, ajustamos as cláusulas de SLA de 99.9% e proteção LGPD conforme solicitado pelo seu jurídico.
Guilherme Santos: Perfeito Fabio, o jurídico deu o aval. Vamos assinar pelo Clicksign hoje à tarde. Podemos marcar o início do onboarding para próxima terça?
Fabio Sousa: Excelente! Já vou reservar a agenda do nosso especialista de implantação.`,
    summary: [
      "Jurídico do cliente validou todas as cláusulas de conformidade LGPD e SLA técnico.",
      "Contrato anual de R$ 42.000 fechado com sucesso.",
      "Início do processo de Onboarding e Treinamento agendado para próxima terça-feira às 14h.",
    ],
    participants: [
      { name: "Guilherme Santos", role: "VP de Operações", side: "client" },
      { name: "Letícia Ramos", role: "Advogada Corporativa", side: "client" },
      { name: "Fabio Sousa", role: "Consultor Comercial", side: "team" },
    ],
    actionItems: [
      {
        id: "act-5",
        task: "Disparar envelope para assinatura eletrônica via Clicksign",
        assignedTo: "Fabio Sousa",
        dueDate: "Hoje, 16:00",
        completed: true,
      },
      {
        id: "act-6",
        task: "Criar workspace da OmniPay no ambiente de produção e enviar convites de admin",
        assignedTo: "Equipe Técnica",
        dueDate: "Segunda-feira",
        completed: false,
      },
    ],
    objections: [],
    typeSpecificData: {
      onboardingDate: "Terça-feira, 14:00 (Kick-off)",
      slaAgreed: "99.9% de disponibilidade com suporte prioritário via WhatsApp 24/7",
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "meet-4",
    title: "Alinhamento de Parceria Estratégica & Modelo de Indicação",
    leadName: "Renata Vasconcelos",
    company: "Vanguard Contabilidade",
    consultantId: "user-4",
    meetingType: "parceria",
    date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    durationMinutes: 40,
    sentiment: "hot",
    fitScore: 90,
    rawTranscript: `Joana Cavalcanti: Renata, nossa proposta de canal oferece 20% de comissão recorrente para todas as empresas contábeis e clientes que você indicar.
Renata Vasconcelos: Achei excelente! Temos mais de 180 clientes B2B que precisam urgentemente organizar o comercial para emitir mais notas fiscais. Vamos fazer um webinar em conjunto no próximo mês.
Joana Cavalcanti: Perfeito, vamos disponibilizar o kit de co-marketing e links rastreáveis de indicação.`,
    summary: [
      "Acordo de parceria comercial fechado com modelo de comissionamento recorrente de 20%.",
      "Base de clientes potenciais da parceira: 180 empresas B2B ativas.",
      "Ação conjunta definida: Webinar exclusivo de gestão de vendas para clientes contábeis no próximo mês.",
    ],
    participants: [
      { name: "Renata Vasconcelos", role: "Sócia Fundadora", side: "client" },
      { name: "Joana Cavalcanti", role: "Gestora de Parcerias", side: "team" },
    ],
    actionItems: [
      {
        id: "act-7",
        task: "Enviar Kit de Co-marketing e Acordo de Parceria assinado",
        assignedTo: "Joana Cavalcanti",
        dueDate: "Amanhã, 12:00",
        completed: false,
      },
    ],
    objections: [],
    typeSpecificData: {
      commissionModel: "20% recorrente sobre mensalidades ativas indicadas",
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

function TranscriptionPage() {
  const [meetings, setMeetings] = useState<StructuredMeeting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEETINGS;
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    INITIAL_MEETINGS[0].id,
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal de Nova Transcrição
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLeadName, setFormLeadName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formConsultantId, setFormConsultantId] = useState(TEAM_MEMBERS[0].id);
  const [formMeetingType, setFormMeetingType] = useState<MeetingType>("diagnostico");
  const [formTranscript, setFormTranscript] = useState("");
  const [formDuration, setFormDuration] = useState("35");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    } catch {}
  }, [meetings]);

  // Reuniões Filtradas
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (typeFilter !== "all" && m.meetingType !== typeFilter) return false;
      if (consultantFilter !== "all" && m.consultantId !== consultantFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.leadName.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [meetings, typeFilter, consultantFilter, searchQuery]);

  // Reunião Ativa Selecionada
  const activeMeeting = useMemo(() => {
    return (
      meetings.find((m) => m.id === selectedMeetingId) ||
      filteredMeetings[0] ||
      meetings[0]
    );
  }, [meetings, selectedMeetingId, filteredMeetings]);

  const activeConsultant = useMemo(() => {
    if (!activeMeeting) return TEAM_MEMBERS[0];
    return (
      TEAM_MEMBERS.find((m) => m.id === activeMeeting.consultantId) ||
      TEAM_MEMBERS[0]
    );
  }, [activeMeeting]);

  // Configuração visual por Tipo de Reunião
  const typeConfig: Record<
    MeetingType,
    { label: string; icon: any; color: string; badgeColor: string }
  > = {
    diagnostico: {
      label: "Diagnóstico",
      icon: Search,
      color: "text-blue-500",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    proposta: {
      label: "Apresentação de Proposta",
      icon: FileText,
      color: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    fechamento: {
      label: "Fechamento",
      icon: Trophy,
      color: "text-emerald-500",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
    followup: {
      label: "Follow-up",
      icon: RotateCcw,
      color: "text-purple-500",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    parceria: {
      label: "Parceria / Canal",
      icon: Sparkles,
      color: "text-orange-500",
      badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
  };

  // Processar Transcrição com IA
  const handleProcessTranscript = () => {
    if (!formLeadName.trim() || !formTranscript.trim()) {
      return toast.error("Preencha o nome do lead e a transcrição da reunião.");
    }

    setIsProcessing(true);

    setTimeout(() => {
      const generatedTitle =
        formTitle.trim() ||
        `Reunião de ${typeConfig[formMeetingType].label} - ${formLeadName}`;

      // Extração automática inteligente simulada
      const newMeeting: StructuredMeeting = {
        id: `meet-${Date.now()}`,
        title: generatedTitle,
        leadName: formLeadName.trim(),
        company: formCompany.trim() || "Empresa do Lead",
        consultantId: formConsultantId,
        meetingType: formMeetingType,
        date: new Date().toISOString().split("T")[0],
        durationMinutes: Number(formDuration) || 30,
        sentiment: "hot",
        fitScore: 88,
        rawTranscript: formTranscript.trim(),
        summary: [
          `Reunião de ${typeConfig[formMeetingType].label} realizada com sucesso com o lead ${formLeadName}.`,
          "Mapeadas as principais prioridades e objetivos comerciais para o projeto.",
          "Alinhado cronograma de próximas ações com prazos definidos entre as partes.",
        ],
        participants: [
          { name: formLeadName.trim(), role: "Decisor / Responsável", side: "client" },
          {
            name:
              TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name ||
              "Consultor",
            role: "Consultor Comercial",
            side: "team",
          },
        ],
        actionItems: [
          {
            id: `act-${Date.now()}-1`,
            task: `Enviar documento de resumo da reunião de ${typeConfig[formMeetingType].label}`,
            assignedTo:
              TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name ||
              "Consultor",
            dueDate: "Amanhã, 14:00",
            completed: false,
          },
          {
            id: `act-${Date.now()}-2`,
            task: "Validar detalhes internos e agendar próximo passo no CRM",
            assignedTo:
              TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name ||
              "Consultor",
            dueDate: "Em 3 dias",
            completed: false,
          },
        ],
        objections: [
          {
            topic: "Alinhamento de Prazo",
            quote: "Gostaríamos de iniciar a operação o mais rápido possível.",
            counterArgument: "Garantido cronograma acelerado de implantação em até 3 dias úteis.",
            resolved: true,
          },
        ],
        typeSpecificData: {
          currentStack: ["WhatsApp", "Processos Manuais"],
          mainPains: ["Falta de centralização de dados", "Necessidade de automação"],
          valueDiscussed: formMeetingType === "proposta" || formMeetingType === "fechamento" ? 18000 : undefined,
          decisionDeadline: "Próximos 5 dias úteis",
        },
        createdAt: new Date().toISOString(),
      };

      setMeetings((prev) => [newMeeting, ...prev]);
      setSelectedMeetingId(newMeeting.id);
      setIsProcessing(false);
      setIsUploadModalOpen(false);

      // Reset form
      setFormTitle("");
      setFormLeadName("");
      setFormCompany("");
      setFormTranscript("");
      toast.success("✨ Reunião processada e estruturada com Inteligência Artificial!");
    }, 1200);
  };

  // Toggle Action Item
  const toggleActionItem = (actId: string) => {
    if (!activeMeeting) return;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id) {
          return {
            ...m,
            actionItems: m.actionItems.map((item) =>
              item.id === actId ? { ...item, completed: !item.completed } : item,
            ),
          };
        }
        return m;
      }),
    );
  };

  // Deletar Transcrição
  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast.success("Relatório de reunião excluído.");
  };

  // Copiar Resumo para WhatsApp
  const copySummaryForWhatsApp = () => {
    if (!activeMeeting) return;
    const text = `📋 *Resumo da Reunião - Focus Tech*\n` +
      `*Cliente:* ${activeMeeting.leadName} (${activeMeeting.company})\n` +
      `*Tipo:* ${typeConfig[activeMeeting.meetingType].label}\n` +
      `*Data:* ${activeMeeting.date}\n\n` +
      `📌 *Pontos Centrais:*\n` +
      activeMeeting.summary.map((s) => `• ${s}`).join("\n") +
      `\n\n✅ *Próximos Passos:*\n` +
      activeMeeting.actionItems.map((a) => `• [${a.assignedTo}] ${a.task} (${a.dueDate})`).join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Ata resumida copiada para o WhatsApp!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Desktop */}
      <div className="hidden md:flex md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Transcrição & Meeting Intelligence
              </h1>
              <p className="text-sm text-muted-foreground">
                Upload de chamadas, extração por IA e relatórios estruturados por modelo de reunião.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="brand-gradient text-white gap-2 font-medium shadow-sm hover:opacity-95 cursor-pointer text-xs h-9"
        >
          <Sparkles className="h-4 w-4 stroke-[2.5]" />
          + Processar Nova Reunião
        </Button>
      </div>

      {/* Mini-Cockpit / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reuniões Analisadas
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <FileAudio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{meetings.length}</span>
            <span className="text-xs text-muted-foreground">chamadas processadas</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Termômetro Médio
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">88.5%</span>
            <span className="text-xs text-muted-foreground">Fit ICP médio</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action Items Extraídos
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {meetings.reduce((acc, m) => acc + m.actionItems.length, 0)}
            </span>
            <span className="text-xs text-muted-foreground">tarefas delegadas</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tempo Médio
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">41</span>
            <span className="text-xs text-muted-foreground">minutos / call</span>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros por Categoria de Modelo */}
      <Card className="p-3 bg-card border-border/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "Todas as Reuniões" },
              { id: "diagnostico", label: "🔍 Diagnóstico" },
              { id: "proposta", label: "📑 Apresentação de Proposta" },
              { id: "fechamento", label: "🏆 Fechamento" },
              { id: "followup", label: "🔄 Follow-up" },
              { id: "parceria", label: "🤝 Parceria" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={typeFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(tab.id)}
                className={`text-xs h-8 cursor-pointer shrink-0 ${
                  typeFilter === tab.id ? "bg-primary text-white" : ""
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Select value={consultantFilter} onValueChange={setConsultantFilter}>
              <SelectTrigger className="h-8 text-xs w-[170px] bg-background">
                <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Todos os Consultores" />
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

            <Button
              onClick={() => setIsUploadModalOpen(true)}
              size="sm"
              className="md:hidden brand-gradient text-white h-8 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              + Transcrição
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid Principal: Lista de Chamadas à Esquerda + Dossiê Estruturado à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Lista de Reuniões */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por lead ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8.5 text-xs bg-card"
            />
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredMeetings.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <FileAudio className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs font-semibold">Nenhuma reunião encontrada</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Processe uma nova gravação ou transcrição.
                </p>
              </Card>
            ) : (
              filteredMeetings.map((m) => {
                const config = typeConfig[m.meetingType];
                const isSelected = activeMeeting?.id === m.id;
                const consultant =
                  TEAM_MEMBERS.find((u) => u.id === m.consultantId) ||
                  TEAM_MEMBERS[0];

                return (
                  <Card
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className={`p-3.5 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${config.badgeColor}`}>
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {m.durationMinutes} min
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-foreground line-clamp-1">
                      {m.title}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {m.company}
                      </span>
                      <span>{m.date}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={consultant.avatar} />
                          <AvatarFallback className="text-[8px]">
                            {consultant.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">
                          {consultant.name.split(" ")[0]}
                        </span>
                      </div>

                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[9px] font-bold">
                        Fit {m.fitScore}%
                      </Badge>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Dossiê Estruturado Completo da Reunião Selecionada */}
        <div className="lg:col-span-8">
          {activeMeeting ? (
            <Card className="p-6 bg-card border-border/80 shadow-md space-y-6">
              {/* Topo do Dossiê */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs font-semibold ${typeConfig[activeMeeting.meetingType].badgeColor}`}>
                      {typeConfig[activeMeeting.meetingType].label}
                    </Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                      🔥 Termômetro: Quente ({activeMeeting.fitScore}% Fit)
                    </Badge>
                  </div>

                  <h2 className="text-lg md:text-xl font-bold text-foreground">
                    {activeMeeting.title}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {activeMeeting.leadName} ({activeMeeting.company})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {activeMeeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {activeMeeting.durationMinutes} minutos de chamada
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySummaryForWhatsApp}
                    className="text-xs h-8 cursor-pointer gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Ata para WhatsApp
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteMeeting(activeMeeting.id)}
                        className="text-destructive text-xs cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Excluir Análise
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Seção 1: Resumo Executivo & Inteligência */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Resumo Executivo Estruturado
                </h3>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-2">
                  {activeMeeting.summary.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção Específica do Tipo de Reunião */}
              {activeMeeting.meetingType === "diagnostico" && activeMeeting.typeSpecificData.mainPains && (
                <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-2.5">
                  <h4 className="font-bold text-xs text-blue-600 uppercase tracking-wider">
                    🔍 Mapeamento Diagnóstico & Dores Críticas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px]">
                        Stack Atual do Lead:
                      </span>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {activeMeeting.typeSpecificData.currentStack?.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px]">
                        Principais Dores Identificadas:
                      </span>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                        {activeMeeting.typeSpecificData.mainPains.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "proposta" && activeMeeting.typeSpecificData.valueDiscussed && (
                <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-amber-600 uppercase tracking-wider">
                      📑 Alinhamento de Proposta
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prazo de Decisão: {activeMeeting.typeSpecificData.decisionDeadline}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase">Valor Discutido</span>
                    <p className="text-base font-bold text-emerald-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        activeMeeting.typeSpecificData.valueDiscussed,
                      )}
                    </p>
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "fechamento" && activeMeeting.typeSpecificData.onboardingDate && (
                <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-1">
                  <h4 className="font-bold text-xs text-emerald-600 uppercase tracking-wider">
                    🏆 Condições de Fechamento & SLA
                  </h4>
                  <p className="text-xs text-foreground font-semibold">
                    Início do Onboarding: {activeMeeting.typeSpecificData.onboardingDate}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SLA Acordado: {activeMeeting.typeSpecificData.slaAgreed}
                  </p>
                </div>
              )}

              {/* Seção 2: Quem Participou */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Quem Participou da Reunião
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeMeeting.participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border bg-muted/20 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                            {p.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-xs text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.role}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          p.side === "client" ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {p.side === "client" ? "Lado Cliente" : "Focus Tech"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 3: Funções & Tarefas Delegadas (Action Items) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    Funções & Tarefas Delegadas (Action Items)
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {activeMeeting.actionItems.filter((a) => a.completed).length}/
                    {activeMeeting.actionItems.length} concluídas
                  </Badge>
                </div>

                <div className="space-y-2">
                  {activeMeeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleActionItem(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        item.completed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground line-through"
                          : "bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border ${
                            item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border"
                          }`}
                        >
                          {item.completed && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{item.task}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[9px]">
                          {item.assignedTo}
                        </Badge>
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 4: Matriz de Objeções Levantadas */}
              {activeMeeting.objections.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Objeções Levantadas & Contornos
                  </h3>
                  <div className="space-y-2.5">
                    {activeMeeting.objections.map((obj, idx) => (
                      <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{obj.topic}</span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px]">
                            Resolvida na Call
                          </Badge>
                        </div>
                        <p className="text-muted-foreground italic">"{obj.quote}"</p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                          ✓ Resposta dada: {obj.counterArgument}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-16 text-center border-dashed">
              <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-bold text-base">Nenhuma reunião selecionada</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione uma chamada na coluna lateral ou faça o upload de uma nova transcrição.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PROCESSAR NOVA TRANSCRIÇÃO DE REUNIÃO */}
      {/* ========================================================================= */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Processar Transcrição com IA
            </DialogTitle>
            <DialogDescription>
              Cole a transcrição da sua reunião (Google Meet, Zoom, Teams ou WhatsApp) e escolha o modelo desejado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Seletor de Modelo de Reunião */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tipo do Modelo & Estrutura do Relatório *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { id: "diagnostico", label: "Diagnóstico", icon: Search },
                  { id: "proposta", label: "Proposta", icon: FileText },
                  { id: "fechamento", label: "Fechamento", icon: Trophy },
                  { id: "followup", label: "Follow-up", icon: RotateCcw },
                  { id: "parceria", label: "Parceria", icon: Sparkles },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormMeetingType(item.id as MeetingType)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      formMeetingType === item.id
                        ? "border-primary bg-primary/10 font-bold shadow-xs text-primary"
                        : "border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dados do Lead e Consultor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nome do Lead / Cliente *</label>
                <Input
                  value={formLeadName}
                  onChange={(e) => setFormLeadName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Empresa</label>
                <Input
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="Ex: TechVanguard"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Consultor Responsável</label>
                <Select value={formConsultantId} onValueChange={setFormConsultantId}>
                  <SelectTrigger className="h-9 text-xs">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Duração da Reunião (min)</label>
                <Input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="35"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Transcrição Bruta */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Cole a Transcrição da Reunião *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormTranscript(
                      `Vendedor: Olá! Como está o processo de vendas da empresa hoje?\nCliente: Temos 10 vendedores e nosso maior problema é o esquecimento de follow-up.\nVendedor: Nosso CRM resolve isso com automação de WhatsApp e Comercial OS.\nCliente: Perfeito, me manda a proposta até sexta-feira.`,
                    )
                  }
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  Inserir Exemplo Rápido
                </button>
              </div>
              <Textarea
                value={formTranscript}
                onChange={(e) => setFormTranscript(e.target.value)}
                placeholder="Cole aqui o texto exportado do Google Meet, Zoom, Whisper ou Teams..."
                rows={6}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handleProcessTranscript}
              className="brand-gradient text-white font-medium cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Processar e Estruturar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}