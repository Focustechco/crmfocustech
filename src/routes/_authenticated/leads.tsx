import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads · Focus CRM" }] }),
  component: LeadsPage,
});

interface LeadForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  potential_value: string;
  source: string;
}

const empty: LeadForm = { name: "", company: "", email: "", phone: "", potential_value: "", source: "" };

function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(empty);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(
    () =>
      leads.filter((l) =>
        [l.name, l.company, l.email].some((f) => f?.toLowerCase().includes(search.toLowerCase())),
      ),
    [leads, search],
  );

  const handleCreate = async () => {
    if (!form.name) return toast.error("Nome é obrigatório");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("leads").insert({
      user_id: u.user.id,
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      source: form.source || null,
      potential_value: form.potential_value ? Number(form.potential_value) : 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Lead criado!");
    setForm(empty);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lead removido");
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads e oportunidades.</p>
        </div>
        <div className="ml-auto md:ml-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="brand-gradient text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Novo Lead
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {(
                [
                  ["name", "Nome *"],
                  ["company", "Empresa"],
                  ["email", "E-mail"],
                  ["phone", "Telefone"],
                  ["source", "Origem (Site, Ads, Indicação...)"],
                  ["potential_value", "Valor potencial (R$)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={key === "potential_value" ? "number" : "text"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="brand-gradient text-white hover:opacity-90">
                Criar lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, empresa, e-mail..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
          </span>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="rounded-full bg-accent p-4 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium">Nenhum lead ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro lead para começar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.company ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.email ?? l.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {l.source ? <Badge variant="secondary">{l.source}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      Number(l.potential_value ?? 0),
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(l.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
