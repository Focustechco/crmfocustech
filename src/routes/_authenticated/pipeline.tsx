import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";

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

function PipelinePage() {
  const qc = useQueryClient();

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("position");
      if (error) throw error;
      return data;
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
  };

  const onDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) moveLead(leadId, stageId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Arraste e solte os leads entre as etapas do funil.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage_id === stage.id);
          const total = stageLeads.reduce((s, l) => s + Number(l.potential_value ?? 0), 0);
          return (
            <div
              key={stage.id}
              className="w-72 shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, stage.id)}
            >
              <div className="mb-3 flex items-center justify-between rounded-lg bg-card border p-3 shadow-card">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium text-sm">{stage.name}</span>
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {stageLeads.length}
                  </Badge>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {stageLeads.map((l) => (
                  <Card
                    key={l.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, l.id)}
                    className="cursor-grab p-3 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{l.name}</p>
                        {l.company && (
                          <p className="text-xs text-muted-foreground truncate">{l.company}</p>
                        )}
                      </div>
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        }).format(Number(l.potential_value ?? 0))}
                      </span>
                      {l.score ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Score {l.score}
                        </Badge>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-right">
                Total:{" "}
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
              </div>
            </div>
          );
        })}

        {/* Unassigned column */}
        <div
          className="w-72 shrink-0"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, "")}
        >
          <div className="mb-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Sem etapa
          </div>
          <div className="space-y-2">
            {leads
              .filter((l) => !l.stage_id)
              .map((l) => (
                <Card
                  key={l.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, l.id)}
                  className="cursor-grab p-3 shadow-card"
                >
                  <p className="font-medium text-sm">{l.name}</p>
                  {l.company && <p className="text-xs text-muted-foreground">{l.company}</p>}
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
