import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Compass,
  Phone,
  Calendar,
  RotateCcw,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  MessageCircle,
  MoreVertical,
  Trash2,
  FileText,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  Copy,
  Check,
  Presentation,
  UserCheck,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Download,
  Share2,
  Flame,
  Zap,
  BookOpen,
  Send,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";
import { useKpiCards } from "@/hooks/use-kpi-cards";

export const Route = createFileRoute("/_authenticated/deals")({
  head: () => ({ meta: [{ title: "Prospecção · Focus CRM" }] }),
  component: ProspeccaoPage,
});

// Tipos do módulo Prospecção
export type ScriptChannel = "whatsapp" | "phone" | "email" | "objection";

export interface SalesScript {
  id: string;
  title: string;
  channel: ScriptChannel;
  category: string;
  text: string;
  tags: string[];
  successRate: number;
}

export type ResourceType = "spreadsheet" | "document" | "link" | "presentation";

export interface SalesResource {
  id: string;
  title: string;
  category: string;
  type: ResourceType;
  url: string;
  description: string;
  icon?: string;
  isFeatured?: boolean;
}

const STORAGE_SCRIPTS_KEY = "focus_crm_prospeccao_scripts";
const STORAGE_RESOURCES_KEY = "focus_crm_prospeccao_resources";

// Scripts iniciais de alta conversão
const INITIAL_SCRIPTS: SalesScript[] = [
  {
    id: "sc-1",
    title: "Cold Call - Gancho Inicial de 15 Segundos",
    channel: "phone",
    category: "Prospecção Ativa",
    tags: ["Abertura", "Cold Call", "SDR"],
    successRate: 74,
    text: `Olá, [Nome do Lead], tudo bem? Aqui é o [Meu Nome] da Focus Tech.

Sei que você não estava esperando minha ligação, prometo ser direto: nós ajudamos empresas do setor [Nicho/Setor] a estruturar uma operação comercial previsível para dobrar o volume de reuniões qualificadas.

Vi que você é responsável pelo comercial da [Nome da Empresa]. Faz sentido 2 minutos para entender como estamos gerando esse resultado para empresas como a sua?`,
  },
  {
    id: "sc-2",
    title: "WhatsApp - Abordagem Direta com Quebra de Padrão",
    channel: "whatsapp",
    category: "Mensagem Rápida",
    tags: ["WhatsApp", "Primeiro Contato", "Alta Conversão"],
    successRate: 82,
    text: `Olá [Nome do Lead], tudo bem?

Acompanho o crescimento da [Nome da Empresa] e notei que vocês estão expandindo a presença no mercado.

Desenvolvemos uma estrutura de CRM e Comercial OS específica para times de vendas que precisam eliminar gargalos de follow-up e aumentar o fechamento de contratos em até 35%.

Você tem 10 minutos nesta quinta-feira às 14h ou sexta às 10h para eu te mostrar como funciona na prática?`,
  },
  {
    id: "sc-3",
    title: "WhatsApp - Resgate de Lead 'Sumido' (Técnica 1-2-3)",
    channel: "whatsapp",
    category: "Follow-up",
    tags: ["Resgate", "Reativação", "Follow-up"],
    successRate: 88,
    text: `Olá [Nome], tudo bem?

Imagino que sua rotina esteja corrida. Para eu não ser insistente, qual das opções abaixo melhor descreve seu momento atual?

1️⃣ Ainda temos interesse, mas estamos sem tempo esta semana.
2️⃣ Vamos deixar esse projeto para o próximo mês.
3️⃣ Não faz mais sentido para a [Empresa] no momento.

Basta me responder com o número! Grande abraço.`,
  },
  {
    id: "sc-4",
    title: "Quebra de Objeção: 'Já usamos outro sistema / concorrente'",
    channel: "objection",
    category: "Objeção",
    tags: ["Concorrente", "Migração", "Diferencial"],
    successRate: 79,
    text: `Excelente! O fato de vocês já usarem uma ferramenta mostra que valorizam a organização comercial.

Nossos clientes que também utilizavam [Nome do Concorrente] migraram para a Focus Tech porque sentiam falta de um módulo nativo de Comercial OS integrado a pré-vendas (SDR) e automação de follow-ups sem complexidade.

Não estamos propondo que você troque agora, apenas que conheça o diferencial. Se fizer sentido mais adiante, ótimo; se não, você terá uma referência do que há de mais moderno. Que tal 15 minutos na terça?`,
  },
  {
    id: "sc-5",
    title: "Quebra de Objeção: 'Está muito caro / Sem orçamento'",
    channel: "objection",
    category: "Objeção",
    tags: ["Preço", "ROI", "Valor"],
    successRate: 71,
    text: `Compreendo perfeitamente, [Nome]. Em momentos de controle orçamentário, cada investimento precisa se justificar com clareza.

Por isso mesmo nossos clientes não veem o CRM como um custo, mas como um acelerador: com apenas 1 ou 2 contratos extras fechados por mês pelo time, o sistema se paga integralmente e gera lucro líquido para a [Empresa].

Podemos fazer uma simulação rápida de ROI com base nos seus números atuais? Leva apenas 10 minutos.`,
  },
  {
    id: "sc-6",
    title: "Quebra de Objeção: 'Me mande uma apresentação por e-mail'",
    channel: "objection",
    category: "Objeção",
    tags: ["Apresentação", "Contorno", "Compromisso"],
    successRate: 85,
    text: `Com certeza, posso te enviar sim! 

Porém, como temos módulos modulares para cada modelo de negócio, para que o material seja realmente útil para você, posso te fazer 2 perguntas rápidas de 1 minuto para personalizar o que vou te mandar?

(Após as respostas): Perfeito! Para você ver esses 3 pontos funcionando na prática com seus dados, vamos fazer uma apresentação rápida de 15 minutos online. Você prefere amanhã de manhã ou à tarde?`,
  },
];

// Documentos e Planilhas iniciais
const INITIAL_RESOURCES: SalesResource[] = [
  {
    id: "res-1",
    title: "Calculadora de ROI & Projeção de Vendas 2026",
    category: "Planilhas de Vendas",
    type: "spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQexample-roi/pubhtml",
    description: "Planilha para calcular o retorno sobre investimento (ROI) e simulação de ganho para o cliente durante a call.",
    isFeatured: true,
  },
  {
    id: "res-2",
    title: "Tabela Oficial de Preços & Planos Focus Tech",
    category: "Planilhas de Vendas",
    type: "spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQexample-pricing/pubhtml",
    description: "Valores atualizados de licenças, módulos adicionais, implementação e descontos autorizados para fechamento.",
    isFeatured: true,
  },
  {
    id: "res-3",
    title: "Proposta Comercial Padrão (Modelo Editável)",
    category: "Documentos",
    type: "document",
    url: "https://docs.google.com/document/d/1example-proposta/edit",
    description: "Template oficial de proposta comercial com escopo de fornecimento, cronograma de onboarding e termos de garantia.",
    isFeatured: true,
  },
  {
    id: "res-4",
    title: "Contrato de Prestação de Serviços & SLA",
    category: "Documentos",
    type: "document",
    url: "https://docs.google.com/document/d/1example-contrato/edit",
    description: "Minuta jurídica padrão revisada para assinatura eletrônica via Clicksign / DocuSign.",
  },
  {
    id: "res-5",
    title: "Consulta de CNPJ & Situação Cadastral (Receita)",
    category: "Links Úteis",
    type: "link",
    url: "https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
    description: "Verificação rápida de sócios, capital social, CNAE e situação cadastral do lead.",
  },
  {
    id: "res-6",
    title: "Gerador de Link Direto para WhatsApp",
    category: "Links Úteis",
    type: "link",
    url: "https://wa.me",
    description: "Ferramenta para disparar mensagens personalizadas via WhatsApp Web ou Mobile.",
  },
];

// Slides da Apresentação Institucional
const PITCH_DECK_SLIDES = [
  {
    title: "Focus Tech CRM & Comercial OS",
    subtitle: "A plataforma completa de inteligência comercial e alta performance de vendas.",
    tag: "APRESENTAÇÃO INSTITUCIONAL",
    points: [
      "Pipeline visual interativo com funil de conversão em tempo real",
      "Módulo Comercial OS dedicado à produtividade e metas da equipe",
      "Sales Enablement & Hub de SDRs para aceleração de prospecção",
    ],
    highlight: "Desenvolvido para empresas que buscam escala e previsibilidade comercial.",
  },
  {
    title: "Os 3 Grandes Desafios de Vendas",
    subtitle: "Por que operações comerciais perdem dinheiro todos os dias?",
    tag: "DIAGNÓSTICO COMERCIAL",
    points: [
      "1. Perda de Leads por Falta de Follow-up: 68% dos clientes compram após o 5º contato, mas a maioria desiste no 1º.",
      "2. Falta de Visibilidade da Equipe: Gestores não sabem quantas calls e reuniões foram feitas hoje.",
      "3. Processo Desestruturado: SDRs e Closers sem scripts e sem passagem de bastão clara.",
    ],
    highlight: "A Focus Tech resolve esses 3 gargalos em um único cockpit unificado.",
  },
  {
    title: "Nossa Solução: Do Lead ao Contrato",
    subtitle: "Estrutura operacional integrada de ponta a ponta.",
    tag: "MÓDULOS & TECNOLOGIA",
    points: [
      "🎯 Prospecção & SDR: Roteiros BANT, cadências ativas e playbooks de quebra de objeções.",
      "📊 Funil de Leads & Pipeline: Arraste ágil com cálculo automático de ticket médio.",
      "💼 Comercial OS: Ranking da equipe, contabilizador de ligações, reuniões e metas individuais.",
    ],
    highlight: "Tudo na nuvem, ultrarrápido, seguro e com integração via WhatsApp.",
  },
  {
    title: "Resultados Comprovados em Clientes",
    subtitle: "Impacto direto na receita e produtividade das equipes.",
    tag: "CASES & IMPACTO",
    points: [
      "+42% de aumento na taxa de conversão de reuniões para propostas.",
      "3x mais atividades e ligações registradas por consultor diariamente.",
      "Redução de 75% no tempo gasto pelos gestores na montagem de relatórios.",
    ],
    highlight: "Payback médio comprovado nos primeiros 45 dias de implantação.",
  },
  {
    title: "Próximos Passos & Implantação",
    subtitle: "Como iniciar a transformação da sua operação comercial hoje.",
    tag: "OFERTA & FECHAMENTO",
    points: [
      "1. Configuração completa do CRM e personalização das etapas do Funil.",
      "2. Treinamento prático e imersivo com a equipe comercial e SDRs.",
      "3. Acompanhamento dedicado nos primeiros 30 dias para garantir o atingimento de metas.",
    ],
    highlight: "Vamos dar o próximo passo para acelerar suas vendas?",
  },
];

function ProspeccaoPage() {
  const [activeTab, setActiveTab] = useState<"sdr" | "scripts" | "presentation" | "vault">("sdr");
  const { collapsed: kpiCollapsed, toggle: toggleKpi } = useKpiCards();

  // Estados dos Scripts
  const [scripts, setScripts] = useState<SalesScript[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCRIPTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SCRIPTS;
  });

  const [scriptChannelFilter, setScriptChannelFilter] = useState<string>("all");
  const [scriptSearch, setScriptSearch] = useState<string>("");

  // Estados dos Recursos/Documentos
  const [resources, setResources] = useState<SalesResource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESOURCES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RESOURCES;
  });

  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>("all");

  // Estado da Apresentação
  const [currentSlide, setCurrentSlide] = useState(0);

  // Estados do SDR Hub (Framework BANT)
  const [bantLeadName, setBantLeadName] = useState("");
  const [bantBudget, setBantBudget] = useState<"yes" | "review" | "no">("yes");
  const [bantAuthority, setBantAuthority] = useState<"ceo" | "manager" | "staff">("ceo");
  const [bantNeed, setBantNeed] = useState<"urgent" | "moderate" | "curious">("urgent");
  const [bantTiming, setBantTiming] = useState<"now" | "soon" | "later">("now");
  const [bantCloserId, setBantCloserId] = useState(TEAM_MEMBERS[0].id);

  // Mini-contadores de atividades rápidas do SDR
  const [sdrCallsCount, setSdrCallsCount] = useState(18);
  const [sdrWhatsCount, setSdrWhatsCount] = useState(24);
  const [sdrMeetingsCount, setSdrMeetingsCount] = useState(5);

  // Modais
  const [isNewScriptModalOpen, setIsNewScriptModalOpen] = useState(false);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);

  // Form Novo Script
  const [newScriptTitle, setNewScriptTitle] = useState("");
  const [newScriptChannel, setNewScriptChannel] = useState<ScriptChannel>("whatsapp");
  const [newScriptCategory, setNewScriptCategory] = useState("Prospecção");
  const [newScriptText, setNewScriptText] = useState("");

  // Form Novo Recurso
  const [newResTitle, setNewResTitle] = useState("");
  const [newResCategory, setNewResCategory] = useState("Planilhas de Vendas");
  const [newResType, setNewResType] = useState<ResourceType>("spreadsheet");
  const [newResUrl, setNewResUrl] = useState("");
  const [newResDesc, setNewResDesc] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCRIPTS_KEY, JSON.stringify(scripts));
    } catch {}
  }, [scripts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RESOURCES_KEY, JSON.stringify(resources));
    } catch {}
  }, [resources]);

  // Cálculo da pontuação BANT (0 a 100%)
  const bantScore = useMemo(() => {
    let score = 0;
    if (bantBudget === "yes") score += 25;
    else if (bantBudget === "review") score += 15;

    if (bantAuthority === "ceo") score += 30;
    else if (bantAuthority === "manager") score += 20;
    else score += 5;

    if (bantNeed === "urgent") score += 25;
    else if (bantNeed === "moderate") score += 15;
    else score += 5;

    if (bantTiming === "now") score += 20;
    else if (bantTiming === "soon") score += 10;
    else score += 0;

    return Math.min(100, score);
  }, [bantBudget, bantAuthority, bantNeed, bantTiming]);

  // Copiar texto para a área de transferência
  const copyToClipboard = (text: string, title?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(title ? `"${title}" copiado!` : "Copiado para a área de transferência!");
  };

  // Filtragem de Scripts
  const filteredScripts = useMemo(() => {
    return scripts.filter((s) => {
      if (scriptChannelFilter !== "all" && s.channel !== scriptChannelFilter) {
        return false;
      }
      if (scriptSearch.trim()) {
        const q = scriptSearch.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.text.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [scripts, scriptChannelFilter, scriptSearch]);

  // Filtragem de Recursos
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (resourceCategoryFilter !== "all" && r.category !== resourceCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [resources, resourceCategoryFilter]);

  // Handler para Salvar Novo Script
  const handleSaveNewScript = () => {
    if (!newScriptTitle.trim() || !newScriptText.trim()) {
      return toast.error("Preencha o título e o texto do script.");
    }
    const newS: SalesScript = {
      id: `sc-${Date.now()}`,
      title: newScriptTitle.trim(),
      channel: newScriptChannel,
      category: newScriptCategory.trim() || "Geral",
      text: newScriptText.trim(),
      tags: [newScriptCategory, "Customizado"],
      successRate: 80,
    };
    setScripts((prev) => [newS, ...prev]);
    toast.success("Novo script adicionado ao Playbook!");
    setNewScriptTitle("");
    setNewScriptText("");
    setIsNewScriptModalOpen(false);
  };

  // Handler para Salvar Novo Recurso
  const handleSaveNewResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) {
      return toast.error("Preencha o título e o link do recurso.");
    }
    const newR: SalesResource = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      category: newResCategory,
      type: newResType,
      url: newResUrl.trim(),
      description: newResDesc.trim() || "Material de apoio comercial.",
    };
    setResources((prev) => [newR, ...prev]);
    toast.success("Recurso adicionado à Central de Vendas!");
    setNewResTitle("");
    setNewResUrl("");
    setNewResDesc("");
    setIsNewResourceModalOpen(false);
  };

  // Passagem de bastão do SDR
  const handleTransferToCloser = () => {
    if (!bantLeadName.trim()) {
      return toast.error("Informe o nome do lead qualificado.");
    }
    const closer = TEAM_MEMBERS.find((m) => m.id === bantCloserId) || TEAM_MEMBERS[0];
    toast.success(
      `🎯 Lead "${bantLeadName}" qualificado (${bantScore}% ICP) transferido com sucesso para ${closer.name}!`,
    );
    setSdrMeetingsCount((prev) => prev + 1);
    setBantLeadName("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Título e Ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Prospecção
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hub de Sales Enablement, scripts de abordagem, apresentação e central do SDR.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto md:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewResourceModalOpen(true)}
            className="gap-1.5 border-border hover:bg-muted text-xs h-9"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            + Adicionar Documento/Link
          </Button>

          <Button
            onClick={() => setIsNewScriptModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white gap-1.5 font-medium shadow-xs text-xs h-9"
          >
            <Plus className="h-4 w-4" />
            + Novo Script
          </Button>
        </div>
      </div>

      {/* Mini-Cockpit / KPIs de Prospecção — toggle mobile */}
      <div className="md:hidden flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Indicadores</span>
        <button
          onClick={toggleKpi}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 px-2 rounded-md hover:bg-muted"
        >
          {kpiCollapsed ? <><ChevronDown className="h-3.5 w-3.5" /> Mostrar</> : <><ChevronUp className="h-3.5 w-3.5" /> Ocultar</>}
        </button>
      </div>
      <div className={kpiCollapsed ? "hidden md:grid grid-cols-2 md:grid-cols-4 gap-3.5" : "grid grid-cols-2 md:grid-cols-4 gap-3.5"}>
        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leads em Prospecção
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">84</span>
            <span className="text-xs text-muted-foreground">ativos no radar</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Cadências em andamento no time de SDR
          </p>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Taxa de Conexão
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">68.4%</span>
            <span className="text-xs text-muted-foreground">respostas</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Média de engajamento via WhatsApp e Calls
          </p>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agendamentos SDR
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{sdrMeetingsCount + 23}</span>
            <span className="text-xs text-muted-foreground">reuniões no mês</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Passagens de bastão qualificadas para Closers
          </p>
        </Card>

        <Card className="p-4 bg-card border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Materiais &amp; Scripts
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{scripts.length + resources.length}</span>
            <span className="text-xs text-muted-foreground">playbooks ativos</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Prontos para uso e cópia em 1 clique
          </p>
        </Card>
      </div>

      {/* Navegação de Abas do Módulo */}
      <Card className="p-2 sm:p-2.5 bg-card border-border/80 shadow-xs">
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg overflow-x-auto no-scrollbar shrink-0 w-full sm:w-auto">
          <Button
            variant={activeTab === "sdr" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sdr")}
            className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
              activeTab === "sdr"
                ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                : "text-foreground hover:text-foreground"
            }`}
          >
            SDR Hub
          </Button>

          <Button
            variant={activeTab === "scripts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("scripts")}
            className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
              activeTab === "scripts"
                ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                : "text-foreground hover:text-foreground"
            }`}
          >
            Playbook
          </Button>

          <Button
            variant={activeTab === "presentation" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("presentation")}
            className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
              activeTab === "presentation"
                ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                : "text-foreground hover:text-foreground"
            }`}
          >
            Pitch Comercial
          </Button>

          <Button
            variant={activeTab === "vault" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("vault")}
            className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium ${
              activeTab === "vault"
                ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                : "text-foreground hover:text-foreground"
            }`}
          >
            Documentos
          </Button>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* ABA 1: SDR HUB (CENTRAL DO PRÉ-VENDEDOR) */}
      {/* ========================================================================= */}
      {activeTab === "sdr" && (
        <div className="space-y-6">
          {/* Mini-Barra de Produtividade Rápida do SDR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
            <Card className="p-4 bg-muted/20 border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ligações SDR Hoje</p>
                <p className="text-xl font-bold text-foreground">{sdrCallsCount} calls</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSdrCallsCount((p) => p + 1);
                  toast.success("+1 Ligação de Prospecção registrada!");
                }}
                className="h-8 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                +1 Call
              </Button>
            </Card>

            <Card className="p-4 bg-muted/20 border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">WhatsApps Enviados Hoje</p>
                <p className="text-xl font-bold text-foreground">{sdrWhatsCount} msgs</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSdrWhatsCount((p) => p + 1);
                  toast.success("+1 Mensagem WhatsApp registrada!");
                }}
                className="h-8 text-xs cursor-pointer text-emerald-600 border-emerald-500/30"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                +1 WhatsApp
              </Button>
            </Card>

            <Card className="p-4 bg-muted/20 border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Reuniões Agendadas Hoje</p>
                <p className="text-xl font-bold text-primary">{sdrMeetingsCount} agendamentos</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setSdrMeetingsCount((p) => p + 1);
                  toast.success("🏆 Reunião agendada com sucesso para o Closer!");
                }}
                className="brand-gradient text-white h-8 text-xs cursor-pointer font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                +1 Reunião
              </Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lado Esquerdo: Simulador e Qualificador BANT */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 border-border/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Qualificador Rápido BANT (Framework SDR)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Avalie o fit do lead antes de realizar a passagem de bastão para o Closer.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground">Fit ICP Score</span>
                    <p
                      className={`text-xl font-extrabold ${
                        bantScore >= 75
                          ? "text-emerald-600"
                          : bantScore >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {bantScore}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nome do Lead / Empresa a Qualificar *
                    </label>
                    <Input
                      value={bantLeadName}
                      onChange={(e) => setBantLeadName(e.target.value)}
                      placeholder="Ex: Carlos Mendonça (Alpha Soluções)"
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* B - Budget */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between flex-wrap gap-1">
                      <span>💰 [B] Budget (Orçamento)</span>
                      <span className="text-[10px] text-muted-foreground">Tem verba para investir?</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        { id: "yes", label: "Verba Confirmada" },
                        { id: "review", label: "Em Avaliação" },
                        { id: "no", label: "Sem Orçamento" },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant={bantBudget === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBantBudget(item.id as any)}
                          className={`text-xs h-8 cursor-pointer ${
                            bantBudget === item.id ? "bg-primary text-white" : ""
                          }`}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* A - Authority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between flex-wrap gap-1">
                      <span>👑 [A] Authority (Autoridade)</span>
                      <span className="text-[10px] text-muted-foreground">É o tomador de decisão?</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        { id: "ceo", label: "CEO / Diretor / Sócio" },
                        { id: "manager", label: "Gerente / Coordenador" },
                        { id: "staff", label: "Analista / Operacional" },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant={bantAuthority === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBantAuthority(item.id as any)}
                          className={`text-xs h-8 cursor-pointer ${
                            bantAuthority === item.id ? "bg-primary text-white" : ""
                          }`}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* N - Need */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between flex-wrap gap-1">
                      <span>🎯 [N] Need (Necessidade / Dor)</span>
                      <span className="text-[10px] text-muted-foreground">Qual a gravidade do problema?</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        { id: "urgent", label: "Dor Crítica / Urgente" },
                        { id: "moderate", label: "Desejo de Melhoria" },
                        { id: "curious", label: "Apenas Curioso" },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant={bantNeed === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBantNeed(item.id as any)}
                          className={`text-xs h-8 cursor-pointer ${
                            bantNeed === item.id ? "bg-primary text-white" : ""
                          }`}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* T - Timing */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between flex-wrap gap-1">
                      <span>⏱️ [T] Timing (Prazo de Decisão)</span>
                      <span className="text-[10px] text-muted-foreground">Quando pretende iniciar?</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        { id: "now", label: "Imediato (< 15 dias)" },
                        { id: "soon", label: "30 a 60 dias" },
                        { id: "later", label: "Indefinido" },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant={bantTiming === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBantTiming(item.id as any)}
                          className={`text-xs h-8 cursor-pointer ${
                            bantTiming === item.id ? "bg-primary text-white" : ""
                          }`}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Seleção do Closer Responsável */}
                  <div className="pt-2 border-t flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="w-full md:w-60 space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Transferir para o Closer:
                      </label>
                      <Select value={bantCloserId} onValueChange={setBantCloserId}>
                        <SelectTrigger className="h-8 text-xs">
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

                    <Button
                      onClick={handleTransferToCloser}
                      className="w-full md:w-auto brand-gradient text-white font-medium text-xs h-8 mt-4 md:mt-0 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                      Agendar & Passar Bastão
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Lado Direito: Cadência de Prospecção Outbound (Passo a Passo) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Fluxo de Cadência Recomendada (7 Dias)
                  </h3>
                  <Badge variant="outline" className="text-[10px]">Outbound</Badge>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    {
                      step: "Passo 1 (Dia 1)",
                      channel: "📞 Cold Call",
                      desc: "Abertura de 15s + Pergunta de Diagnóstico de Alto Impacto.",
                      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                      scriptRef: "Cold Call - Gancho Inicial",
                    },
                    {
                      step: "Passo 2 (Dia 2)",
                      channel: "💬 WhatsApp Direto",
                      desc: "Mensagem curta com benefício de nicho e convite para 10 min.",
                      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                      scriptRef: "WhatsApp - Abordagem Direta",
                    },
                    {
                      step: "Passo 3 (Dia 4)",
                      channel: "📧 E-mail + Estudo de Caso",
                      desc: "Envio de case real com métricas comprovadas de clientes similares.",
                      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
                      scriptRef: "E-mail de Valor",
                    },
                    {
                      step: "Passo 4 (Dia 6)",
                      channel: "🎙️ Áudio de WhatsApp",
                      desc: "Áudio natural de 25 segundos mencionando o problema principal.",
                      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                      scriptRef: "WhatsApp Resgate",
                    },
                    {
                      step: "Passo 5 (Dia 7)",
                      channel: "🏁 Break-up / Fechamento",
                      desc: "Pergunta 1-2-3 para entender se o projeto ainda é prioridade.",
                      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
                      scriptRef: "Técnica 1-2-3",
                    },
                  ].map((cad, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-muted/40 transition-colors min-w-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-foreground">{cad.step}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${cad.color}`}>
                            {cad.channel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cad.desc}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab("scripts");
                          setScriptSearch(cad.scriptRef.split(" ")[0]);
                        }}
                        className="text-[10px] h-7 px-2 text-primary cursor-pointer shrink-0"
                      >
                        Ver Script →
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: PLAYBOOK DE SCRIPTS & QUEBRA DE OBJEÇÕES */}
      {/* ========================================================================= */}
      {activeTab === "scripts" && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca de Scripts */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg overflow-x-auto no-scrollbar shrink-0 w-full md:w-auto">
              {[
                { id: "all", label: "Todos os Scripts" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "phone", label: "Cold Call" },
                { id: "objection", label: "Quebra de Objeções" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={scriptChannelFilter === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setScriptChannelFilter(tab.id)}
                  className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium shrink-0 ${
                    scriptChannelFilter === tab.id
                      ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                      : "text-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por objeção, gancho, canal..."
                value={scriptSearch}
                onChange={(e) => setScriptSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>
          </div>

          {/* Grid de Scripts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScripts.map((script) => (
              <Card
                key={script.id}
                className="p-5 bg-card border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold bg-muted/50">
                      {script.category}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                      {script.successRate}% Conversão Média
                    </Badge>
                  </div>

                  <h3 className="font-bold text-sm text-foreground">{script.title}</h3>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/40 font-mono text-xs text-foreground/90 whitespace-pre-line leading-relaxed break-words overflow-x-hidden">
                    {script.text}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {script.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Canal: <strong className="capitalize">{script.channel}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(script.text, script.title)}
                      className="brand-gradient text-white text-xs h-7.5 px-3 font-medium cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copiar Script
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: APRESENTAÇÃO INSTITUCIONAL & PITCH DECK */}
      {/* ========================================================================= */}
      {activeTab === "presentation" && (
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border/80 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 text-[10px] font-bold">
                  {PITCH_DECK_SLIDES[currentSlide].tag}
                </Badge>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  {PITCH_DECK_SLIDES[currentSlide].title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {PITCH_DECK_SLIDES[currentSlide].subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      "https://focustech.co/apresentacao-comercial-2026",
                      "Link da Apresentação",
                    )
                  }
                  className="text-xs h-8 cursor-pointer gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Copiar Link para o Cliente
                </Button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="py-8 px-4 md:px-8 space-y-6 min-h-[260px] flex flex-col justify-center">
              <div className="space-y-4 max-w-2xl">
                {PITCH_DECK_SLIDES[currentSlide].points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 text-xs font-semibold text-primary">
                💡 {PITCH_DECK_SLIDES[currentSlide].highlight}
              </div>
            </div>

            {/* Controles de Navegação de Slides */}
            <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {PITCH_DECK_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === index ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  Slide {currentSlide + 1} de {PITCH_DECK_SLIDES.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  className="h-8 text-xs cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentSlide === PITCH_DECK_SLIDES.length - 1}
                  onClick={() => setCurrentSlide((p) => Math.min(PITCH_DECK_SLIDES.length - 1, p + 1))}
                  className="h-8 text-xs cursor-pointer"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: DOCUMENTOS, PLANILHAS & LINKS ÚTEIS (SALES VAULT) */}
      {/* ========================================================================= */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          {/* Filtros de Categoria (Padronizados) */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg overflow-x-auto no-scrollbar shrink-0 w-full sm:w-auto">
            {[
              { id: "all", label: "Todos os Recursos" },
              { id: "Planilhas de Vendas", label: "Planilhas & Calculadoras" },
              { id: "Documentos", label: "Documentos & Minutas" },
              { id: "Links Úteis", label: "Links & Ferramentas" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={resourceCategoryFilter === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setResourceCategoryFilter(tab.id)}
                className={`text-xs h-7.5 px-2.5 cursor-pointer font-medium shrink-0 ${
                  resourceCategoryFilter === tab.id
                    ? "bg-[#FF6B00] text-white shadow-xs font-semibold"
                    : "text-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Grid de Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => {
              const iconMap = {
                spreadsheet: FileSpreadsheet,
                document: FileText,
                presentation: Presentation,
                link: Link2,
              }[res.type];

              const Icon = iconMap || FileText;

              return (
                <Card
                  key={res.id}
                  className="p-5 bg-card border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {res.category}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-foreground break-words">{res.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(res.url, res.title)}
                      className="text-xs text-muted-foreground h-7.5 px-2 cursor-pointer"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar Link
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => window.open(res.url, "_blank")}
                      className="brand-gradient text-white text-xs h-7.5 px-3 font-medium cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Abrir Recurso
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NOVO SCRIPT DE VENDAS */}
      {/* ========================================================================= */}
      <Dialog open={isNewScriptModalOpen} onOpenChange={setIsNewScriptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Novo Script de Vendas
            </DialogTitle>
            <DialogDescription>
              Adicione um novo roteiro ou quebra de objeção para o Playbook da equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Título do Script *</label>
              <Input
                value={newScriptTitle}
                onChange={(e) => setNewScriptTitle(e.target.value)}
                placeholder="Ex: Abordagem para Donos de Clínica"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Canal de Contato</label>
                <Select
                  value={newScriptChannel}
                  onValueChange={(v) => setNewScriptChannel(v as ScriptChannel)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                    <SelectItem value="phone">📞 Telefone / Cold Call</SelectItem>
                    <SelectItem value="objection">🛡️ Quebra de Objeção</SelectItem>
                    <SelectItem value="email">📧 E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Categoria</label>
                <Input
                  value={newScriptCategory}
                  onChange={(e) => setNewScriptCategory(e.target.value)}
                  placeholder="Ex: Prospecção Fria"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Texto do Script *</label>
              <Textarea
                value={newScriptText}
                onChange={(e) => setNewScriptText(e.target.value)}
                placeholder="Digite o roteiro detalhado aqui..."
                rows={5}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewScriptModalOpen(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNewScript}
              className="brand-gradient text-white font-medium cursor-pointer"
            >
              Salvar Script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: NOVO DOCUMENTO / PLANILHA */}
      {/* ========================================================================= */}
      <Dialog open={isNewResourceModalOpen} onOpenChange={setIsNewResourceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Adicionar Material / Link
            </DialogTitle>
            <DialogDescription>
              Disponibilize planilhas, propostas ou links úteis para a equipe de vendas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Título do Material *</label>
              <Input
                value={newResTitle}
                onChange={(e) => setNewResTitle(e.target.value)}
                placeholder="Ex: Calculadora de Descontos 2026"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tipo</label>
                <Select
                  value={newResType}
                  onValueChange={(v) => setNewResType(v as ResourceType)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spreadsheet">📊 Planilha (Google Sheets / Excel)</SelectItem>
                    <SelectItem value="document">📄 Documento (DOCX / PDF)</SelectItem>
                    <SelectItem value="presentation">🖥️ Apresentação (Slides)</SelectItem>
                    <SelectItem value="link">🔗 Link / Ferramenta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Categoria</label>
                <Select
                  value={newResCategory}
                  onValueChange={setNewResCategory}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planilhas de Vendas">Planilhas de Vendas</SelectItem>
                    <SelectItem value="Documentos">Documentos</SelectItem>
                    <SelectItem value="Links Úteis">Links Úteis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL / Link Direto *</label>
              <Input
                value={newResUrl}
                onChange={(e) => setNewResUrl(e.target.value)}
                placeholder="https://docs.google.com/..."
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Descrição Rápida</label>
              <Input
                value={newResDesc}
                onChange={(e) => setNewResDesc(e.target.value)}
                placeholder="Para que serve este material..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewResourceModalOpen(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNewResource}
              className="brand-gradient text-white font-medium cursor-pointer"
            >
              Salvar Recurso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
