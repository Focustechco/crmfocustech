import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  MessageSquare,
  Calendar,
  MoreVertical,
  Plus,
  Users,
  ChevronRight,
  Filter,
  CalendarDays,
  Trash2,
  Edit2,
  User,
  Settings2,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({ meta: [{ title: "Negócios & Pipeline · Focus CRM" }] }),
  component: PipelinePage,
});

// Tipos relacionais completos
export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

export interface DealItem {
  id: string;
  code: string;
  title: string;
  value: number;
  stage_id: string;
  lead_id?: string;
  client_name: string;
  company_name: string;
  responsible: TeamMember;
  co_responsible?: TeamMember;
  tag: string;
  tag_color: string;
  activity_title: string;
  activity_date: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  status: "open" | "won" | "lost";
  created_at: string;
}

// Equipe padrão
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-1",
    name: "Ana Laura Lima",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    role: "Executiva de Contas",
  },
  {
    id: "user-2",
    name: "Fabio João Luiz Sousa",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    role: "Consultor Comercial",
  },
  {
    id: "user-3",
    name: "Zoé Fonseca",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    role: "Gestora de Contas",
  },
  {
    id: "user-4",
    name: "Joana Cavalcanti",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    role: "Vendedora Sênior",
  },
];

// Cores predefinidas para etapas
const STAGE_COLORS = [
  { label: "Laranja", value: "#FF6B00" },
  { label: "Coral", value: "#F97316" },
  { label: "Âmbar", value: "#F59E0B" },
  { label: "Esmeralda", value: "#10B981" },
  { label: "Azul", value: "#3B82F6" },
  { label: "Índigo", value: "#6366F1" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Roxo", value: "#8B5CF6" },
  { label: "Grafite", value: "#475569" },
];

// Etapas do Funil
const INITIAL_STAGES: PipelineStage[] = [
  { id: "stage-1", name: "Em Desenvolvimento", color: "#FF6B00", position: 0 },
  { id: "stage-2", name: "Criar documentos", color: "#F97316", position: 1 },
  { id: "stage-3", name: "Criar documentos (revisão)", color: "#FB923C", position: 2 },
  { id: "stage-4", name: "Documento aberto", color: "#F59E0B", position: 3 },
  { id: "stage-5", name: "Fatura final", color: "#EC4899", position: 4 },
  { id: "stage-6", name: "Entrega do produto", color: "#10B981", position: 5 },
];

// Mock Relacional Inicial fiel à imagem
const INITIAL_DEALS: DealItem[] = [
  {
    id: "deal-1789",
    code: "#1789",
    title: "Negócio #1789",
    value: 50000,
    stage_id: "stage-1",
    client_name: "Mariana Monteiro",
    company_name: "Área Tech",
    responsible: TEAM_MEMBERS[0],
    tag: "PROPOSTA",
    tag_color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    activity_title: "Atividade",
    activity_date: "2 De Set",
    phone: "+5511999990001",
    whatsapp: "5511999990001",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-1791",
    code: "#1791",
    title: "Negócio #1791",
    value: 500,
    stage_id: "stage-1",
    client_name: "João dos Santos",
    company_name: "Santos Log",
    responsible: TEAM_MEMBERS[0],
    tag: "CONTATO",
    tag_color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    activity_title: "Atividade",
    activity_date: "1 De Jul",
    phone: "+5511999990002",
    whatsapp: "5511999990002",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4483",
    code: "#4483",
    title: "Negócio #4483",
    value: 10100,
    stage_id: "stage-2",
    client_name: "Antônio Correia Assis",
    company_name: "Área Tech",
    responsible: TEAM_MEMBERS[0],
    tag: "DOCUMENTOS",
    tag_color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    activity_title: "Atividade",
    activity_date: "21 De Ago",
    phone: "+5511999990003",
    whatsapp: "5511999990003",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4732",
    code: "#4732",
    title: "Negócio #4732 João",
    value: 750,
    stage_id: "stage-2",
    client_name: "Cristiano Brito",
    company_name: "Brito Soluções",
    responsible: TEAM_MEMBERS[0],
    tag: "PROPOSTA",
    tag_color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    activity_title: "Atividade",
    activity_date: "2 De Jul",
    phone: "+5511999990004",
    whatsapp: "5511999990004",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-211",
    code: "#211",
    title: "Negócio #211",
    value: 750,
    stage_id: "stage-3",
    client_name: "Carlos Eduardo",
    company_name: "Eduardo & Cia",
    responsible: TEAM_MEMBERS[1],
    tag: "NEGOCIAÇÃO",
    tag_color: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    activity_title: "Atividade",
    activity_date: "27 De Ago",
    phone: "+5511999990005",
    whatsapp: "5511999990005",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4227",
    code: "#4227",
    title: "Negócio #4227",
    value: 0,
    stage_id: "stage-4",
    client_name: "Loja Almeida",
    company_name: "Almeida Varejo",
    responsible: TEAM_MEMBERS[0],
    tag: "ANÁLISE",
    tag_color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    activity_title: "Atividade",
    activity_date: "24 De Jul",
    phone: "+5511999990006",
    whatsapp: "5511999990006",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4477",
    code: "#4477",
    title: "Negócio #4477",
    value: 0,
    stage_id: "stage-4",
    client_name: "Fernando Vasconcelos",
    company_name: "Vasconcelos Adv",
    responsible: TEAM_MEMBERS[0],
    tag: "PROPOSTA",
    tag_color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    activity_title: "Atividade",
    activity_date: "22 De Jul",
    phone: "+5511999990007",
    whatsapp: "5511999990007",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-3955",
    code: "#3955",
    title: "Negócio #3955",
    value: 30110,
    stage_id: "stage-5",
    client_name: "D&W",
    company_name: "D&W Distribuidora",
    responsible: TEAM_MEMBERS[1],
    tag: "CONTRATO",
    tag_color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    activity_title: "Atividade",
    activity_date: "11 De Jun",
    phone: "+5511999990008",
    whatsapp: "5511999990008",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4153",
    code: "#4153",
    title: "Negócio #4153",
    value: 84700,
    stage_id: "stage-5",
    client_name: "Tânia Ribeiro",
    company_name: "Ribeiro Group",
    responsible: TEAM_MEMBERS[2],
    tag: "FATURA",
    tag_color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
    activity_title: "Atividade",
    activity_date: "28 Out 2024",
    phone: "+5511999990009",
    whatsapp: "5511999990009",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4955",
    code: "#4955",
    title: "Negócio #4955 Site",
    value: 3730,
    stage_id: "stage-6",
    client_name: "Julia Lima Costa",
    company_name: "Costa Criativa",
    responsible: TEAM_MEMBERS[3],
    tag: "EM ANDAMENTO",
    tag_color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    activity_title: "Atividade",
    activity_date: "29 Set",
    phone: "+5511999990010",
    whatsapp: "5511999990010",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4311",
    code: "#4311",
    title: "Negócio #4311",
    value: 780,
    stage_id: "stage-6",
    client_name: "Sam nome Lead #67",
    company_name: "Sam Store",
    responsible: TEAM_MEMBERS[0],
    tag: "ENTREGA",
    tag_color: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    activity_title: "Atividade",
    activity_date: "28 Nov",
    phone: "+5511999990011",
    whatsapp: "5511999990011",
    status: "open",
    created_at: new Date().toISOString(),
  },
];

const BRL = (num: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(num);

export function PipelinePage() {
  const qc = useQueryClient();
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

  // Salvar estágios localmente
  const saveStages = (updated: PipelineStage[]) => {
    setStages(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_stages_store", JSON.stringify(updated));
    }
  };

  // Filtros
  const [selectedResponsible, setSelectedResponsible] = useState<string>("all");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [activeRibbonStage, setActiveRibbonStage] = useState<string>("stage-1");

  // Drag & Drop
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Modal de Criação / Edição de Negócio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [modalStageId, setModalStageId] = useState<string>("stage-1");

  // Modal de Criação / Edição de Coluna (Etapa)
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");
  const [stageColor, setStageColor] = useState("#FF6B00");
  const [stageInsertPosition, setStageInsertPosition] = useState<number>(0);

  // Form State do Negócio
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formResponsibleId, setFormResponsibleId] = useState("user-1");
  const [formTag, setFormTag] = useState("PROPOSTA");
  const [formActivityDate, setFormActivityDate] = useState("Hoje");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Persistir negócios localmente
  const saveDeals = (updated: DealItem[]) => {
    setDeals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_deals_store", JSON.stringify(updated));
    }
  };

  // Abrir Modal de Edição de Etapa
  const handleOpenEditStageModal = (stage: PipelineStage) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageColor(stage.color || "#FF6B00");
    setIsStageModalOpen(true);
  };

  // Abrir Modal de Nova Etapa
  const handleOpenAddStageModal = (position?: number) => {
    setEditingStageId(null);
    setStageName("");
    setStageColor("#FF6B00");
    setStageInsertPosition(position ?? stages.length);
    setIsStageModalOpen(true);
  };

  // Salvar Etapa (Criar ou Atualizar)
  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) {
      return toast.error("Informe o nome da etapa");
    }

    if (editingStageId) {
      const updated = stages.map((s) =>
        s.id === editingStageId ? { ...s, name: stageName, color: stageColor } : s
      );
      saveStages(updated);
      toast.success("Coluna atualizada!");
    } else {
      const newStage: PipelineStage = {
        id: `stage-${Date.now()}`,
        name: stageName,
        color: stageColor,
        position: stageInsertPosition,
      };
      const updated = [...stages, newStage];
      saveStages(updated);
      toast.success("Nova coluna criada no funil!");
    }

    setIsStageModalOpen(false);
  };

  // Excluir Etapa
  const handleDeleteStage = (stageId: string) => {
    if (stages.length <= 1) {
      return toast.error("O funil precisa ter pelo menos 1 coluna");
    }
    const updated = stages.filter((s) => s.id !== stageId);
    saveStages(updated);
    toast.success("Coluna removida do funil");
  };


  // Buscar clientes relacionais do Supabase se existirem
  const { data: dbLeads = [] } = useQuery({
    queryKey: ["relational-leads"],
    queryFn: async () => {
      try {
        const { data } = await supabase.from("leads").select("id, name, company, phone, whatsapp");
        return data ?? [];
      } catch {
        return [];
      }
    },
  });

  // Cálculo de estatísticas por etapa
  const stageStats = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    stages.forEach((s) => map.set(s.id, { count: 0, totalValue: 0 }));

    deals.forEach((deal) => {
      const cur = map.get(deal.stage_id) || { count: 0, totalValue: 0 };
      map.set(deal.stage_id, {
        count: cur.count + 1,
        totalValue: cur.totalValue + Number(deal.value || 0),
      });
    });
    return map;
  }, [stages, deals]);

  // Filtragem de Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (selectedResponsible !== "all" && deal.responsible.id !== selectedResponsible) {
        return false;
      }
      if (selectedStageFilter !== "all" && deal.stage_id !== selectedStageFilter) {
        return false;
      }
      return true;
    });
  }, [deals, selectedResponsible, selectedStageFilter]);

  // Handlers de Drag and Drop
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStageId !== stageId) setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain") || draggingDealId;
    setDragOverStageId(null);
    setDraggingDealId(null);

    if (!dealId) return;

    const updated = deals.map((d) =>
      d.id === dealId ? { ...d, stage_id: targetStageId } : d
    );
    saveDeals(updated);
    toast.success("Negócio movido com sucesso!");
  };

  // Abrir Modal de Criação Rápida
  const handleOpenCreateModal = (stageId: string = "stage-1") => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setEditingDealId(null);
    setModalStageId(stageId);
    setFormCode(`#${randomNum}`);
    setFormTitle(`Negócio #${randomNum}`);
    setFormValue("");
    setFormClientName("");
    setFormCompanyName("");
    setFormResponsibleId(TEAM_MEMBERS[0].id);
    setFormTag("PROPOSTA");
    setFormActivityDate("Hoje");
    setFormPhone("");
    setFormWhatsapp("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (deal: DealItem) => {
    setEditingDealId(deal.id);
    setModalStageId(deal.stage_id);
    setFormCode(deal.code);
    setFormTitle(deal.title);
    setFormValue(String(deal.value));
    setFormClientName(deal.client_name);
    setFormCompanyName(deal.company_name);
    setFormResponsibleId(deal.responsible.id);
    setFormTag(deal.tag);
    setFormActivityDate(deal.activity_date);
    setFormPhone(deal.phone || "");
    setFormWhatsapp(deal.whatsapp || "");
    setFormNotes(deal.notes || "");
    setIsModalOpen(true);
  };

  // Salvar Deal (Criar ou Atualizar)
  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      return toast.error("Informe o título do negócio");
    }

    const resp = TEAM_MEMBERS.find((m) => m.id === formResponsibleId) || TEAM_MEMBERS[0];
    const val = Number(formValue.replace(/[^0-9]/g, "")) || Number(formValue) || 0;

    let tagColor = "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300";
    if (formTag === "CONTATO") tagColor = "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    if (formTag === "DOCUMENTOS") tagColor = "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    if (formTag === "NEGOCIAÇÃO") tagColor = "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
    if (formTag === "CONTRATO") tagColor = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
    if (formTag === "FATURA") tagColor = "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300";
    if (formTag === "ENTREGA" || formTag === "EM ANDAMENTO") tagColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";

    if (editingDealId) {
      const updated = deals.map((d) => {
        if (d.id === editingDealId) {
          return {
            ...d,
            code: formCode,
            title: formTitle,
            value: val,
            stage_id: modalStageId,
            client_name: formClientName || "Cliente",
            company_name: formCompanyName || "Empresa",
            responsible: resp,
            tag: formTag,
            tag_color: tagColor,
            activity_date: formActivityDate,
            phone: formPhone,
            whatsapp: formWhatsapp,
            notes: formNotes,
          };
        }
        return d;
      });
      saveDeals(updated);
      toast.success("Negócio atualizado!");
    } else {
      const newDeal: DealItem = {
        id: `deal-${Date.now()}`,
        code: formCode || `#${Math.floor(1000 + Math.random() * 9000)}`,
        title: formTitle,
        value: val,
        stage_id: modalStageId,
        client_name: formClientName || "Novo Cliente",
        company_name: formCompanyName || "Empresa",
        responsible: resp,
        tag: formTag,
        tag_color: tagColor,
        activity_title: "Atividade",
        activity_date: formActivityDate || "Hoje",
        phone: formPhone,
        whatsapp: formWhatsapp,
        notes: formNotes,
        status: "open",
        created_at: new Date().toISOString(),
      };
      saveDeals([newDeal, ...deals]);
      toast.success("Novo negócio criado!");
    }

    setIsModalOpen(false);
  };

  // Excluir Deal
  const handleDeleteDeal = (dealId: string) => {
    saveDeals(deals.filter((d) => d.id !== dealId));
    toast.success("Negócio removido");
  };

  // Selecionar lead relacional pré-existente
  const handleSelectRelationalLead = (leadId: string) => {
    const found = dbLeads.find((l: any) => l.id === leadId);
    if (found) {
      setFormClientName(found.name || "");
      setFormCompanyName(found.company || "");
      if (found.phone) setFormPhone(found.phone);
      if (found.whatsapp) setFormWhatsapp(found.whatsapp);
    }
  };

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-5rem)]">
      {/* 1. Header com Título e Filtros */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Negócios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe seu pipeline e nunca perca uma oportunidade.
          </p>
        </div>

        {/* Filtros e Botão Novo Negócio */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Responsável */}
          <div className="w-[190px]">
            <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <Users className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Todos os responsáveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os responsáveis</SelectItem>
                {TEAM_MEMBERS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fases */}
          <div className="w-[160px]">
            <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Todas as fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="w-[150px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Novo Negócio */}
          <Button
            onClick={() => handleOpenCreateModal("stage-1")}
            className="h-9 px-4 bg-[#FF6B00] hover:bg-[#E65C00] text-white font-medium shadow-sm gap-1.5 rounded-lg text-xs md:text-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo negócio
          </Button>
        </div>
      </div>

      {/* 2. Régua Horizontal das Etapas (Chevron Funnel Ribbon) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full overflow-x-auto pb-1">
        {stages.map((stage) => {
          const stat = stageStats.get(stage.id) || { count: 0, totalValue: 0 };
          const isActive = activeRibbonStage === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => setActiveRibbonStage(stage.id)}
              className={cn(
                "relative flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border",
                isActive
                  ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm ring-2 ring-[#FF6B00]/20"
                  : "bg-card text-card-foreground border-border/70 hover:border-[#FF6B00]/40 hover:bg-muted/40"
              )}
            >
              <div className="min-w-0 pr-2">
                <p className={cn("text-xs font-semibold truncate", isActive ? "text-white" : "text-foreground")}>
                  {stage.name} <span className={cn("text-[11px] font-normal", isActive ? "text-white/90" : "text-muted-foreground")}>({stat.count})</span>
                </p>
                <p className={cn("text-xs font-bold mt-0.5", isActive ? "text-white" : "text-[#FF6B00]")}>
                  {BRL(stat.totalValue)}
                </p>
              </div>
              <ChevronRight
                className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "text-white translate-x-0.5" : "text-muted-foreground/60")}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Colunas Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start flex-1">
        {stages.map((stage) => {
          const stat = stageStats.get(stage.id) || { count: 0, totalValue: 0 };
          const stageDeals = filteredDeals.filter((d) => d.stage_id === stage.id);
          const isDragOver = dragOverStageId === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={cn(
                "flex flex-col w-[310px] shrink-0 rounded-2xl bg-muted/30 border border-border/60 p-3 transition-colors min-h-[500px]",
                isDragOver && "bg-primary/5 border-primary/40 ring-2 ring-primary/20"
              )}
            >
              {/* Header da Coluna */}
              <div className="flex items-start justify-between mb-3 px-1">
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className="w-1.5 h-7 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: stage.color || "#FF6B00" }}
                  />
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
                      {stage.name}
                      <span className="text-muted-foreground font-normal text-[11px]">
                        ({stat.count})
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-[#FF6B00]">
                      {BRL(stat.totalValue)}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação na Coluna */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenCreateModal(stage.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background rounded-full"
                    title="Adicionar negócio nesta fase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background rounded-full"
                        title="Opções da coluna"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleOpenEditStageModal(stage)}>
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar coluna
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenAddStageModal(stage.position + 1)}>
                        <Plus className="h-3.5 w-3.5 mr-2" /> Inserir coluna
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteStage(stage.id)}
                        className="text-destructive focus:text-destructive"
                        disabled={stages.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir coluna
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Lista de Cards de Negócio */}
              <div className="flex flex-col gap-3 flex-1">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className={cn(
                      "group relative bg-card text-card-foreground rounded-xl p-3.5 border border-border/80 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                      draggingDealId === deal.id && "opacity-50 scale-95"
                    )}
                  >
                    {/* Topo do Card: Código e Menu */}
                    <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                      <span className="font-mono font-medium">{deal.code}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground -mr-1"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditModal(deal)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar negócio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Título e Valor */}
                    <h4
                      onClick={() => handleOpenEditModal(deal)}
                      className="text-xs font-bold text-foreground hover:text-[#FF6B00] cursor-pointer transition-colors leading-tight"
                    >
                      {deal.title}
                    </h4>
                    <p className="text-sm font-extrabold text-foreground mt-1">
                      {BRL(deal.value)}
                    </p>

                    {/* Contato e Empresa */}
                    <div className="mt-2 text-xs text-muted-foreground leading-snug">
                      <p className="text-foreground/90 font-medium">{deal.client_name}</p>
                      {deal.company_name && (
                        <p className="text-muted-foreground text-[11px]">{deal.company_name}</p>
                      )}
                    </div>

                    {/* Responsável */}
                    <div className="mt-2.5">
                      <p className="text-[10px] text-muted-foreground mb-1">Pessoas responsáveis</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Avatar className="h-5 w-5 ring-1 ring-border">
                            <AvatarImage src={deal.responsible.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {deal.responsible.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] font-medium text-foreground truncate max-w-[130px]">
                            {deal.responsible.name}
                          </span>
                        </div>

                        {/* Avatar secundário decorativo se houver */}
                        <Avatar className="h-4 w-4 opacity-80 ring-1 ring-border">
                          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" />
                          <AvatarFallback className="text-[8px]">F</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Tag e Ações Rápidas (Telefone / WhatsApp) */}
                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase",
                          deal.tag_color
                        )}
                      >
                        {deal.tag}
                      </span>

                      <div className="flex items-center gap-1">
                        {deal.phone && (
                          <a
                            href={`tel:${deal.phone}`}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Ligar"
                          >
                            <Phone className="h-3 w-3" />
                          </a>
                        )}
                        {deal.whatsapp && (
                          <a
                            href={`https://wa.me/${deal.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Rodapé: Próxima Atividade */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-muted-foreground/80">
                        <Calendar className="h-3 w-3" />
                        {deal.activity_title}
                      </span>
                      <span className="font-medium text-foreground/80">
                        {deal.activity_date}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Card Inline "Adicionar Negócio" */}
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(stage.id)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/80 hover:border-[#FF6B00] hover:bg-card/70 transition-all text-muted-foreground hover:text-[#FF6B00] gap-1.5 text-xs font-semibold group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <span>Adicionar negócio</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Botão para Criar Nova Coluna / Etapa no Final */}
        <button
          type="button"
          onClick={() => handleOpenAddStageModal(stages.length)}
          className="flex flex-col items-center justify-center w-[240px] shrink-0 min-h-[140px] rounded-2xl border-2 border-dashed border-border/80 hover:border-[#FF6B00] bg-muted/20 hover:bg-card text-muted-foreground hover:text-[#FF6B00] gap-2 font-semibold text-xs transition-all cursor-pointer p-5 group"
        >
          <div className="h-9 w-9 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span>+ Nova Coluna / Etapa</span>
        </button>
      </div>

      {/* 4. Modal de Criação / Edição de Negócio */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              {editingDealId ? "Editar Negócio" : "Criar Novo Negócio"}
              <span className="text-xs font-normal text-muted-foreground">
                (Relacionamentos & Funil)
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveDeal} className="space-y-4 pt-2">
            {/* Título & Código */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="deal-title" className="text-xs">Título do Negócio *</Label>
                <Input
                  id="deal-title"
                  placeholder="Ex: Negócio #1789"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deal-code" className="text-xs">Código</Label>
                <Input
                  id="deal-code"
                  placeholder="#1789"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
            </div>

            {/* Valor e Etapa */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deal-val" className="text-xs">Valor (R$)</Label>
                <Input
                  id="deal-val"
                  type="number"
                  placeholder="50000"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Etapa do Funil</Label>
                <Select value={modalStageId} onValueChange={setModalStageId}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vínculo Relacional com Cliente/Lead */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#FF6B00]" />
                  Cliente / Contato Relacional
                </Label>
                {dbLeads.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Ou selecione um lead existente
                  </span>
                )}
              </div>

              {dbLeads.length > 0 && (
                <Select onValueChange={handleSelectRelationalLead}>
                  <SelectTrigger className="h-8 bg-card text-xs">
                    <SelectValue placeholder="Vincular a um lead existente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dbLeads.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.company ? `(${l.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="client-name" className="text-[11px] text-muted-foreground">Nome do Contato</Label>
                  <Input
                    id="client-name"
                    placeholder="Mariana Monteiro"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company-name" className="text-[11px] text-muted-foreground">Empresa</Label>
                  <Input
                    id="company-name"
                    placeholder="Área Tech"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="client-phone" className="text-[11px] text-muted-foreground">Telefone</Label>
                  <Input
                    id="client-phone"
                    placeholder="+55 11 99999-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="client-wpp" className="text-[11px] text-muted-foreground">WhatsApp</Label>
                  <Input
                    id="client-wpp"
                    placeholder="5511999990000"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              </div>
            </div>

            {/* Responsável & Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Responsável pela Conta</Label>
                <Select value={formResponsibleId} onValueChange={setFormResponsibleId}>
                  <SelectTrigger className="h-9">
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
                <Label className="text-xs">Tag do Negócio</Label>
                <Select value={formTag} onValueChange={setFormTag}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPOSTA">PROPOSTA</SelectItem>
                    <SelectItem value="CONTATO">CONTATO</SelectItem>
                    <SelectItem value="DOCUMENTOS">DOCUMENTOS</SelectItem>
                    <SelectItem value="NEGOCIAÇÃO">NEGOCIAÇÃO</SelectItem>
                    <SelectItem value="ANÁLISE">ANÁLISE</SelectItem>
                    <SelectItem value="CONTRATO">CONTRATO</SelectItem>
                    <SelectItem value="FATURA">FATURA</SelectItem>
                    <SelectItem value="EM ANDAMENTO">EM ANDAMENTO</SelectItem>
                    <SelectItem value="ENTREGA">ENTREGA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Próxima Atividade */}
            <div className="space-y-1.5">
              <Label htmlFor="activity-date" className="text-xs">Data da Próxima Atividade</Label>
              <Input
                id="activity-date"
                placeholder="Ex: 2 De Set"
                value={formActivityDate}
                onChange={(e) => setFormActivityDate(e.target.value)}
              />
            </div>

            {/* Notas / Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">Observações do Negócio</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre a negociação..."
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#E65C00] text-white"
              >
                {editingDealId ? "Salvar Alterações" : "Criar Negócio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Modal de Criação / Edição de Coluna (Etapa) */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#FF6B00]" />
              {editingStageId ? "Editar Coluna do Funil" : "Nova Coluna no Funil"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveStage} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="stage-name" className="text-xs">Nome da Etapa / Coluna *</Label>
              <Input
                id="stage-name"
                placeholder="Ex: Em Qualificação"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cor da Coluna</Label>
              <div className="grid grid-cols-5 gap-2">
                {STAGE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setStageColor(c.value)}
                    className={cn(
                      "flex items-center justify-center h-8 rounded-lg border text-[11px] font-bold text-white transition-all cursor-pointer",
                      stageColor === c.value ? "ring-2 ring-foreground scale-105" : "opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {stageColor === c.value && "✓"}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 flex justify-between items-center sm:justify-between">
              {editingStageId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    handleDeleteStage(editingStageId);
                    setIsStageModalOpen(false);
                  }}
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  disabled={stages.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStageModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FF6B00] hover:bg-[#E65C00] text-white"
                >
                  {editingStageId ? "Salvar Coluna" : "Criar Coluna"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


