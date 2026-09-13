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
  DropdownMenuSeparator,
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
  Filter,
  Trash2,
  Edit2,
  User,
  Settings2,
  Palette,
  LayoutGrid,
  Rows3,
  Tag,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({ meta: [{ title: "Funil de Leads · Focus CRM" }] }),
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

export interface TagItem {
  id: string;
  name: string;
  color: string;
}

export interface DealItem {
  id: string;
  code?: string;
  title: string;
  value: number;
  stage_id: string;
  lead_id?: string;
  client_name: string;
  company_name: string;
  responsible: TeamMember;
  co_responsible?: TeamMember;
  tag_ids?: string[];
  tag?: string;
  tag_color?: string;
  activity_title: string;
  activity_date: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  status: "open" | "won" | "lost";
  created_at: string;
}

// Paleta de Cores Trello Style para Etiquetas
export const TAG_PALETTE = [
  { label: "Laranja Focus", value: "#FF6B00" },
  { label: "Vermelho Urgente", value: "#EF4444" },
  { label: "Coral Quente", value: "#F97316" },
  { label: "Âmbar Alerta", value: "#F59E0B" },
  { label: "Verde Esmeralda", value: "#10B981" },
  { label: "Ciano Destaque", value: "#06B6D4" },
  { label: "Azul Primário", value: "#3B82F6" },
  { label: "Índigo Profundo", value: "#6366F1" },
  { label: "Roxo VIP", value: "#8B5CF6" },
  { label: "Rosa Negócio", value: "#EC4899" },
  { label: "Grafite Neutro", value: "#64748B" },
];

// Etiquetas Relacionais Iniciais (Trello Style)
export const INITIAL_TAGS: TagItem[] = [
  { id: "tag-proposta", name: "PROPOSTA", color: "#FF6B00" },
  { id: "tag-contato", name: "CONTATO", color: "#3B82F6" },
  { id: "tag-docs", name: "DOCUMENTOS", color: "#F59E0B" },
  { id: "tag-urgente", name: "URGENTE", color: "#EF4444" },
  { id: "tag-vip", name: "CLIENTE VIP", color: "#8B5CF6" },
  { id: "tag-negociacao", name: "NEGOCIAÇÃO", color: "#EC4899" },
  { id: "tag-analise", name: "ANÁLISE", color: "#6366F1" },
  { id: "tag-contrato", name: "CONTRATO", color: "#06B6D4" },
  { id: "tag-fatura", name: "FATURA", color: "#A855F7" },
  { id: "tag-andamento", name: "EM ANDAMENTO", color: "#10B981" },
  { id: "tag-entrega", name: "ENTREGA", color: "#14B8A6" },
];

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

  // 1. Estados Relacionais: Estágios, Etiquetas e Negócios
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

  const [tags, setTags] = useState<TagItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_tags_store");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_TAGS;
  });

  const [deals, setDeals] = useState<DealItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_deals_store");
      if (saved) {
        try {
          const parsed: DealItem[] = JSON.parse(saved);
          return parsed.map((d) => {
            if (!d.tag_ids || d.tag_ids.length === 0) {
              if (d.tag) {
                const found = INITIAL_TAGS.find((t) => t.name.toLowerCase() === d.tag?.toLowerCase());
                return { ...d, tag_ids: found ? [found.id] : ["tag-proposta"] };
              }
              return { ...d, tag_ids: [] };
            }
            return d;
          });
        } catch {}
      }
    }
    return INITIAL_DEALS;
  });

  // Modo de Visualização do Card (Detalhado vs Resumido/Minimizado)
  const [cardViewMode, setCardViewMode] = useState<"detailed" | "compact">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_card_view_mode");
      if (saved === "compact" || saved === "detailed") return saved;
    }
    return "detailed";
  });

  const handleSetCardViewMode = (mode: "detailed" | "compact") => {
    setCardViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_card_view_mode", mode);
    }
  };

  // Salvar estágios localmente
  const saveStages = (updated: PipelineStage[]) => {
    setStages(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_stages_store", JSON.stringify(updated));
    }
  };

  // Salvar etiquetas localmente
  const saveTags = (updated: TagItem[]) => {
    setTags(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_tags_store", JSON.stringify(updated));
    }
  };

  // Persistir negócios localmente
  const saveDeals = (updated: DealItem[]) => {
    setDeals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_deals_store", JSON.stringify(updated));
    }
  };

  // Helper para resolver lista de tags de um negócio
  const getDealTags = (deal: DealItem): TagItem[] => {
    if (deal.tag_ids && deal.tag_ids.length > 0) {
      return deal.tag_ids
        .map((id) => tags.find((t) => t.id === id))
        .filter((t): t is TagItem => Boolean(t));
    }
    if (deal.tag) {
      const found = tags.find((t) => t.name.toLowerCase() === deal.tag?.toLowerCase());
      if (found) return [found];
    }
    return [];
  };

  // Alternar tag diretamente do card em 1 clique
  const handleToggleDealTag = (dealId: string, tagId: string) => {
    const updated = deals.map((d) => {
      if (d.id !== dealId) return d;
      const current = d.tag_ids || [];
      const exists = current.includes(tagId);
      const next = exists ? current.filter((id) => id !== tagId) : [...current, tagId];
      return { ...d, tag_ids: next };
    });
    saveDeals(updated);
  };

  // Filtros
  const [selectedResponsible, setSelectedResponsible] = useState<string>("all");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");

  // Ocultar / Mostrar Valores Financeiros
  const [hideFinancialValues, setHideFinancialValues] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("focus_crm_pipeline_hide_values") === "true";
    }
    return false;
  });

  const toggleHideFinancialValues = () => {
    setHideFinancialValues((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("focus_crm_pipeline_hide_values", String(next));
      }
      return next;
    });
  };

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

  // Modal de Criação / Gerenciamento de Etiquetas (Tags)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#FF6B00");

  // Form State do Negócio
  const [formTitle, setFormTitle] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formResponsibleId, setFormResponsibleId] = useState("user-1");
  const [formTagIds, setFormTagIds] = useState<string[]>(["tag-proposta"]);
  const [formActivityDate, setFormActivityDate] = useState("Hoje");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Abrir Modal de Edição de Etapa
  const handleOpenEditStageModal = (stage: PipelineStage) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageColor(stage.color || "#FF6B00");
    setIsStageModalOpen(true);
  };

  // Abrir Modal de Inserção de Nova Coluna
  const handleOpenAddStageModal = () => {
    setEditingStageId(null);
    setStageName("");
    setStageColor(STAGE_COLORS[stages.length % STAGE_COLORS.length].value);
    setIsStageModalOpen(true);
  };

  // Salvar Etapa (Criar ou Atualizar)
  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) {
      return toast.error("Informe o nome da coluna");
    }

    if (editingStageId) {
      const updated = stages.map((s) =>
        s.id === editingStageId ? { ...s, name: stageName.trim(), color: stageColor } : s
      );
      saveStages(updated);
      toast.success("Coluna atualizada com sucesso!");
    } else {
      const newStage: PipelineStage = {
        id: `stage-${Date.now()}`,
        name: stageName.trim(),
        color: stageColor,
        position: stages.length,
      };
      saveStages([...stages, newStage]);
      toast.success("Nova coluna criada com sucesso!");
    }

    setIsStageModalOpen(false);
  };

  // Excluir Etapa
  const handleDeleteStage = (stageId: string) => {
    if (stages.length <= 1) {
      return toast.error("O funil deve conter ao menos uma coluna.");
    }
    const updatedStages = stages.filter((s) => s.id !== stageId);
    saveStages(updatedStages);

    const fallbackStageId = updatedStages[0].id;
    const updatedDeals = deals.map((d) =>
      d.stage_id === stageId ? { ...d, stage_id: fallbackStageId } : d
    );
    saveDeals(updatedDeals);

    toast.success("Coluna removida.");
  };

  // Abrir Modal de Criação / Edição de Etiqueta
  const handleOpenCreateTagModal = (tagToEdit?: TagItem) => {
    if (tagToEdit) {
      setEditingTagId(tagToEdit.id);
      setTagName(tagToEdit.name);
      setTagColor(tagToEdit.color);
    } else {
      setEditingTagId(null);
      setTagName("");
      setTagColor(TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)].value);
    }
    setIsTagModalOpen(true);
  };

  // Salvar Etiqueta
  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      return toast.error("Informe o nome da etiqueta");
    }

    const cleanName = tagName.trim().toUpperCase();

    if (editingTagId) {
      const updated = tags.map((t) =>
        t.id === editingTagId ? { ...t, name: cleanName, color: tagColor } : t
      );
      saveTags(updated);
      toast.success("Etiqueta atualizada!");
    } else {
      const newTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: cleanName,
        color: tagColor,
      };
      const updated = [...tags, newTag];
      saveTags(updated);
      setFormTagIds((prev) => [...prev, newTag.id]);
      toast.success(`Etiqueta "${cleanName}" criada com sucesso!`);
    }

    setIsTagModalOpen(false);
  };

  // Excluir Etiqueta
  const handleDeleteTag = (tagId: string) => {
    const updated = tags.filter((t) => t.id !== tagId);
    saveTags(updated);
    const updatedDeals = deals.map((d) => ({
      ...d,
      tag_ids: (d.tag_ids || []).filter((id) => id !== tagId),
    }));
    saveDeals(updatedDeals);
    setFormTagIds((prev) => prev.filter((id) => id !== tagId));
    toast.success("Etiqueta removida.");
  };

  // Carregar leads do Supabase para autocomplete relacional
  const { data: dbLeads = [] } = useQuery({
    queryKey: ["leads-autocomplete"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, company, phone, whatsapp, tags")
        .limit(100);
      if (error) return [];
      return data || [];
    },
  });

  // Filtragem de Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (selectedResponsible !== "all" && deal.responsible.id !== selectedResponsible) {
        return false;
      }
      if (selectedStageFilter !== "all" && deal.stage_id !== selectedStageFilter) {
        return false;
      }
      if (selectedTagFilter !== "all") {
        const dealTags = deal.tag_ids || [];
        if (!dealTags.includes(selectedTagFilter)) return false;
      }
      return true;
    });
  }, [deals, selectedResponsible, selectedStageFilter, selectedTagFilter]);

  // Estatísticas por Etapa
  const stageStats = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    stages.forEach((s) => map.set(s.id, { count: 0, totalValue: 0 }));

    filteredDeals.forEach((deal) => {
      const curr = map.get(deal.stage_id) || { count: 0, totalValue: 0 };
      map.set(deal.stage_id, {
        count: curr.count + 1,
        totalValue: curr.totalValue + Number(deal.value || 0),
      });
    });

    return map;
  }, [stages, filteredDeals]);

  // Total do Pipeline filtrado
  const totalPipelineValue = useMemo(() => {
    return filteredDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  }, [filteredDeals]);

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
    setEditingDealId(null);
    setModalStageId(stageId);
    setFormTitle("Novo Negócio");
    setFormValue("");
    setFormClientName("");
    setFormCompanyName("");
    setFormResponsibleId(TEAM_MEMBERS[0].id);
    setFormTagIds(["tag-proposta"]);
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
    setFormTitle(deal.title);
    setFormValue(String(deal.value));
    setFormClientName(deal.client_name);
    setFormCompanyName(deal.company_name);
    setFormResponsibleId(deal.responsible.id);
    setFormTagIds(deal.tag_ids || (deal.tag ? ["tag-proposta"] : []));
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
    const val = Number(formValue) || 0;

    if (editingDealId) {
      const updated = deals.map((d) =>
        d.id === editingDealId
          ? {
              ...d,
              title: formTitle.trim(),
              value: val,
              stage_id: modalStageId,
              client_name: formClientName.trim() || "Cliente",
              company_name: formCompanyName.trim(),
              responsible: resp,
              tag_ids: formTagIds,
              activity_date: formActivityDate.trim() || "Hoje",
              phone: formPhone.trim(),
              whatsapp: formWhatsapp.trim(),
              notes: formNotes.trim(),
            }
          : d
      );
      saveDeals(updated);
      toast.success("Negócio atualizado com sucesso!");
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newDeal: DealItem = {
        id: `deal-${Date.now()}`,
        code: `#${randomNum}`,
        title: formTitle.trim(),
        value: val,
        stage_id: modalStageId,
        client_name: formClientName.trim() || "Cliente Novo",
        company_name: formCompanyName.trim() || "",
        responsible: resp,
        tag_ids: formTagIds,
        activity_title: "Atividade",
        activity_date: formActivityDate.trim() || "Hoje",
        phone: formPhone.trim(),
        whatsapp: formWhatsapp.trim(),
        notes: formNotes.trim(),
        status: "open",
        created_at: new Date().toISOString(),
      };
      saveDeals([newDeal, ...deals]);
      toast.success("Negócio adicionado ao funil!");
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
    <div className="flex flex-col gap-3.5 min-h-[calc(100vh-5rem)]">
      {/* 1. Header com Título e Filtros */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Funil de Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe seu funil de leads e nunca perca uma oportunidade.
          </p>
        </div>

        {/* Filtros, Alternador de Visualização, Gerenciador de Tags e Botão Novo Negócio */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {/* Alternador de Visualização: Ícones Apenas (Detalhado vs Resumido) */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80 shrink-0">
            <button
              type="button"
              onClick={() => handleSetCardViewMode("detailed")}
              className={cn(
                "h-8 w-8 text-xs font-medium rounded-md flex items-center justify-center transition-all cursor-pointer",
                cardViewMode === "detailed"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização Detalhada"
              aria-label="Visualização Detalhada"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSetCardViewMode("compact")}
              className={cn(
                "h-8 w-8 text-xs font-medium rounded-md flex items-center justify-center transition-all cursor-pointer",
                cardViewMode === "compact"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização Resumida"
              aria-label="Visualização Resumida"
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>

          {/* Filtro por Etiqueta */}
          <div className="w-[150px] shrink-0">
            <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <Tag className="mr-1.5 h-3.5 w-3.5 text-[#FF6B00]" />
                <SelectValue placeholder="Etiquetas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etiquetas</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsável */}
          <div className="w-[155px] shrink-0">
            <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <Users className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Responsável" />
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
          <div className="w-[135px] shrink-0">
            <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
              <SelectTrigger className="h-9 bg-card text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Fases" />
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

          {/* Botão Ocultar / Mostrar Valores Financeiros: Minimalista apenas Ícone */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleHideFinancialValues}
            className={cn(
              "h-9 w-9 bg-card border-border/80 shrink-0 transition-colors cursor-pointer",
              hideFinancialValues
                ? "text-muted-foreground border-border hover:text-foreground"
                : "text-foreground hover:text-[#FF6B00]"
            )}
            title={hideFinancialValues ? "Mostrar valores financeiros" : "Ocultar valores financeiros"}
            aria-label={hideFinancialValues ? "Mostrar valores financeiros" : "Ocultar valores financeiros"}
          >
            {hideFinancialValues ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-[#FF6B00]" />
            )}
          </Button>

          {/* Botão Gerenciar Etiquetas: Apenas Ícone */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenCreateTagModal()}
            className="h-9 w-9 bg-card border-border/80 text-foreground hover:text-[#FF6B00] shrink-0"
            title="Gerenciar etiquetas"
            aria-label="Gerenciar etiquetas"
          >
            <Tag className="h-4 w-4 text-[#FF6B00]" />
          </Button>

          {/* Botão Novo Negócio: Ícone '+' na mesma linha */}
          <Button
            size="icon"
            onClick={() => handleOpenCreateModal("stage-1")}
            className="h-9 w-9 bg-[#FF6B00] hover:bg-[#E65C00] text-white rounded-lg shadow-sm shrink-0"
            title="Novo negócio"
            aria-label="Novo negócio"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {/* 2. Colunas Kanban com Cards */}
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
              {/* Header da Coluna Clean */}
              <div className="flex items-start justify-between mb-3 px-1">
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className="w-1.5 h-7 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: stage.color || "#FF6B00" }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1 truncate">
                      <span>{stage.name}</span>
                      <span className="text-muted-foreground font-normal text-[11px] shrink-0">
                        ({stat.count})
                      </span>
                    </h3>
                    {!hideFinancialValues && (
                      <p className="text-xs font-bold text-[#FF6B00]">
                        {BRL(stat.totalValue)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botões de Ação na Coluna */}
                <div className="flex items-center gap-0.5 shrink-0">
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
                      <DropdownMenuItem onClick={() => handleOpenAddStageModal()}>
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
              <div className="flex flex-col gap-2.5 flex-1">
                {stageDeals.map((deal) => {
                  const dealTags = getDealTags(deal);

                  return cardViewMode === "compact" ? (
                    /* Card Resumido / Minimizado */
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className={cn(
                        "group relative bg-card text-card-foreground rounded-xl p-3 border border-border/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                        draggingDealId === deal.id && "opacity-50 scale-95"
                      )}
                    >
                      {/* Topo do Card: Etiquetas */}
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1 flex-wrap min-w-0 flex-1">
                          {dealTags.map((tag) => (
                            <span
                              key={tag.id}
                              style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color,
                                borderColor: `${tag.color}35`,
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border shadow-2xs"
                              title={tag.name}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="truncate max-w-[85px]">{tag.name}</span>
                            </span>
                          ))}
                        </div>

                        {/* Menu de Ações do Card */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground -mr-1"
                              >
                                <MoreVertical className="h-3 w-3" />
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
                      </div>

                      {/* Título & Valor */}
                      <div className="flex items-start justify-between gap-1.5">
                        <h4
                          onClick={() => handleOpenEditModal(deal)}
                          className="text-xs font-semibold text-foreground hover:text-[#FF6B00] cursor-pointer truncate transition-colors flex-1"
                        >
                          {deal.title}
                        </h4>
                        {!hideFinancialValues && (
                          <span className="font-bold text-foreground text-xs shrink-0">
                            {BRL(deal.value)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {deal.client_name} {deal.company_name ? `· ${deal.company_name}` : ""}
                      </p>

                      {/* Rodapé Compacto com Contato & Avatar */}
                      <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {deal.activity_date}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {deal.whatsapp && (
                            <a
                              href={`https://wa.me/${deal.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-emerald-500 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </a>
                          )}
                          <Avatar className="h-4 w-4 ring-1 ring-border">
                            <AvatarImage src={deal.responsible.avatar} />
                            <AvatarFallback className="text-[7px]">
                              {deal.responsible.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Card Detalhado */
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className={cn(
                        "group relative bg-card text-card-foreground rounded-xl p-3.5 border border-border/80 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                        draggingDealId === deal.id && "opacity-50 scale-95"
                      )}
                    >
                      {/* Topo do Card: Etiquetas e Menu */}
                      <div className="flex items-start justify-between gap-1.5 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                          {dealTags.map((tag) => (
                            <span
                              key={tag.id}
                              style={{
                                backgroundColor: `${tag.color}15`,
                                color: tag.color,
                                borderColor: `${tag.color}35`,
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border shadow-2xs transition-transform hover:scale-105"
                              title={tag.name}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="truncate max-w-[120px]">{tag.name}</span>
                            </span>
                          ))}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-foreground -mr-1 shrink-0"
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
                      {!hideFinancialValues && (
                        <p className="text-sm font-extrabold text-foreground mt-1">
                          {BRL(deal.value)}
                        </p>
                      )}

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
                      </div>

                      {/* Rodapé: Próxima Atividade */}
                      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 text-muted-foreground/80">
                          <Calendar className="h-3 w-3" />
                          {deal.activity_title}
                        </span>
                        <span className="font-medium text-foreground/80">
                          {deal.activity_date}
                        </span>
                      </div>
                    </div>
                  );
                })}

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
          onClick={() => handleOpenAddStageModal()}
          className="flex flex-col items-center justify-center w-[240px] shrink-0 min-h-[140px] rounded-2xl border-2 border-dashed border-border/80 hover:border-[#FF6B00] bg-muted/20 hover:bg-card text-muted-foreground hover:text-[#FF6B00] gap-2 font-semibold text-xs transition-all cursor-pointer p-5 group"
        >
          <div className="h-9 w-9 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span>+ Nova Coluna / Etapa</span>
        </button>
      </div>

      {/* 3. Modal de Criação / Edição de Negócio */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              {editingDealId ? "Editar Negócio" : "Criar Novo Negócio"}
              <span className="text-xs font-normal text-muted-foreground">
                (Funil & Relacionamentos)
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveDeal} className="space-y-4 pt-2">
            {/* Título & Valor */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="deal-title" className="text-xs">Título do Negócio *</Label>
                <Input
                  id="deal-title"
                  placeholder="Ex: Consultoria Premium"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
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
            </div>

            {/* Etapa e Responsável */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1.5">
                <Label className="text-xs">Responsável</Label>
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
            </div>

            {/* Seção de ETIQUETAS RELACIONAIS */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#FF6B00]" />
                  Etiquetas do Negócio
                </Label>
                <button
                  type="button"
                  onClick={() => handleOpenCreateTagModal()}
                  className="text-xs text-[#FF6B00] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Nova Etiqueta
                </button>
              </div>

              {/* Badges de Tags Clicáveis / Alternáveis */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => {
                  const isSelected = formTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormTagIds(formTagIds.filter((id) => id !== t.id));
                        } else {
                          setFormTagIds([...formTagIds, t.id]);
                        }
                      }}
                      style={{
                        backgroundColor: isSelected ? t.color : `${t.color}15`,
                        color: isSelected ? "#FFFFFF" : t.color,
                        borderColor: isSelected ? t.color : `${t.color}40`,
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase border transition-all cursor-pointer shadow-2xs",
                        isSelected ? "scale-105 shadow-xs" : "hover:opacity-80"
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                      )}
                      <span>{t.name}</span>
                    </button>
                  );
                })}
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

            {/* Observações */}
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

      {/* 4. Modal de Criação / Edição / Gerenciamento de Etiquetas (Tags) */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#FF6B00]" />
              {editingTagId ? "Editar Etiqueta" : "Nova Etiqueta"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTag} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="tag-name" className="text-xs">Nome da Etiqueta *</Label>
              <Input
                id="tag-name"
                placeholder="Ex: URGENTE, VIP, PROPOSTA"
                required
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>

            {/* Paleta de Cores */}
            <div className="space-y-2">
              <Label className="text-xs">Cor da Etiqueta</Label>
              <div className="grid grid-cols-5 gap-2">
                {TAG_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setTagColor(c.value)}
                    className={cn(
                      "flex items-center justify-center h-8 rounded-lg border text-[11px] font-bold text-white transition-all cursor-pointer",
                      tagColor === c.value ? "ring-2 ring-foreground scale-105" : "opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {tagColor === c.value && "✓"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview da Etiqueta */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-[11px] text-muted-foreground">Pré-visualização no Card:</Label>
              <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-center border border-border/60">
                <span
                  style={{
                    backgroundColor: `${tagColor}15`,
                    color: tagColor,
                    borderColor: `${tagColor}40`,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase border shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tagColor }} />
                  <span>{tagName.trim() || "NOME DA ETIQUETA"}</span>
                </span>
              </div>
            </div>

            {/* Lista de Etiquetas Existentes para Gerenciamento */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-[11px] text-muted-foreground">Etiquetas Existentes:</Label>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {tags.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-1.5 rounded-md bg-card border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="font-semibold truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTagId(t.id);
                          setTagName(t.name);
                          setTagColor(t.color);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTag(t.id)}
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        disabled={tags.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 flex justify-between items-center sm:justify-between">
              {editingTagId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    handleDeleteTag(editingTagId);
                    setIsTagModalOpen(false);
                  }}
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  disabled={tags.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTagModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FF6B00] hover:bg-[#E65C00] text-white"
                >
                  {editingTagId ? "Salvar Etiqueta" : "Criar Etiqueta"}
                </Button>
              </div>
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


