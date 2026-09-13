import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, DollarSign, Target, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/deals")({
  head: () => ({ meta: [{ title: "Negócios · Focus CRM" }] }),
  component: DealsPage,
});

type DealStatus = "open" | "won" | "lost";

interface Form {
  title: string;
  value: string;
  probability: string;
  lead_id: string;
  expected_close_date: string;
  notes: string;
  status: DealStatus;
}

const empty: Form = {
  title: "",
  value: "",
  probability: "50",
  lead_id: "",
  expected_close_date: "",
  notes: "",
  status: "open",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function DealsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("id, name, company");
      if (error) throw error;
      return data;
    },
  });

  const leadMap = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);

  const stats = useMemo(() => {
    const open = deals.filter((d) => d.status === "open");
    const won = deals.filter((d) => d.status === "won");
    const lost = deals.filter((d) => d.status === "lost");
    const pipeline = open.reduce((s, d) => s + Number(d.value || 0), 0);
    const weighted = open.reduce(
      (s, d) => s + Number(d.value || 0) * (Number(d.probability || 0) / 100),
      0,
    );
    const closedWon = won.reduce((s, d) => s + Number(d.value || 0), 0);
    const winRate =
      won.length + lost.length > 0
        ? Math.round((won.length / (won.length + lost.length)) * 100)
        : 0;
    return { pipeline, weighted, closedWon, winRate, open: open.length };
  }, [deals]);

  const create = async () => {
    if (!form.title) return toast.error("Título é obrigatório");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("deals").insert({
      user_id: u.user.id,
      title: form.title,
      value: form.value ? Number(form.value) : 0,
      probability: form.probability ? Number(form.probability) : 0,
      lead_id: form.lead_id || null,
      expected_close_date: form.expected_close_date || null,
      notes: form.notes || null,
      status: form.status,
    });
    if (error) return toast.error(error.message);
    toast.success("Negócio criado!");
    setForm(empty);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["deals"] });
  };

  const setStatus = async (id: string, status: DealStatus) => {
    const { error } = await supabase
      .from("deals")
      .update({ status, closed_at: status !== "open" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["deals"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["deals"] });
  };

  const kpis = [
    { label: "Pipeline aberto", value: fmt(stats.pipeline), icon: Target, sub: `${stats.open} negócios` },
    { label: "Receita ponderada", value: fmt(stats.weighted), icon: TrendingUp, sub: "por probabilidade" },
    { label: "Receita ganha", value: fmt(stats.closedWon), icon: DollarSign, sub: "no histórico" },
    { label: "Win rate", value: `${stats.winRate}%`, icon: Trophy, sub: "ganhos / fechados" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl font-bold tracking-tight">Negócios</h1>
          <p className="text-sm text-muted-foreground">
            Gestão comercial — pipeline financeiro, probabilidades e fechamento.
          </p>
        </div>
        <div className="ml-auto md:ml-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="brand-gradient text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Novo negócio
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo negócio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="prob">Probabilidade (%)</Label>
                  <Input
                    id="prob"
                    type="number"
                    min={0}
                    max={100}
                    value={form.probability}
                    onChange={(e) => setForm({ ...form, probability: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Lead vinculado</Label>
                <Select
                  value={form.lead_id || "none"}
                  onValueChange={(v) => setForm({ ...form, lead_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar lead" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem vínculo</SelectItem>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.company ? `· ${l.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="close">Previsão de fechamento</Label>
                <Input
                  id="close"
                  type="date"
                  value={form.expected_close_date}
                  onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={create} className="brand-gradient text-white hover:opacity-90">
                Criar negócio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {k.label}
              </p>
              <k.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Todos os negócios</h2>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="rounded-full bg-accent p-4 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium">Nenhum negócio ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro negócio.</p>
          </div>
        ) : (
          <div className="divide-y">
            {deals.map((d) => {
              const lead = d.lead_id ? leadMap.get(d.lead_id) : null;
              return (
                <div key={d.id} className="grid grid-cols-12 items-center gap-3 p-4 hover:bg-muted/30">
                  <div className="col-span-12 md:col-span-4">
                    <p className="font-medium">{d.title}</p>
                    {lead && (
                      <p className="text-xs text-muted-foreground">
                        {lead.name} {lead.company ? `· ${lead.company}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2 tabular-nums">
                    <p className="font-semibold">{fmt(Number(d.value ?? 0))}</p>
                    <p className="text-xs text-muted-foreground">{d.probability ?? 0}% prob.</p>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-sm text-muted-foreground">
                    {d.expected_close_date
                      ? new Date(d.expected_close_date).toLocaleDateString("pt-BR")
                      : "—"}
                  </div>
                  <div className="col-span-8 md:col-span-3">
                    <Badge
                      className={
                        d.status === "won"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : d.status === "lost"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-accent text-accent-foreground"
                      }
                    >
                      {d.status === "won" ? "Ganho" : d.status === "lost" ? "Perdido" : "Aberto"}
                    </Badge>
                    {d.status === "open" && (
                      <span className="ml-2 inline-flex gap-1">
                        <button
                          onClick={() => setStatus(d.id, "won")}
                          className="rounded border px-2 py-0.5 text-[10px] hover:bg-green-50 hover:text-green-700"
                        >
                          Ganhar
                        </button>
                        <button
                          onClick={() => setStatus(d.id, "lost")}
                          className="rounded border px-2 py-0.5 text-[10px] hover:bg-red-50 hover:text-red-700"
                        >
                          Perder
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove(d.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
