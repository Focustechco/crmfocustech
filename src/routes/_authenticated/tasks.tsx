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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Calendar, Flag, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tarefas · Focus CRM" }] }),
  component: TasksPage,
});

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "done";

const STATUSES: { key: Status; label: string; tint: string }[] = [
  { key: "todo", label: "A fazer", tint: "bg-muted" },
  { key: "in_progress", label: "Em andamento", tint: "bg-accent" },
  { key: "done", label: "Concluídas", tint: "bg-primary/10" },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

interface Form {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  due_at: string;
}

const empty: Form = { title: "", description: "", priority: "medium", status: "todo", due_at: "" };

function TasksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [view, setView] = useState("board");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo(() => {
    const g: Record<Status, typeof tasks> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => g[(t.status as Status) ?? "todo"]?.push(t));
    return g;
  }, [tasks]);

  const create = async () => {
    if (!form.title) return toast.error("Título é obrigatório");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: u.user.id,
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      status: form.status,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Tarefa criada!");
    setForm(empty);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const toggle = async (id: string, status: Status) => {
    const next: Status = status === "done" ? "todo" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const move = async (id: string, status: Status) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            Organize seu dia no estilo ClickUp — board, lista e prioridades.
          </p>
        </div>
        <div className="ml-auto md:ml-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="brand-gradient text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Nova tarefa
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova tarefa</DialogTitle>
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
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as Status })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="due">Prazo</Label>
                <Input
                  id="due"
                  type="datetime-local"
                  value={form.due_at}
                  onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={create} className="brand-gradient text-white hover:opacity-90">
                Criar tarefa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {STATUSES.map((s) => (
                <div key={s.key} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.tint}`} />
                      <span className="text-sm font-semibold">{s.label}</span>
                    </div>
                    <Badge variant="secondary">{grouped[s.key].length}</Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {grouped[s.key].map((t) => (
                      <Card key={t.id} className="shadow-card p-3 group">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={t.status === "done"}
                            onCheckedChange={() => toggle(t.id, t.status as Status)}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                              {t.title}
                            </p>
                            {t.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_COLORS[t.priority as Priority]}`}>
                                <Flag className="h-2.5 w-2.5" /> {t.priority}
                              </span>
                              {t.due_at && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(t.due_at).toLocaleDateString("pt-BR")}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                              {STATUSES.filter((x) => x.key !== t.status).map((x) => (
                                <button
                                  key={x.key}
                                  onClick={() => move(t.id, x.key)}
                                  className="rounded border px-2 py-0.5 text-[10px] hover:bg-accent"
                                >
                                  → {x.label}
                                </button>
                              ))}
                              <button
                                onClick={() => remove(t.id)}
                                className="ml-auto text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {grouped[s.key].length === 0 && (
                      <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                        Nada por aqui
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card className="shadow-card divide-y">
            {tasks.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="rounded-full bg-accent p-4 text-primary">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <p className="mt-4 font-medium">Nenhuma tarefa</p>
              </div>
            )}
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                <Checkbox
                  checked={t.status === "done"}
                  onCheckedChange={() => toggle(t.id, t.status as Status)}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_COLORS[t.priority as Priority]}`}>
                  {t.priority}
                </span>
                {t.due_at && (
                  <span className="hidden md:inline text-xs text-muted-foreground tabular-nums">
                    {new Date(t.due_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
