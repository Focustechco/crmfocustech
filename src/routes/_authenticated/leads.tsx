import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Phone,
  MessageSquare,
  Mail,
  Building2,
  User,
  Users,
  Tag,
  Check,
  ChevronRight,
  KanbanSquare,
  ExternalLink,
  Calendar,
  Filter,
  LayoutGrid,
  Rows3,
  Eye,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  DollarSign,
  MoreVertical,
  Briefcase,
  FileText,
  Send,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  INITIAL_STAGES,
  INITIAL_DEALS,
  INITIAL_TAGS,
  TEAM_MEMBERS,
  PipelineStage,
  DealItem,
  TagItem,
  TeamMember,
} from "./pipeline";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads · Focus CRM" }] }),
  component: LeadsPage,
});

export interface LeadItem {
  id: string;
  name: string;
  company?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  document?: string;
  website?: string;
  city?: string;
  state?: string;
  source: string;
  potential_value: number;
  status: "novo" | "qualificado" | "desqualificado" | "em_negociacao" | "cliente";
  is_client: boolean;
  stage_id?: string;
  deal_id?: string;
  responsible: TeamMember;
  tag_ids?: string[];
  notes?: string;
  timeline?: { id: string; content: string; date: string; author: string }[];
  created_at: string;
}

const SOURCES = [
  "Meta Ads (Instagram/FB)",
  "Google Ads",
  "Indicação de Cliente",
  "Prospecção Outbound",
  "Site Oficial",
  "WhatsApp Direto",
  "LinkedIn",
  "Evento Presencial",
];

const INITIAL_SAMPLE_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    name: "Mariana Monteiro",
    company: "Área Tech",
    job_title: "Diretora de Operações",
    email: "mariana.monteiro@areatech.com.br",
    phone: "+55 (11) 99999-0001",
    whatsapp: "5511999990001",
    city: "São Paulo",
    state: "SP",
    source: "Meta Ads (Instagram/FB)",
    potential_value: 50000,
    status: "em_negociacao",
    is_client: false,
    stage_id: "stage-1",
    deal_id: "deal-1789",
    responsible: TEAM_MEMBERS[0],
    tag_ids: ["tag-proposta", "tag-vip"],
    notes: "Interessada em pacote anual empresarial para 15 licenças.",
    timeline: [
      { id: "tl-1", content: "Lead recebido via campanha Meta Ads de Alta Conversão", date: "Há 3 dias", author: "Sistema" },
      { id: "tl-2", content: "Primeiro contato telefônico realizado com sucesso. Solicitou envio de proposta comercial.", date: "Há 2 dias", author: "Ana Laura Lima" },
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "lead-2",
    name: "João dos Santos",
    company: "Santos Log",
    job_title: "Gerente Geral",
    email: "joao@santoslog.com.br",
    phone: "+55 (11) 99999-0002",
    whatsapp: "5511999990002",
    city: "Campinas",
    state: "SP",
    source: "Google Ads",
    potential_value: 500,
    status: "novo",
    is_client: false,
    stage_id: "stage-1",
    deal_id: "deal-1791",
    responsible: TEAM_MEMBERS[0],
    tag_ids: ["tag-contato"],
    notes: "Agendado alinhamento via WhatsApp.",
    timeline: [
      { id: "tl-3", content: "Preencheu formulário de contato na landing page.", date: "Há 1 dia", author: "Sistema" },
    ],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "lead-3",
    name: "Antônio Correia Assis",
    company: "Área Tech",
    job_title: "CEO",
    email: "antonio.assis@areatech.com.br",
    phone: "+55 (11) 99999-0003",
    whatsapp: "5511999990003",
    city: "São Paulo",
    state: "SP",
    source: "Indicação de Cliente",
    potential_value: 10100,
    status: "qualificado",
    is_client: false,
    stage_id: "stage-2",
    deal_id: "deal-4483",
    responsible: TEAM_MEMBERS[0],
    tag_ids: ["tag-docs"],
    notes: "Documentação em análise jurídica para assinatura.",
    timeline: [
      { id: "tl-4", content: "Documentos enviados para formalização contratual.", date: "Há 4 dias", author: "Ana Laura Lima" },
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "lead-4",
    name: "Cristiano Brito",
    company: "Brito Soluções",
    job_title: "Fundador",
    email: "brito@britosolucoes.com.br",
    phone: "+55 (11) 99999-0004",
    whatsapp: "5511999990004",
    city: "Curitiba",
    state: "PR",
    source: "Prospecção Outbound",
    potential_value: 750,
    status: "em_negociacao",
    is_client: false,
    stage_id: "stage-2",
    deal_id: "deal-4732",
    responsible: TEAM_MEMBERS[0],
    tag_ids: ["tag-proposta"],
    notes: "Reunião de apresentação realizada com o time comercial.",
    timeline: [],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "lead-5",
    name: "Carlos Eduardo",
    company: "Eduardo & Cia",
    job_title: "Diretor Comercial",
    email: "carlos@eduardocia.com.br",
    phone: "+55 (11) 99999-0005",
    whatsapp: "5511999990005",
    city: "Belo Horizonte",
    state: "MG",
    source: "Site Oficial",
    potential_value: 750,
    status: "em_negociacao",
    is_client: false,
    stage_id: "stage-3",
    deal_id: "deal-211",
    responsible: TEAM_MEMBERS[1],
    tag_ids: ["tag-negociacao"],
    notes: "Negociando desconto para pagamento à vista.",
    timeline: [],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "lead-6",
    name: "D&W Distribuidora",
    company: "D&W Distribuidora",
    job_title: "Gerente de Suprimentos",
    email: "contato@dwdistribuidora.com.br",
    phone: "+55 (11) 99999-0008",
    whatsapp: "5511999990008",
    city: "Rio de Janeiro",
    state: "RJ",
    source: "Indicação de Cliente",
    potential_value: 30110,
    status: "qualificado",
    is_client: false,
    stage_id: "stage-5",
    deal_id: "deal-3955",
    responsible: TEAM_MEMBERS[1],
    tag_ids: ["tag-contrato"],
    notes: "Contrato assinado aguardando fatura de entrada.",
    timeline: [],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "lead-7",
    name: "Tânia Ribeiro",
    company: "Ribeiro Group",
    job_title: "Presidente",
    email: "tania@ribeirogroup.com.br",
    phone: "+55 (11) 99999-0009",
    whatsapp: "5511999990009",
    city: "São Paulo",
    state: "SP",
    source: "LinkedIn",
    potential_value: 84700,
    status: "cliente",
    is_client: true,
    stage_id: "stage-5",
    deal_id: "deal-4153",
    responsible: TEAM_MEMBERS[2],
    tag_ids: ["tag-fatura", "tag-vip"],
    notes: "Cliente VIP ativo com contrato corporativo anual.",
    timeline: [],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const BRL = (num: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(num);

export function LeadsPage() {
  const qc = useQueryClient();

  // 1. Estados Relacionais: Estágios, Etiquetas e Negócios do Pipeline
  const [stages] = useState<PipelineStage[]>(() => {
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

  const [tags] = useState<TagItem[]>(() => {
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

  // Lista local persistida de Leads sincronizada
  const [leads, setLeads] = useState<LeadItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus_crm_leads_store");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SAMPLE_LEADS;
  });

  const saveLeads = (nextLeads: LeadItem[]) => {
    setLeads(nextLeads);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus_crm_leads_store", JSON.stringify(nextLeads));
    }
  };

  // 2. Query do Supabase para sincronizar novos leads salvos no banco
  useQuery({
    queryKey: ["leads-supabase-sync"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        // Mesclar leads do Supabase com o store se ainda não existirem
        setLeads((current) => {
          const currentIds = new Set(current.map((l) => l.id));
          const newFromDb: LeadItem[] = data
            .filter((dbL: any) => !currentIds.has(dbL.id))
            .map((dbL: any) => ({
              id: dbL.id,
              name: dbL.name,
              company: dbL.company || "",
              job_title: dbL.job_title || "",
              email: dbL.email || "",
              phone: dbL.phone || "",
              whatsapp: dbL.whatsapp || dbL.phone || "",
              source: dbL.source || "Site Oficial",
              potential_value: Number(dbL.potential_value) || 0,
              status: dbL.is_client ? "cliente" : ((dbL.status as any) || "novo"),
              is_client: !!dbL.is_client,
              stage_id: dbL.stage_id || "stage-1",
              responsible: TEAM_MEMBERS[0],
              tag_ids: ["tag-proposta"],
              notes: dbL.notes || "",
              timeline: [],
              created_at: dbL.created_at || new Date().toISOString(),
            }));
          if (newFromDb.length > 0) {
            const merged = [...newFromDb, ...current];
            localStorage.setItem("focus_crm_leads_store", JSON.stringify(merged));
            return merged;
          }
          return current;
        });
      }
      return data;
    },
  });

  // Filtros e Visualização
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedResponsible, setSelectedResponsible] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal 360° de Detalhamento
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  // Modal de Criação / Edição de Lead
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSource, setFormSource] = useState(SOURCES[0]);
  const [formValue, setFormValue] = useState("");
  const [formStageId, setFormStageId] = useState("stage-1");
  const [formResponsibleId, setFormResponsibleId] = useState(TEAM_MEMBERS[0].id);
  const [formTagIds, setFormTagIds] = useState<string[]>(["tag-proposta"]);
  const [formNotes, setFormNotes] = useState("");

  // Mini-KPIs
  const stats = useMemo(() => {
    const total = leads.length;
    const qualified = leads.filter((l) => l.status === "qualificado" || l.status === "em_negociacao").length;
    const inFunnel = leads.filter((l) => !!l.stage_id).length;
    const clients = leads.filter((l) => l.is_client || l.status === "cliente").length;
    const totalValue = leads.reduce((acc, l) => acc + (Number(l.potential_value) || 0), 0);
    return { total, qualified, inFunnel, clients, totalValue };
  }, [leads]);

  // Filtragem dos Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Busca texto
      if (search) {
        const q = search.toLowerCase();
        const match =
          lead.name.toLowerCase().includes(q) ||
          lead.company?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q) ||
          lead.job_title?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Origem
      if (selectedSource !== "all" && lead.source !== selectedSource) {
        return false;
      }

      // Status
      if (selectedStatus !== "all") {
        if (selectedStatus === "cliente" && !lead.is_client && lead.status !== "cliente") return false;
        if (selectedStatus !== "cliente" && lead.status !== selectedStatus) return false;
      }

      // Responsável
      if (selectedResponsible !== "all" && lead.responsible?.id !== selectedResponsible) {
        return false;
      }

      // Tag
      if (selectedTag !== "all" && !lead.tag_ids?.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [leads, search, selectedSource, selectedStatus, selectedResponsible, selectedTag]);

  // Abrir Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingLeadId(null);
    setFormName("");
    setFormCompany("");
    setFormJobTitle("");
    setFormEmail("");
    setFormPhone("");
    setFormWhatsapp("");
    setFormSource(SOURCES[0]);
    setFormValue("");
    setFormStageId(stages[0]?.id || "stage-1");
    setFormResponsibleId(TEAM_MEMBERS[0].id);
    setFormTagIds(["tag-proposta"]);
    setFormNotes("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (lead: LeadItem) => {
    setEditingLeadId(lead.id);
    setFormName(lead.name);
    setFormCompany(lead.company || "");
    setFormJobTitle(lead.job_title || "");
    setFormEmail(lead.email || "");
    setFormPhone(lead.phone || "");
    setFormWhatsapp(lead.whatsapp || "");
    setFormSource(lead.source || SOURCES[0]);
    setFormValue(String(lead.potential_value || ""));
    setFormStageId(lead.stage_id || stages[0]?.id || "stage-1");
    setFormResponsibleId(lead.responsible?.id || TEAM_MEMBERS[0].id);
    setFormTagIds(lead.tag_ids || ["tag-proposta"]);
    setFormNotes(lead.notes || "");
    setIsFormOpen(true);
  };

  // Abrir Modal 360° de Detalhamento
  const handleOpenDetail = (lead: LeadItem) => {
    setSelectedLead(lead);
    setNewNoteText("");
    setIsDetailOpen(true);
  };

  // Salvar Lead (Criar ou Atualizar) + Sincronizar com Pipeline
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      return toast.error("Informe o nome do lead");
    }

    const resp = TEAM_MEMBERS.find((m) => m.id === formResponsibleId) || TEAM_MEMBERS[0];
    const val = Number(formValue) || 0;

    if (editingLeadId) {
      const updated = leads.map((l) =>
        l.id === editingLeadId
          ? {
              ...l,
              name: formName.trim(),
              company: formCompany.trim(),
              job_title: formJobTitle.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              whatsapp: formWhatsapp.trim() || formPhone.trim(),
              source: formSource,
              potential_value: val,
              stage_id: formStageId,
              responsible: resp,
              tag_ids: formTagIds,
              notes: formNotes.trim(),
            }
          : l
      );
      saveLeads(updated);

      // Atualizar no Supabase
      try {
        await supabase.from("leads").update({
          name: formName.trim(),
          company: formCompany.trim() || null,
          job_title: formJobTitle.trim() || null,
          email: formEmail.trim() || null,
          phone: formPhone.trim() || null,
          whatsapp: formWhatsapp.trim() || formPhone.trim() || null,
          source: formSource,
          potential_value: val,
          stage_id: formStageId,
          notes: formNotes.trim() || null,
        }).eq("id", editingLeadId);
      } catch {}

      toast.success("Lead atualizado com sucesso!");
    } else {
      const newId = `lead-${Date.now()}`;
      const newDealId = `deal-${Date.now()}`;
      const newLead: LeadItem = {
        id: newId,
        name: formName.trim(),
        company: formCompany.trim(),
        job_title: formJobTitle.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        whatsapp: formWhatsapp.trim() || formPhone.trim(),
        source: formSource,
        potential_value: val,
        status: "novo",
        is_client: false,
        stage_id: formStageId,
        deal_id: newDealId,
        responsible: resp,
        tag_ids: formTagIds,
        notes: formNotes.trim(),
        timeline: [
          {
            id: `tl-${Date.now()}`,
            content: `Lead cadastrado no sistema via ${formSource}`,
            date: "Hoje",
            author: resp.name,
          },
        ],
        created_at: new Date().toISOString(),
      };

      // Criar também card correspondente no Pipeline Deals store
      if (typeof window !== "undefined") {
        const currentDealsRaw = localStorage.getItem("focus_crm_deals_store");
        let currentDeals: DealItem[] = currentDealsRaw ? JSON.parse(currentDealsRaw) : INITIAL_DEALS;
        const newPipelineDeal: DealItem = {
          id: newDealId,
          code: `#${Math.floor(1000 + Math.random() * 9000)}`,
          title: `${newLead.company ? newLead.company + " - " : ""}${newLead.name}`,
          value: val,
          stage_id: formStageId,
          lead_id: newId,
          client_name: newLead.name,
          company_name: newLead.company || "",
          responsible: resp,
          tag_ids: formTagIds,
          activity_title: "Contato Inicial",
          activity_date: "Hoje",
          phone: newLead.phone,
          whatsapp: newLead.whatsapp,
          notes: newLead.notes,
          status: "open",
          created_at: new Date().toISOString(),
        };
        localStorage.setItem("focus_crm_deals_store", JSON.stringify([newPipelineDeal, ...currentDeals]));
      }

      saveLeads([newLead, ...leads]);

      // Salvar no Supabase
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          await supabase.from("leads").insert({
            id: newId,
            user_id: u.user.id,
            name: formName.trim(),
            company: formCompany.trim() || null,
            job_title: formJobTitle.trim() || null,
            email: formEmail.trim() || null,
            phone: formPhone.trim() || null,
            whatsapp: formWhatsapp.trim() || formPhone.trim() || null,
            source: formSource,
            potential_value: val,
            stage_id: formStageId,
            status: "novo",
            is_client: false,
            notes: formNotes.trim() || null,
          });
        }
      } catch {}

      toast.success("Lead e oportunidade no Funil criados com sucesso!");
    }

    setIsFormOpen(false);
  };

  // Promover Lead a Cliente Ativo
  const handlePromoteToClient = async (leadId: string) => {
    const updated = leads.map((l) =>
      l.id === leadId ? { ...l, is_client: true, status: "cliente" as const } : l
    );
    saveLeads(updated);

    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, is_client: true, status: "cliente" } : null));
    }

    try {
      await supabase.from("leads").update({ is_client: true, status: "cliente" }).eq("id", leadId);
    } catch {}

    toast.success("Lead promovido para Cliente Oficial com sucesso!");
  };

  // Adicionar Anotação na Timeline 360°
  const handleAddTimelineNote = () => {
    if (!newNoteText.trim() || !selectedLead) return;

    const newNote = {
      id: `tl-${Date.now()}`,
      content: newNoteText.trim(),
      date: "Agora",
      author: "Você",
    };

    const updatedTimeline = [newNote, ...(selectedLead.timeline || [])];
    const updatedLead = { ...selectedLead, timeline: updatedTimeline };

    setSelectedLead(updatedLead);
    saveLeads(leads.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    setNewNoteText("");
    toast.success("Anotação registrada na timeline do lead!");
  };

  // Excluir Lead
  const handleDeleteLead = async (leadId: string) => {
    saveLeads(leads.filter((l) => l.id !== leadId));
    if (selectedLead?.id === leadId) {
      setIsDetailOpen(false);
    }
    try {
      await supabase.from("leads").delete().eq("id", leadId);
    } catch {}
    toast.success("Lead removido com sucesso");
  };

  // Obter Etiqueta formatada
  const getLeadTags = (lead: LeadItem) => {
    if (!lead.tag_ids || lead.tag_ids.length === 0) return [];
    return tags.filter((t) => lead.tag_ids?.includes(t.id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo (Desktop: Título + Botão; Mobile: Botão isolado, título na navbar) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Leads & Oportunidades
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão relacional completa de contatos, qualificação e visão 360°.
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Alternador de Visualização (Grid vs Lista) */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização em Cards"
              aria-label="Visualização em Cards"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visualização em Tabela"
              aria-label="Visualização em Tabela"
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>

          {/* Botão Novo Lead */}
          <Button
            onClick={handleOpenCreateModal}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white shadow-xs cursor-pointer"
          >
            <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" />
            <span>Novo Lead</span>
          </Button>
        </div>
      </div>

      {/* 2. Mini-KPIs no Topo */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total de Leads</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Qualificados / Ativos</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{stats.qualified}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Em Negociação</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{stats.inFunnel}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
              <KanbanSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Clientes Oficiais</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{stats.clients}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Barra de Filtros e Busca */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-3.5 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, empresa, e-mail, cargo..."
              className="pl-9 bg-card h-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro de Origem */}
            <div className="w-[155px]">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="h-9 text-xs bg-card">
                  <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Status */}
            <div className="w-[145px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 text-xs bg-card">
                  <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="novo">Novos Leads</SelectItem>
                  <SelectItem value="qualificado">Qualificados</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Responsável */}
            <div className="w-[150px]">
              <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
                <SelectTrigger className="h-9 text-xs bg-card">
                  <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos responsáveis</SelectItem>
                  {TEAM_MEMBERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Etiquetas */}
            <div className="w-[140px]">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="h-9 text-xs bg-card">
                  <Tag className="mr-1.5 h-3.5 w-3.5 text-[#FF6B00]" />
                  <SelectValue placeholder="Etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas etiquetas</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* 4. Listagem dos Leads: Modo Grid (Cards) vs Modo Tabela (Lista) */}
      {filteredLeads.length === 0 ? (
        <Card className="p-12 text-center shadow-xs border-border/80">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-bold text-foreground text-sm">Nenhum lead encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste os filtros ou crie um novo lead para preencher sua base.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="mt-4 bg-[#FF6B00] hover:bg-[#E65C00] text-white text-xs h-8"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" /> Criar Novo Lead
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* Visualização em CARDS MODERNOS */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredLeads.map((lead) => {
            const stage = stages.find((s) => s.id === lead.stage_id);
            const leadTags = getLeadTags(lead);

            return (
              <Card
                key={lead.id}
                className="group relative bg-card text-card-foreground rounded-2xl border border-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Linha superior com cor da etapa do funil */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: stage?.color || "#FF6B00" }}
                />

                <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  {/* Topo: Avatar + Nome + Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-10 w-10 ring-1 ring-border shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.name)}`} />
                        <AvatarFallback className="bg-[#FF6B00]/10 text-[#FF6B00] font-bold text-xs">
                          {lead.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3
                          onClick={() => handleOpenDetail(lead)}
                          className="text-sm font-bold text-foreground hover:text-[#FF6B00] cursor-pointer truncate transition-colors"
                          title={lead.name}
                        >
                          {lead.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span>{lead.company || "Pessoa Física"}</span>
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground -mr-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuItem onClick={() => handleOpenDetail(lead)}>
                          <Eye className="h-3.5 w-3.5 mr-2 text-[#FF6B00]" /> Visão 360° do Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(lead)}>
                          <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar Dados
                        </DropdownMenuItem>
                        {!lead.is_client && (
                          <DropdownMenuItem onClick={() => handlePromoteToClient(lead.id)}>
                            <UserCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Promover a Cliente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges de Etapa do Funil & Etiquetas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {stage && (
                        <Badge
                          style={{
                            backgroundColor: `${stage.color}15`,
                            color: stage.color,
                            borderColor: `${stage.color}35`,
                          }}
                          className="text-[10px] font-bold uppercase border shadow-2xs"
                        >
                          <KanbanSquare className="h-3 w-3 mr-1" />
                          {stage.name}
                        </Badge>
                      )}
                      {lead.is_client && (
                        <Badge className="bg-purple-500 text-white text-[10px] font-bold">
                          Cliente Ativo
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {leadTags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {leadTags.map((tag) => (
                          <span
                            key={tag.id}
                            style={{
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                              borderColor: `${tag.color}35`,
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span>{tag.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Valor Potencial & Origem */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Valor Potencial</p>
                      <p className="text-sm font-extrabold text-foreground">
                        {BRL(lead.potential_value)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-medium">Origem</p>
                      <p className="text-[11px] font-semibold text-muted-foreground truncate max-w-[110px]" title={lead.source}>
                        {lead.source}
                      </p>
                    </div>
                  </div>

                  {/* Ações Rápidas de Contato (WhatsApp, Ligação, Detalhes) */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {lead.whatsapp && (
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name}, tudo bem? Sou da Focus Tech.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="h-8 w-8 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-border flex items-center justify-center transition-colors"
                          title="Ligar"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="h-8 w-8 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-border flex items-center justify-center transition-colors"
                          title="Enviar E-mail"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(lead)}
                      className="text-xs h-8 text-[#FF6B00] border-[#FF6B00]/40 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Visão 360°
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Visualização em TABELA */
        <Card className="shadow-xs border-border/80 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[280px]">Lead & Empresa</TableHead>
                <TableHead>Contatos Rápidos</TableHead>
                <TableHead>Etapa do Funil</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Valor Potencial</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const stage = stages.find((s) => s.id === lead.stage_id);
                return (
                  <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 ring-1 ring-border">
                          <AvatarFallback className="bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold">
                            {lead.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p
                            onClick={() => handleOpenDetail(lead)}
                            className="text-xs font-bold text-foreground hover:text-[#FF6B00] cursor-pointer"
                          >
                            {lead.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{lead.company || "Pessoa Física"}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Telefone"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="E-mail"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {stage ? (
                        <Badge
                          style={{
                            backgroundColor: `${stage.color}15`,
                            color: stage.color,
                            borderColor: `${stage.color}35`,
                          }}
                          className="text-[10px] font-bold uppercase border"
                        >
                          {stage.name}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {lead.source}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Avatar className="h-5 w-5 ring-1 ring-border">
                          <AvatarImage src={lead.responsible?.avatar} />
                          <AvatarFallback className="text-[8px]">{lead.responsible?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px]">{lead.responsible?.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-bold text-foreground text-xs tabular-nums">
                      {BRL(lead.potential_value)}
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem onClick={() => handleOpenDetail(lead)}>
                            <Eye className="h-3.5 w-3.5 mr-2 text-[#FF6B00]" /> Visão 360°
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEditModal(lead)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                          {!lead.is_client && (
                            <DropdownMenuItem onClick={() => handlePromoteToClient(lead.id)}>
                              <UserCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Tornar Cliente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)} className="text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 5. Modal / Drawer de Visão 360° do Lead (Detalhamento Completo) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <div className="space-y-5">
              {/* Header 360° */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar className="h-14 w-14 ring-2 ring-[#FF6B00]/40 shadow-sm shrink-0">
                    <AvatarFallback className="bg-[#FF6B00] text-white text-lg font-black">
                      {selectedLead.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                        {selectedLead.name}
                      </h2>
                      {selectedLead.is_client ? (
                        <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                          Cliente Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#FF6B00] border-[#FF6B00]/40">
                          {selectedLead.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedLead.job_title ? `${selectedLead.job_title} · ` : ""}
                      {selectedLead.company || "Pessoa Física"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!selectedLead.is_client && (
                    <Button
                      size="sm"
                      onClick={() => handlePromoteToClient(selectedLead.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" /> Tornar Cliente
                    </Button>
                  )}
                  {selectedLead.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${selectedLead.name}, tudo bem? Sou da Focus Tech.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Abas com Dados de Contato, Funil e Histórico */}
              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-3">
                  <TabsTrigger value="geral" className="text-xs">Dados & Contato</TabsTrigger>
                  <TabsTrigger value="funil" className="text-xs">Posição no Funil</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">Timeline & Notas</TabsTrigger>
                </TabsList>

                {/* Aba 1: Dados Gerais & Contatos */}
                <TabsContent value="geral" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3 text-[#FF6B00]" /> Telefone Principal
                      </p>
                      <p className="text-xs font-bold text-foreground">{selectedLead.phone || "Não informado"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3 text-[#FF6B00]" /> E-mail Comercial
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">{selectedLead.email || "Não informado"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Globe className="h-3 w-3 text-[#FF6B00]" /> Origem do Lead
                      </p>
                      <p className="text-xs font-bold text-foreground">{selectedLead.source}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#FF6B00]" /> Localização
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {selectedLead.city && selectedLead.state ? `${selectedLead.city}, ${selectedLead.state}` : "Brasil"}
                      </p>
                    </div>
                  </div>

                  {/* Etiquetas Relacionais do Lead */}
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-[#FF6B00]" /> Etiquetas Atribuídas
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getLeadTags(selectedLead).map((t) => (
                        <span
                          key={t.id}
                          style={{
                            backgroundColor: `${t.color}15`,
                            color: t.color,
                            borderColor: `${t.color}40`,
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase border shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                          <span>{t.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Aba 2: Posição no Funil de Vendas */}
                <TabsContent value="funil" className="space-y-3.5">
                  {(() => {
                    const currentStage = stages.find((s) => s.id === selectedLead.stage_id) || stages[0];
                    return (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-muted-foreground font-medium">Etapa Atual no Kanban</p>
                            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2 mt-0.5">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentStage.color }} />
                              {currentStage.name}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-muted-foreground font-medium">Valor da Oportunidade</p>
                            <p className="text-lg font-black text-[#FF6B00]">{BRL(selectedLead.potential_value)}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={selectedLead.responsible?.avatar} />
                              <AvatarFallback className="text-[9px]">{selectedLead.responsible?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground">
                              Responsável: {selectedLead.responsible?.name}
                            </span>
                          </div>

                          <Button asChild size="sm" className="bg-[#FF6B00] hover:bg-[#E65C00] text-white text-xs h-8">
                            <Link to="/pipeline">
                              <KanbanSquare className="h-3.5 w-3.5 mr-1.5" /> Abrir no Funil
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>

                {/* Aba 3: Timeline de Atividades & Notas */}
                <TabsContent value="timeline" className="space-y-3.5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Registrar Nova Interação / Anotação</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Ligação feita. Cliente confirmou interesse na proposta..."
                        className="text-xs h-9"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTimelineNote();
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddTimelineNote}
                        className="bg-[#FF6B00] hover:bg-[#E65C00] text-white h-9 px-3 text-xs shrink-0 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>

                  {/* Lista Cronológica */}
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {selectedLead.timeline && selectedLead.timeline.length > 0 ? (
                      selectedLead.timeline.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl bg-card border border-border/60 text-xs space-y-1">
                          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                            <span className="font-bold text-foreground">{item.author}</span>
                            <span>{item.date}</span>
                          </div>
                          <p className="text-foreground leading-relaxed">{item.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Nenhuma anotação registrada ainda.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-2 flex justify-between items-center sm:justify-between border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(selectedLead);
                  }}
                  className="text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar Dados do Lead
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. Modal de Criação / Edição de Lead */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF6B00]" />
              {editingLeadId ? "Editar Lead" : "Cadastrar Novo Lead no CRM"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLead} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-name" className="text-xs">Nome Completo *</Label>
                <Input
                  id="lead-name"
                  placeholder="Ex: Mariana Monteiro"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-company" className="text-xs">Empresa</Label>
                <Input
                  id="lead-company"
                  placeholder="Ex: Área Tech"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-cargo" className="text-xs">Cargo</Label>
                <Input
                  id="lead-cargo"
                  placeholder="Ex: Diretora de TI"
                  value={formJobTitle}
                  onChange={(e) => setFormJobTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-phone" className="text-xs">Telefone / WhatsApp</Label>
                <Input
                  id="lead-phone"
                  placeholder="+55 11 99999-0000"
                  value={formPhone}
                  onChange={(e) => {
                    setFormPhone(e.target.value);
                    if (!formWhatsapp) setFormWhatsapp(e.target.value);
                  }}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-email" className="text-xs">E-mail</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Canal / Origem do Lead</Label>
                <Select value={formSource} onValueChange={setFormSource}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-value" className="text-xs">Valor Potencial Estimado (R$)</Label>
                <Input
                  id="lead-value"
                  type="number"
                  placeholder="50000"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Etapa do Funil & Responsável */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Etapa Inicial no Funil de Leads</Label>
                <Select value={formStageId} onValueChange={setFormStageId}>
                  <SelectTrigger className="h-9 text-xs">
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
                <Label className="text-xs">Responsável pela Conta</Label>
                <Select value={formResponsibleId} onValueChange={setFormResponsibleId}>
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
            </div>

            {/* Etiquetas Relacionais do Lead */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 space-y-2">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#FF6B00]" /> Etiquetas do Lead
              </Label>
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
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      )}
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-notes" className="text-xs">Observações do Lead</Label>
              <Textarea
                id="lead-notes"
                placeholder="Detalhes sobre a oportunidade, necessidades do cliente..."
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#E65C00] text-white"
              >
                {editingLeadId ? "Salvar Alterações" : "Criar Lead & Oportunidade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

