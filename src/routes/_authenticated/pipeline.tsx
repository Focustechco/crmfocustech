import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline · Focus CRM" }] }),
  component: PipelinePage,
});

const DEFAULT_STAGES = [
  { name: "Novo Lead", color: "#3B82F6" },
  { name: "Contato Inicial", color: "#8B5CF6" },
  { name: "Qualificação", color: "#EC4899" },
  { name: "Proposta", color: "#F59E0B" },
  { name: "Negociação", color: "#FF6B00" },
  { name: "Fechamento", color: "#10B981" },
];

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function PipelinePage() {
  const qc = useQueryClient();
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("user_id", u.user!.id)
        .order("position");
      if (error) throw error;
      // Deduplicate by name (legacy seed races)
      const seen = new Set<string>();
      return (data ?? []).filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)));
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-pipeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Seed default stages on first visit
  useEffect(() => {
    if (stages.length === 0) {
      (async () => {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const payload = DEFAULT_STAGES.map((s, i) => ({
          user_id: u.user!.id,
          name: s.name,
          color: s.color,
          position: i,
        }));
        const { error } = await supabase.from("pipeline_stages").insert(payload);
        if (!error) qc.invalidateQueries({ queryKey: ["stages"] });
      })();
    }
  }, [stages.length, qc]);

  const moveLead = async (leadId: string, stageId: string | null) => {
    const { error } = await supabase.from("leads").update({ stage_id: stageId }).eq("id", leadId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["leads-pipeline"] });
  };

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(leadId);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverStage(null);
  };

  const onDrop = (e: React.DragEvent, stageId: string | null) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) moveLead(leadId, stageId);
    setDragOverStage(null);
    setDraggingId(null);
  };

  const renderCard = (l: (typeof leads)[number], color?: string) => (
    <div
      key={l.id}
      draggable
      onDragStart={(e) => onDragStart(e, l.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-xl border border-border/70 bg-card p-3.5 shadow-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated active:cursor-grabbing",
        draggingId === l.id && "opacity-40 scale-[0.97]"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: color ?? "var(--primary)" }}
        >
          {initials(l.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{l.name}</p>
          {l.company && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              {l.company}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <span className="flex items-center gap-1 font-semibold text-primary">
          <TrendingUp className="h-3 w-3" />
          {BRL.format(Number(l.potential_value ?? 0))}
        </span>
        {l.score ? (
          <Badge
            variant="secondary"
            className="h-5 rounded-md px-1.5 text-[10px] font-semibold"
          >
            Score {l.score}
          </Badge>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Arraste e solte os leads entre as etapas do funil.
        </p>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage_id === stage.id);
          const total = stageLeads.reduce((s, l) => s + Number(l.potential_value ?? 0), 0);
          const isOver = dragOverStage === stage.id;
          return (
            <div
              key={stage.id}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-2xl border bg-secondary/40 p-3 transition-colors duration-200",
                isOver ? "border-primary/60 bg-accent/60" : "border-border/60"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.id);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
              onDrop={(e) => onDrop(e, stage.id)}
            >
              {/* Colored accent bar */}
              <div
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: stage.color }}
              />

              {/* Column header */}
              <div className="mb-1 mt-2.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-4"
                    style={{
                      backgroundColor: stage.color,
                      ["--tw-ring-color" as string]: `${stage.color}26`,
                    }}
                  />
                  <span className="truncate text-sm font-semibold">{stage.name}</span>
                  <span
                    className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stageLeads.length}
                  </span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="mb-3 text-[11px] font-medium text-muted-foreground">
                {BRL.format(total)} em oportunidades
              </p>

              {/* Cards */}
              <div className="flex-1 space-y-2.5">
                {stageLeads.map((l) => renderCard(l, stage.color))}
                {stageLeads.length === 0 && (
                  <div
                    className={cn(
                      "grid min-h-[90px] place-items-center rounded-xl border border-dashed text-xs text-muted-foreground transition-colors",
                      isOver ? "border-primary/60 bg-accent" : "border-border"
                    )}
                  >
                    Solte o lead aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned column */}
        <div
          className={cn(
            "flex w-72 shrink-0 flex-col rounded-2xl border border-dashed p-3 transition-colors duration-200",
            dragOverStage === "none" ? "border-primary/60 bg-accent/60" : "border-border"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStage("none");
          }}
          onDragLeave={() => setDragOverStage((s) => (s === "none" ? null : s))}
          onDrop={(e) => onDrop(e, null)}
        >
          <div className="mb-3 mt-1 text-sm font-semibold text-muted-foreground">
            Sem etapa
          </div>
          <div className="flex-1 space-y-2.5">
            {leads.filter((l) => !l.stage_id).map((l) => renderCard(l))}
            {leads.filter((l) => !l.stage_id).length === 0 && (
              <div className="grid min-h-[90px] place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                Solte o lead aqui
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
