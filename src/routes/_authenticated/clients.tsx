import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Mail, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Clientes · Focus CRM" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("is_client", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, company")
        .eq("is_client", false)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const promote = async (id: string) => {
    const { error } = await supabase.from("leads").update({ is_client: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Convertido em cliente!");
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["prospects"] });
  };

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <h1 className="font-display text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">Sua base de clientes ativos.</p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-16 text-center shadow-card">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="font-medium">Nenhum cliente ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Converta um lead em cliente para começar.
          </p>
          {prospects.length > 0 && (
            <div className="mx-auto mt-6 max-w-sm space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Promover lead em cliente
              </p>
              {prospects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="text-left">
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.company && <p className="text-xs text-muted-foreground">{p.company}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => promote(p.id)}>
                    Tornar cliente
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Card key={c.id} className="p-5 shadow-card hover:shadow-elevated transition-all">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="brand-gradient text-white font-semibold">
                    {c.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{c.name}</p>
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  </div>
                  {c.company && (
                    <p className="text-sm text-muted-foreground truncate">{c.company}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {c.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{c.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Valor</span>
                <span className="font-semibold text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    Number(c.potential_value ?? 0),
                  )}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
