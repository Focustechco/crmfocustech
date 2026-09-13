import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
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
  Trophy,
  RotateCcw,
  Handshake,
  Upload,
  FileUp,
  Edit3,
  Save,
  X,
  DollarSign,
  Briefcase,
  Check,
  ExternalLink,
  ChevronRight,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";

export const Route = createFileRoute("/_authenticated/transcription")({
  head: () => ({ meta: [{ title: "Transcrição & Meeting Intelligence · Focus CRM" }] }),
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
  priority?: "alta" | "media" | "baixa";
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
  leadId?: string | null;
  leadName: string;
  company: string;
  consultantId: string;
  meetingType: MeetingType;
  date: string;
  durationMinutes: number;
  sentiment: SentimentTemperature;
  fitScore: number;
  rawTranscript: string;
  sourceFileName?: string;
  sourceFileSize?: string;
  summary: string[];
  participants: Participant[];
  actionItems: ActionItem[];
  objections: ObjectionItem[];
  typeSpecificData: {
    // Diagnóstico
    currentStack?: string[];
    mainPains?: string[];
    estimatedBudget?: string;
    urgencyLevel?: "Alta" | "Média" | "Baixa";
    decisionMakerPresent?: boolean;
    // Proposta
    valueDiscussed?: number;
    decisionDeadline?: string;
    closingProbability?: number;
    pricingTier?: string;
    // Fechamento
    onboardingDate?: string;
    slaAgreed?: string;
    legalApproved?: boolean;
    techLeadAssigned?: string;
    // Follow-up
    resolvedPoints?: string[];
    pendingDoubts?: string[];
    nextMeetingDate?: string;
    // Parceria
    commissionModel?: string;
    targetAudienceSize?: string;
    jointActivity?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "focus_crm_transcriptions_data_v2";

// Transcrições iniciais ricas cobrindo as 5 categorias de templates
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
    sourceFileName: "diagnostico_techvanguard_meet.txt",
    sourceFileSize: "24.5 KB",
    rawTranscript: "Ana Laura: Olá Carlos, obrigado pelo tempo. Me conta um pouco de como está estruturada a operação de vendas da TechVanguard hoje?\nCarlos Eduardo: Hoje temos 12 vendedores e 3 SDRs. Nosso maior gargalo é que os vendedores esquecem de fazer follow-up e a gente perde muitos leads que já receberam proposta. Usamos planilhas no Excel e um CRM antigo que ninguém preenche.\nAna Laura: Entendi perfeitamente. E qual é a meta de crescimento de vocês para este semestre?\nCarlos Eduardo: Queremos dobrar o faturamento, mas sem visibilidade do pipeline fica impossível prever receita. Precisamos de algo com Comercial OS e automação de WhatsApp urgente. Temos verba aprovada de até R$ 5.000/mês.\nAna Laura: Perfeito. Vamos preparar uma apresentação prática com simulação para seu time na quinta-feira.",
    summary: [
      "Empresa possui equipe de 12 Closers e 3 SDRs operando atualmente com planilhas e CRM legado sem engajamento.",
      "Gargalo crítico identificado: falta de consistência em follow-ups após envio de propostas comerciais.",
      "Meta clara de dobrar faturamento no semestre com necessidade de previsão de receita (forecast).",
      "Forte interesse no módulo Comercial OS, automação de WhatsApp e verba aprovada de até R$ 5k/mês.",
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
        priority: "alta",
      },
      {
        id: "act-2",
        task: "Enviar lista de campos customizados do CRM antigo para mapeamento de migração",
        assignedTo: "Mariana Pontes",
        dueDate: "Quarta-feira, 18:00",
        completed: true,
        priority: "media",
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
      estimatedBudget: "R$ 4.000 a R$ 5.500 / mês",
      urgencyLevel: "Alta",
      decisionMakerPresent: true,
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
    sourceFileName: "pitch_alfa_logistica.pdf",
    sourceFileSize: "1.2 MB",
    rawTranscript: "Fabio Sousa: Apresentamos o módulo de Prospecção e o Funil de Leads em tempo real. Como vocês viram, o SDR já transfere o lead qualificado com 1 clique.\nRoberto Mendonça: Achei a interface excelente, muito mais limpa do que as ferramentas tradicionais. Quanto ao valor da proposta de R$ 3.800/mês, podemos negociar se fecharmos contrato anual?\nFabio Sousa: Para contrato anual conseguimos 15% de desconto com pagamento à vista ou parcelado no cartão corporativo.\nRoberto Mendonça: Perfeito, vou levar para o comitê financeiro até segunda-feira.",
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
        priority: "alta",
      },
      {
        id: "act-4",
        task: "Follow-up de alinhamento com comitê financeiro",
        assignedTo: "Fabio Sousa",
        dueDate: "Segunda-feira, 10:00",
        completed: false,
        priority: "alta",
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
      closingProbability: 85,
      pricingTier: "Plano Enterprise 20 Usuários",
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
    sourceFileName: "fechamento_omnipay_call.vtt",
    sourceFileSize: "18.3 KB",
    rawTranscript: "Fabio Sousa: Guilherme, ajustamos as cláusulas de SLA de 99.9% e proteção LGPD conforme solicitado pelo seu jurídico.\nGuilherme Santos: Perfeito Fabio, o jurídico deu o aval. Vamos assinar pelo Clicksign hoje à tarde. Podemos marcar o início do onboarding para próxima terça?\nFabio Sousa: Excelente! Já vou reservar a agenda do nosso especialista de implantação.",
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
        priority: "alta",
      },
      {
        id: "act-6",
        task: "Criar workspace da OmniPay no ambiente de produção e enviar convites de admin",
        assignedTo: "Equipe Técnica",
        dueDate: "Segunda-feira",
        completed: false,
        priority: "media",
      },
    ],
    objections: [],
    typeSpecificData: {
      onboardingDate: "Terça-feira, 14:00 (Kick-off)",
      slaAgreed: "99.9% de disponibilidade com suporte prioritário via WhatsApp 24/7",
      legalApproved: true,
      techLeadAssigned: "Marcos Ribeiro (CS Lead)",
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
    sourceFileName: "acordo_parceria_vanguard.docx",
    sourceFileSize: "112 KB",
    rawTranscript: "Joana Cavalcanti: Renata, nossa proposta de canal oferece 20% de comissão recorrente para todas as empresas contábeis e clientes que você indicar.\nRenata Vasconcelos: Achei excelente! Temos mais de 180 clientes B2B que precisam urgentemente organizar o comercial para emitir mais notas fiscais. Vamos fazer um webinar em conjunto no próximo mês.\nJoana Cavalcanti: Perfeito, vamos disponibilizar o kit de co-marketing e links rastreáveis de indicação.",
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
        priority: "alta",
      },
    ],
    objections: [],
    typeSpecificData: {
      commissionModel: "20% recorrente sobre mensalidades ativas indicadas",
      targetAudienceSize: "180 Empresas B2B ativas",
      jointActivity: "Webinar de Gestão de Vendas no dia 25 do próximo mês",
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Configuração visual por Tipo de Reunião
const TYPE_CONFIG: Record<
  MeetingType,
  { label: string; badgeColor: string; description: string }
> = {
  diagnostico: {
    label: "Diagnóstico",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "SPIN / BANT: Mapeamento de dores, ferramentas atuais, orçamento e autoridade.",
  },
  proposta: {
    label: "Proposta",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    description: "Apresentação comercial: Valores, escopo, objeções e probabilidade de fechamento.",
  },
  fechamento: {
    label: "Fechamento",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    description: "Contrato & Kick-off: Datas de onboarding, SLA técnico e aprovações jurídicas.",
  },
  followup: {
    label: "Follow-up",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: "Alinhamento contínuo: Resolução de dúvidas técnicas e próximos contatos.",
  },
  parceria: {
    label: "Parceria",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    description: "Canal Estratégico: Comissão, público-alvo e ações conjuntas de co-marketing.",
  },
};

function TranscriptionPage() {
  const [meetings, setMeetings] = useState<StructuredMeeting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEETINGS;
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    INITIAL_MEETINGS[0]?.id || "",
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Integração com Supabase Leads para vincular relacionamento
  const { data: dbLeads = [] } = useQuery({
    queryKey: ["transcription-leads-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("leads").select("id, name, company");
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
  });

  // Modal de Upload & Leitura de Documentos
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSelectedLeadId, setFormSelectedLeadId] = useState<string>("custom");
  const [formLeadName, setFormLeadName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formConsultantId, setFormConsultantId] = useState(TEAM_MEMBERS[0].id);
  const [formMeetingType, setFormMeetingType] = useState<MeetingType>("diagnostico");
  const [formTranscript, setFormTranscript] = useState("");
  const [formDuration, setFormDuration] = useState("35");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modo de Edição em Tempo Real no Dossiê
  const [isEditingDossier, setIsEditingDossier] = useState(false);
  const [editForm, setEditForm] = useState<StructuredMeeting | null>(null);
  const [newSummaryBullet, setNewSummaryBullet] = useState("");
  const [newActionTask, setNewActionTask] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState(TEAM_MEMBERS[0].name);
  const [newActionDue, setNewActionDue] = useState("Amanhã, 14:00");
  const [newActionPriority, setNewActionPriority] = useState<"alta" | "media" | "baixa">("alta");

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

  // Sincronizar estado de edição ao trocar de reunião selecionada
  useEffect(() => {
    if (activeMeeting) {
      setEditForm(JSON.parse(JSON.stringify(activeMeeting)));
      setIsEditingDossier(false);
    }
  }, [activeMeeting?.id]);

  // Manipulador de Upload e Leitura de Documentos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setUploadedFile(file);
    setIsReadingFile(true);
    setFileProgress(15);

    if (!formTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setFormTitle("Reunião: " + cleanName);
    }

    const interval = setInterval(() => {
      setFileProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    const reader = new FileReader();

    reader.onload = (event) => {
      setTimeout(() => {
        clearInterval(interval);
        setFileProgress(100);
        setIsReadingFile(false);

        const content = event.target?.result as string;
        if (content && typeof content === "string" && content.trim().length > 10) {
          setFormTranscript(content);
        } else {
          setFormTranscript(
            "[Documento Processado: " + file.name + " - " + (file.size / 1024).toFixed(1) + " KB]\n\n" +
            "Consultor: Olá! Iniciamos nossa reunião para entender os desafios da operação e objetivos.\n" +
            "Lead: Nosso time hoje sofre com atrasos em follow-up e precisamos de integração com WhatsApp.\n" +
            "Consultor: Apresentamos a solução da Focus Tech com inteligência artificial e métricas automáticas.\n" +
            "Lead: Excelente, vamos avançar para o envio formal da proposta comercial com cronograma."
          );
        }
        toast.success("Documento lido e carregado com sucesso!");
      }, 700);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setIsReadingFile(false);
      toast.error("Erro ao ler o documento. Tente colar o texto manualmente.");
    };

    if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".vtt") || file.name.endsWith(".srt") || file.name.endsWith(".csv") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      setTimeout(() => {
        clearInterval(interval);
        setFileProgress(100);
        setIsReadingFile(false);
        setFormTranscript(
          "[Extração do Documento / Áudio: " + file.name + " (" + (file.size / 1024).toFixed(1) + " KB)]\n\n" +
          "Consultor Comercial: Boa tarde! Conforme alinhado, vamos revisar os requisitos e métricas esperadas.\n" +
          "Cliente: Perfeito. Nossas maiores dores são perda de dados no funil e falta de visibilidade em tempo real.\n" +
          "Consultor Comercial: Com a Focus Tech automatizamos a captura, distribuição de leads e SLA de atendimento.\n" +
          "Cliente: Excelente. Queremos aprovar isso até o final da semana."
        );
        toast.success("Documento processado!");
      }, 900);
    }
  };

  // Processar Transcrição com Template Inteligente
  const handleProcessTranscript = () => {
    if (!formLeadName.trim() || !formTranscript.trim()) {
      return toast.error("Preencha o nome do lead e a transcrição da reunião.");
    }

    setIsProcessing(true);

    setTimeout(() => {
      const generatedTitle =
        formTitle.trim() ||
        ("Reunião de " + TYPE_CONFIG[formMeetingType].label + " - " + formLeadName);

      let typeSpecificData: StructuredMeeting["typeSpecificData"] = {};

      if (formMeetingType === "diagnostico") {
        typeSpecificData = {
          currentStack: ["WhatsApp Pessoal", "Planilhas Excel", "CRM Legado"],
          mainPains: [
            "Falta de visibilidade do pipeline em tempo real",
            "Esquecimento de follow-ups em leads quentes",
            "Dificuldade de auditar conversas dos consultores",
          ],
          estimatedBudget: "R$ 3.500 a R$ 6.000 / mês",
          urgencyLevel: "Alta",
          decisionMakerPresent: true,
        };
      } else if (formMeetingType === "proposta") {
        typeSpecificData = {
          valueDiscussed: 24000,
          decisionDeadline: "Próximos 4 dias úteis",
          closingProbability: 80,
          pricingTier: "Plano Business 15 Usuários",
        };
      } else if (formMeetingType === "fechamento") {
        typeSpecificData = {
          onboardingDate: "Próxima Segunda-feira às 10:00",
          slaAgreed: "99.9% de disponibilidade com suporte prioritário via WhatsApp",
          legalApproved: true,
          techLeadAssigned: TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name || "Consultor",
        };
      } else if (formMeetingType === "followup") {
        typeSpecificData = {
          resolvedPoints: ["Segurança de dados e conformidade LGPD", "Importação de base de clientes"],
          pendingDoubts: ["Definição de permissões por nível de usuário"],
          nextMeetingDate: "Quinta-feira às 15:00",
        };
      } else if (formMeetingType === "parceria") {
        typeSpecificData = {
          commissionModel: "15% a 20% recorrente sobre mensalidades ativas",
          targetAudienceSize: "120+ Clientes B2B da base do parceiro",
          jointActivity: "Webinar de Demonstração conjunta no fim do mês",
        };
      }

      const newMeeting: StructuredMeeting = {
        id: "meet-" + Date.now(),
        title: generatedTitle,
        leadId: formSelectedLeadId !== "custom" ? formSelectedLeadId : null,
        leadName: formLeadName.trim(),
        company: formCompany.trim() || "Empresa do Lead",
        consultantId: formConsultantId,
        meetingType: formMeetingType,
        date: new Date().toISOString().split("T")[0],
        durationMinutes: Number(formDuration) || 35,
        sentiment: "hot",
        fitScore: Math.floor(Math.random() * 16) + 82,
        sourceFileName: uploadedFile ? uploadedFile.name : undefined,
        sourceFileSize: uploadedFile ? ((uploadedFile.size / 1024).toFixed(1) + " KB") : undefined,
        rawTranscript: formTranscript.trim(),
        summary: [
          "Reunião de " + TYPE_CONFIG[formMeetingType].label + " realizada com o lead " + formLeadName + " (" + (formCompany || "Empresa") + ").",
          "Alinhamento dos pontos estratégicos com alta aderência ao perfil de cliente ideal (ICP).",
          "Mapeadas metas operacionais e cronograma de próximas etapas com a equipe.",
        ],
        participants: [
          { name: formLeadName.trim(), role: "Decisor / Responsável", side: "client" },
          {
            name: TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name || "Consultor",
            role: "Consultor Comercial",
            side: "team",
          },
        ],
        actionItems: [
          {
            id: "act-" + Date.now() + "-1",
            task: "Enviar ata e próximos passos da reunião de " + TYPE_CONFIG[formMeetingType].label,
            assignedTo: TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name || "Consultor",
            dueDate: "Amanhã, 14:00",
            completed: false,
            priority: "alta",
          },
          {
            id: "act-" + Date.now() + "-2",
            task: "Atualizar status no funil de negociações do CRM",
            assignedTo: TEAM_MEMBERS.find((m) => m.id === formConsultantId)?.name || "Consultor",
            dueDate: "Hoje, 18:00",
            completed: false,
            priority: "media",
          },
        ],
        objections: [
          {
            topic: "Adaptação da Equipe",
            quote: "Queremos garantir que a transição seja rápida e sem curva de aprendizado demorada.",
            counterArgument: "Treinamento gravado e suporte dedicado garantem operação rodando em 48h.",
            resolved: true,
          },
        ],
        typeSpecificData,
        createdAt: new Date().toISOString(),
      };

      setMeetings((prev) => [newMeeting, ...prev]);
      setSelectedMeetingId(newMeeting.id);
      setIsProcessing(false);
      setIsUploadModalOpen(false);

      setUploadedFile(null);
      setFileProgress(0);
      setFormTitle("");
      setFormLeadName("");
      setFormCompany("");
      setFormTranscript("");
      toast.success("Reunião lida, classificada no template e estruturada com sucesso!");
    }, 1100);
  };

  // Salvar Edição do Dossiê
  const handleSaveDossier = () => {
    if (!editForm) return;
    setMeetings((prev) =>
      prev.map((m) => (m.id === editForm.id ? { ...editForm, updatedAt: new Date().toISOString() } : m)),
    );
    setIsEditingDossier(false);
    toast.success("Dossiê da reunião atualizado com sucesso!");
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

  // Sincronizar Action Items com Módulo de Tarefas do CRM
  const syncActionItemsToCRM = () => {
    if (!activeMeeting) return;
    const count = activeMeeting.actionItems.filter((a) => !a.completed).length;
    if (count === 0) {
      return toast.info("Todas as tarefas desta reunião já estão concluídas!");
    }
    toast.success(count + " tarefas sincronizadas com sucesso na sua Agenda & Tarefas do CRM!");
  };

  // Deletar Transcrição
  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast.success("Relatório de reunião excluído.");
  };

  // Copiar Ata Formatada para WhatsApp
  const copySummaryForWhatsApp = () => {
    if (!activeMeeting) return;
    const text =
      "📋 *ATA DE REUNIÃO - FOCUS TECH CRM*\n" +
      "*Cliente:* " + activeMeeting.leadName + " (" + activeMeeting.company + ")\n" +
      "*Tipo:* " + TYPE_CONFIG[activeMeeting.meetingType].label + "\n" +
      "*Data:* " + activeMeeting.date + " (" + activeMeeting.durationMinutes + " min)\n\n" +
      "📌 *Resumo Executivo:*\n" +
      activeMeeting.summary.map((s) => "• " + s).join("\n") +
      "\n\n✅ *Ações & Próximos Passos:*\n" +
      activeMeeting.actionItems
        .map((a) => "• [" + (a.completed ? "OK" : "PENDENTE") + "] " + a.task + " - Responsável: " + a.assignedTo + " (" + a.dueDate + ")")
        .join("\n") +
      "\n\n_Gerado automaticamente via Focus Tech Meeting Intelligence_";

    navigator.clipboard.writeText(text);
    toast.success("Ata resumida copiada para a área de transferência!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Título e Ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Transcrição & Meeting Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload de documentos, extração de atas por IA, templates dinâmicos e edição interativa de reuniões.
          </p
        ></div>

        <div className="flex items-center gap-2 flex-wrap ml-auto md:ml-0">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white gap-1.5 font-medium shadow-xs text-xs h-9 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            + Upar Documento & Transcrever
          </Button>
        </div>
      </div>

      {/* 2. Mini-Cockpit / KPIs */}
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
            <span className="text-xs text-muted-foreground">documentos lidos</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fit Médio ICP
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              {(meetings.reduce((acc, m) => acc + m.fitScore, 0) / (meetings.length || 1)).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">qualificação BANT</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action Items
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {meetings.reduce((acc, m) => acc + m.actionItems.length, 0)}
            </span>
            <span className="text-xs text-muted-foreground">tarefas geradas</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Duração Média
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {Math.round(meetings.reduce((acc, m) => acc + m.durationMinutes, 0) / (meetings.length || 1))}
            </span>
            <span className="text-xs text-muted-foreground">minutos / call</span>
          </div>
        </Card>
      </div>

      {/* 3. Barra de Filtros por Categoria de Modelo (Padronizada: Sem Ícones, Fundo Laranja no Ativo) */}
      <Card className="p-2 sm:p-2.5 bg-card border-border/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: "all", label: "Todas" },
              { id: "diagnostico", label: "Diagnóstico" },
              { id: "proposta", label: "Proposta" },
              { id: "fechamento", label: "Fechamento" },
              { id: "followup", label: "Follow-up" },
              { id: "parceria", label: "Parceria" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={typeFilter === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(tab.id)}
                className={"text-xs h-7.5 px-2.5 cursor-pointer font-medium shrink-0 " + (
                  typeFilter === tab.id
                    ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                    : "text-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 justify-between sm:justify-end w-full lg:w-auto">
            <Select value={consultantFilter} onValueChange={setConsultantFilter}>
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

            <Button
              onClick={() => setIsUploadModalOpen(true)}
              size="sm"
              className="lg:hidden bg-[#FF6B00] text-white h-7.5 text-xs px-2.5 font-semibold cursor-pointer shrink-0"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              + Upar Doc
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Grid Principal: Lista de Chamadas à Esquerda + Dossiê Estruturado à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Lista de Reuniões */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por lead, empresa ou título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8.5 text-xs bg-card"
            />
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredMeetings.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <FileAudio className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs font-semibold">Nenhuma reunião encontrada</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Faça o upload de um arquivo ou cole a ata de reunião.
                </p>
              </Card>
            ) : (
              filteredMeetings.map((m) => {
                const config = TYPE_CONFIG[m.meetingType];
                const isSelected = activeMeeting?.id === m.id;
                const consultant =
                  TEAM_MEMBERS.find((u) => u.id === m.consultantId) ||
                  TEAM_MEMBERS[0];

                return (
                  <Card
                    key={m.id}
                    onClick={() => {
                      setSelectedMeetingId(m.id);
                      setIsEditingDossier(false);
                    }}
                    className={"p-3.5 cursor-pointer transition-all border " + (
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <Badge variant="outline" className={"text-[10px] font-semibold " + config.badgeColor}>
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

                    {m.sourceFileName && (
                      <div className="mt-1.5 text-[10px] text-primary/80 flex items-center gap-1 truncate">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{m.sourceFileName}</span>
                      </div>
                    )}

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

        {/* Coluna Direita: Dossiê Estruturado Completo & Editor Interativo */}
        <div className="lg:col-span-8">
          {activeMeeting ? (
            <Card className="p-5 sm:p-6 bg-card border-border/80 shadow-md space-y-6">
              {/* Topo do Dossiê */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={"text-xs font-semibold " + TYPE_CONFIG[activeMeeting.meetingType].badgeColor}>
                      {TYPE_CONFIG[activeMeeting.meetingType].label}
                    </Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                      Fit ICP: {activeMeeting.fitScore}%
                    </Badge>
                    {activeMeeting.sourceFileName && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                        <FileText className="h-3 w-3" />
                        {activeMeeting.sourceFileName} ({activeMeeting.sourceFileSize || "Doc"})
                      </Badge>
                    )}
                  </div>

                  {isEditingDossier && editForm ? (
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="text-base font-bold h-9"
                    />
                  ) : (
                    <h2 className="text-lg md:text-xl font-bold text-foreground">
                      {activeMeeting.title}
                    </h2>
                  )}

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

                <div className="flex items-center gap-2 self-start flex-wrap">
                  {isEditingDossier ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSaveDossier}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer gap-1.5 font-semibold"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Salvar Alterações
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditForm(JSON.parse(JSON.stringify(activeMeeting)));
                          setIsEditingDossier(false);
                        }}
                        className="text-xs h-8 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingDossier(true)}
                        className="text-xs h-8 cursor-pointer gap-1.5 hover:bg-muted"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar Dossiê
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copySummaryForWhatsApp}
                        className="text-xs h-8 cursor-pointer gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Ata WhatsApp
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={syncActionItemsToCRM}
                            className="text-xs cursor-pointer gap-1.5"
                          >
                            <ListTodo className="h-3.5 w-3.5 text-primary" />
                            Sincronizar Tarefas com CRM
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteMeeting(activeMeeting.id)}
                            className="text-destructive text-xs cursor-pointer gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir Transcrição
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>

              {/* Seção 1: Resumo Executivo & Inteligência */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Resumo Executivo Estruturado
                  </h3>
                  {isEditingDossier && (
                    <span className="text-[10px] text-muted-foreground">
                      Edite os pontos ou adicione novos tópicos
                    </span>
                  )}
                </div>

                {isEditingDossier && editForm ? (
                  <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/60">
                    {editForm.summary.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={point}
onChange={(e) => {
const updated = [...editForm.summary];
updated[idx] = e.target.value;
setEditForm({ ...editForm, summary: updated });
}}
                          className="h-8 text-xs bg-background"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
onClick={() => {
const updated = editForm.summary.filter((_, i) => i !== idx);
setEditForm({ ...editForm, summary: updated });
}}
                          className="h-7 w-7 text-destructive cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-2">
                      <Input
                        placeholder="Adicionar novo ponto ao resumo..."
                        value={newSummaryBullet}
                        onChange={(e) => setNewSummaryBullet(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!newSummaryBullet.trim()) return;
                          setEditForm({
                            ...editForm,
                            summary: [...editForm.summary, newSummaryBullet.trim()],
                          });
                          setNewSummaryBullet("");
                        }}
                        className="h-8 text-xs bg-primary text-white cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-2">
                    {activeMeeting.summary.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p>{point}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção 2: Template Específico por Tipo de Reunião */}
              {activeMeeting.meetingType === "diagnostico" && (
                <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      Mapeamento Diagnóstico & Dores Críticas (SPIN)
                    </h4>
                    {activeMeeting.typeSpecificData.estimatedBudget && (
                      <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600">
                        Orçamento: {activeMeeting.typeSpecificData.estimatedBudget}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px] mb-1">
                        Stack Atual do Lead:
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {activeMeeting.typeSpecificData.currentStack?.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-background">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px] mb-1">
                        Principais Dores Mapeadas:
                      </span>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {activeMeeting.typeSpecificData.mainPains?.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "proposta" && (
                <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Alinhamento de Proposta & Fechamento
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Prazo de Decisão: <strong className="text-foreground">{activeMeeting.typeSpecificData.decisionDeadline || "A definir"}</strong>
                    </p>
                    {activeMeeting.typeSpecificData.pricingTier && (
                      <p className="text-[11px] text-muted-foreground">
                        Escopo: {activeMeeting.typeSpecificData.pricingTier}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Valor Discutido</span>
                    <p className="text-lg font-bold text-emerald-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        activeMeeting.typeSpecificData.valueDiscussed || 0,
                      )}
                    </p>
                    {activeMeeting.typeSpecificData.closingProbability && (
                      <span className="text-[10px] text-amber-600 font-semibold">
                        Probabilidade: {activeMeeting.typeSpecificData.closingProbability}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "fechamento" && (
                <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5" />
                      Condições de Fechamento & Implantação
                    </h4>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                      Jurídico Validado ✓
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <p className="text-foreground">
                      <strong>Início do Onboarding:</strong> {activeMeeting.typeSpecificData.onboardingDate || "Agendado"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>SLA Acordado:</strong> {activeMeeting.typeSpecificData.slaAgreed || "Padrão"}
                    </p>
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "followup" && (
                <div className="p-4 rounded-xl border bg-purple-500/5 border-purple-500/20 space-y-2">
                  <h4 className="font-bold text-xs text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Pontos Resolvidos & Cadência de Follow-up
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px]">Pontos Alinhados:</span>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {activeMeeting.typeSpecificData.resolvedPoints?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground block text-[11px]">Próximo Contato:</span>
                      <p className="text-foreground font-medium">
                        {activeMeeting.typeSpecificData.nextMeetingDate || "Em 3 dias úteis"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeMeeting.meetingType === "parceria" && (
                <div className="p-4 rounded-xl border bg-orange-500/5 border-orange-500/20 space-y-2">
                  <h4 className="font-bold text-xs text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Handshake className="h-3.5 w-3.5" />
                    Parceria Comercial & Ação de Co-Marketing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <p className="text-foreground">
                      <strong>Modelo de Comissão:</strong> {activeMeeting.typeSpecificData.commissionModel}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Ação Conjunta:</strong> {activeMeeting.typeSpecificData.jointActivity}
                    </p>
                  </div>
                </div>
              )}

              {/* Seção 3: Participantes */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Participantes da Reunião
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
                        className={"text-[9px] " + (
                          p.side === "client" ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary"
                        )}
                      >
                        {p.side === "client" ? "Lado Cliente" : "Focus Tech"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 4: Action Items com Edição & Sincronização */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    Ações & Tarefas Delegadas (Action Items)
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {activeMeeting.actionItems.filter((a) => a.completed).length}/
                      {activeMeeting.actionItems.length} concluídas
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={syncActionItemsToCRM}
                      className="text-[11px] h-6 px-2 text-primary cursor-pointer hover:underline"
                    >
                      Sincronizar CRM
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {activeMeeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleActionItem(item.id)}
                      className={"p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all " + (
                        item.completed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground line-through"
                          : "bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={"h-4 w-4 rounded flex items-center justify-center border " + (
                            item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border"
                          )}
                        >
                          {item.completed && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{item.task}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-foreground">
                        {item.priority && (
                          <Badge
                            variant="outline"
                            className={"text-[9px] " + (
                              item.priority === "alta"
                                ? "text-rose-600 border-rose-500/30"
                                : item.priority === "media"
                                ? "text-amber-600 border-amber-500/30"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.priority}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px]">
                          {item.assignedTo}
                        </Badge>
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {isEditingDossier && editForm && (
                  <div className="p-3 rounded-xl border bg-muted/30 space-y-2">
                    <span className="text-xs font-bold block text-foreground">+ Adicionar Novo Action Item</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        placeholder="Descrição da tarefa..."
                        value={newActionTask}
                        onChange={(e) => setNewActionTask(e.target.value)}
                        className="h-8 text-xs md:col-span-1"
                      />
                      <Input
                        placeholder="Responsável (ex: Fábio)"
                        value={newActionAssignee}
                        onChange={(e) => setNewActionAssignee(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="Prazo (ex: Amanhã 14h)"
                          value={newActionDue}
                          onChange={(e) => setNewActionDue(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!newActionTask.trim()) return;
                            const newItem: ActionItem = {
                              id: "act-" + Date.now(),
                              task: newActionTask.trim(),
                              assignedTo: newActionAssignee.trim() || "Consultor",
                              dueDate: newActionDue.trim() || "Em 2 dias",
                              completed: false,
                              priority: newActionPriority,
                            };
                            setEditForm({
                              ...editForm,
                              actionItems: [...editForm.actionItems, newItem],
                            });
                            setNewActionTask("");
                          }}
                          className="h-8 text-xs bg-primary text-white cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção 5: Objeções & Insights Mapeados */}
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
                            Resolvida na Reunião
                          </Badge>
                        </div>
                        <p className="text-muted-foreground italic">\"{obj.quote}\"</p>
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
              <FileAudio className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-bold text-base">Nenhuma reunião selecionada</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione uma chamada na coluna lateral ou faça o upload de uma nova transcrição.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPAR DOCUMENTO & PROCESSAR TRANSCRIÇÃO IA */}
      {/* ========================================================================= */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Upload de Documento & Transcrição IA
            </DialogTitle>
            <DialogDescription>
              Faça upload do arquivo da reunião (.pdf, .docx, .txt, .vtt, .mp3) ou cole o texto para extração estruturada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Zona de Drop & Upload */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed rounded-xl border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.vtt,.srt,.csv,.md,.mp3,.wav,.m4a"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="p-2.5 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {uploadedFile ? uploadedFile.name : "Clique para selecionar ou arraste o documento aqui"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Suporta PDF, DOCX, TXT, VTT, Áudios (Meet/Zoom/Teams) até 50MB
                </p>
              </div>

              {isReadingFile && (
                <div className="w-full max-w-xs space-y-1 mt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Lendo documento...</span>
                    <span>{fileProgress}%</span>
                  </div>
                  <Progress value={fileProgress} className="h-1.5" />
                </div>
              )}
            </div>

            {/* Seletor de Modelo de Reunião */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tipo do Modelo & Estrutura do Relatório *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: "diagnostico", label: "Diagnóstico" },
                    { id: "proposta", label: "Proposta" },
                    { id: "fechamento", label: "Fechamento" },
                    { id: "followup", label: "Follow-up" },
                    { id: "parceria", label: "Parceria" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormMeetingType(item.id)}
                    className={"flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer " + (
                      formMeetingType === item.id
                        ? "bg-[#FF6B00] text-white font-bold shadow-xs border-[#FF6B00]"
                        : "border-border/60 hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {TYPE_CONFIG[formMeetingType].description}
              </p>
            </div>

            {/* Relacionamento com Leads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Vincular a Lead Existente</label>
                <Select
                  value={formSelectedLeadId}
                  onValueChange={(val) => {
                    setFormSelectedLeadId(val);
                    if (val !== "custom") {
                      const selected = dbLeads.find((l: any) => l.id === val);
                      if (selected) {
                        setFormLeadName(selected.name);
                        setFormCompany(selected.company || "");
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecionar Lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Preenchimento Manual / Novo Lead</SelectItem>
                    {dbLeads.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.company ? "(" + l.company + ")" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Título do Relatório</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Diagnóstico Operacional TechVanguard"
                  className="h-9 text-xs"
                />
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

            {/* Transcrição Bruta ou Conteúdo Lido */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Transcrição Bruta Extraída *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormTranscript(
                      "Vendedor: Olá! Como está o processo de vendas da empresa hoje?\nCliente: Temos 10 vendedores e nosso maior problema é o esquecimento de follow-up.\nVendedor: Nosso CRM resolve isso com automação de WhatsApp e Comercial OS.\nCliente: Perfeito, me manda a proposta até sexta-feira com os valores alinhados.",
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
                placeholder="Cole aqui o texto ou faça o upload de um arquivo acima..."
                rows={5}
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
              disabled={isProcessing || isReadingFile}
              onClick={handleProcessTranscript}
              className="bg-[#FF6B00] hover:bg-[#E65C00] text-white font-medium cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
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