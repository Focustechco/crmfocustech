import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Bell,
  Users,
  Webhook,
  Building2,
  Shield,
  Key,
  Copy,
  Check,
  Save,
  Plus,
  Trash2,
  Video,
  MessageCircle,
  FileAudio,
  Zap,
  Globe,
  Clock,
  DollarSign,
  Sun,
  Moon,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trophy,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { TEAM_MEMBERS, TeamMember } from "./pipeline";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · Focus CRM" }] }),
  component: SettingsPage,
});

const STORAGE_SETTINGS_KEY = "focus_crm_system_settings_data";

interface TeamMemberExtended extends TeamMember {
  email: string;
  accessLevel: "admin" | "manager" | "closer" | "sdr";
  status: "active" | "inactive";
  phone: string;
}

const INITIAL_TEAM: TeamMemberExtended[] = [
  {
    id: "user-1",
    name: "Felipe Focus",
    role: "Account Executive",
    email: "felipe@focustech.co",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    accessLevel: "admin",
    status: "active",
    phone: "+55 (11) 98888-1111",
  },
  {
    id: "user-2",
    name: "Adriano Gestor",
    role: "Diretor Comercial",
    email: "adriano@focustech.co",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    accessLevel: "admin",
    status: "active",
    phone: "+55 (11) 98888-2222",
  },
  {
    id: "user-3",
    name: "Lucas Closer",
    role: "Closer Senior",
    email: "lucas@focustech.co",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    accessLevel: "closer",
    status: "active",
    phone: "+55 (11) 98888-3333",
  },
  {
    id: "user-4",
    name: "Larissa SDR",
    role: "SDR Pleno",
    email: "larissa@focustech.co",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    accessLevel: "sdr",
    status: "active",
    phone: "+55 (11) 98888-4444",
  },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Estados Perfil
  const [profileForm, setProfileForm] = useState({
    name: "Adriano Gestor",
    email: "adriano@focustech.co",
    phone: "(11) 98888-2222",
    role: "Diretor Comercial",
    bio: "Especialista em estruturação de operações comerciais B2B, aceleração de receita e CRM.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  });

  // Estados Segurança / Senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Estados Notificações
  const [notifPrefs, setNotifPrefs] = useState({
    inApp: true,
    sound: true,
    emailDigest: false,
    whatsappAlerts: true,
    alertMeetings: true,
    alertTasks: true,
    alertGoals: true,
    alertTranscriptions: true,
    alertLeads: true,
  });

  // Estados Equipe
  const [teamList, setTeamList] = useState<TeamMemberExtended[]>(INITIAL_TEAM);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Closer",
    accessLevel: "closer" as const,
    phone: "",
  });

  // Estados Integrações & Webhooks
  const [webhookUrl, setWebhookUrl] = useState("https://n8n.focustech.co/webhook/crm-events");
  const [apiKey, setApiKey] = useState("focus_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d");
  const [copiedKey, setCopiedKey] = useState(false);

  // Estados Organização
  const [orgForm, setOrgForm] = useState({
    companyName: "Focus Tech Soluções LTDA",
    cnpj: "48.123.456/0001-89",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    firstContactSlaMinutes: "15",
  });

  const handleSaveProfile = () => {
    toast.success("Perfil comercial atualizado com sucesso!");
  };

  const handleUpdatePassword = () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("As senhas não coincidem ou estão em branco.");
      return;
    }
    toast.success("Senha alterada com sucesso!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveNotifPrefs = () => {
    toast.success("Preferências de notificação salvas com sucesso!");
  };

  const handleInviteMember = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      toast.error("Preencha o nome e e-mail do colaborador.");
      return;
    }

    const newMember: TeamMemberExtended = {
      id: `user-${Date.now()}`,
      name: inviteForm.name,
      role: inviteForm.role,
      email: inviteForm.email,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      accessLevel: inviteForm.accessLevel,
      status: "active",
      phone: inviteForm.phone || "+55 (11) 99999-0000",
    };

    setTeamList((prev) => [...prev, newMember]);
    toast.success(`Convite enviado para ${inviteForm.email} com sucesso!`);
    setOpenInviteModal(false);
    setInviteForm({
      name: "",
      email: "",
      role: "Closer",
      accessLevel: "closer",
      phone: "",
    });
  };

  const handleToggleMemberStatus = (id: string) => {
    setTeamList((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m
      )
    );
    toast.success("Status do membro atualizado.");
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success("Chave de API copiada para a área de transferência!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestWebhook = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Disparando payload de teste para o Webhook...",
        success: "Payload recebido pelo webhook com status 200 OK! 🚀",
        error: "Falha ao conectar com o endpoint.",
      }
    );
  };

  const handleSaveOrg = () => {
    toast.success("Configurações da empresa atualizadas com sucesso!");
  };

  const ACCESS_LEVEL_BADGES: Record<string, { label: string; badge: string }> = {
    admin: { label: "Administrador", badge: "bg-red-500/10 text-red-600 border-red-500/30" },
    manager: { label: "Gestor Comercial", badge: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
    closer: { label: "Closer / Vendas", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    sdr: { label: "SDR / Pré-vendas", badge: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header com Título */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hidden md:block">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie perfil, preferências de notificação, equipe comercial, integrações e dados da empresa.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-0.5 border overflow-x-auto max-w-full justify-start sm:justify-center flex-nowrap shrink-0">
          <TabsTrigger
            value="profile"
            className="text-xs h-7.5 px-3 shrink-0 cursor-pointer font-medium text-foreground hover:text-foreground data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:font-semibold"
          >
            Perfil & Conta
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs h-7.5 px-3 shrink-0 cursor-pointer font-medium text-foreground hover:text-foreground data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:font-semibold"
          >
            Notificações
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="text-xs h-7.5 px-3 shrink-0 cursor-pointer font-medium text-foreground hover:text-foreground data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:font-semibold"
          >
            Equipe
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="text-xs h-7.5 px-3 shrink-0 cursor-pointer font-medium text-foreground hover:text-foreground data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:font-semibold"
          >
            Integrações & API
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className="text-xs h-7.5 px-3 shrink-0 cursor-pointer font-medium text-foreground hover:text-foreground data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:font-semibold"
          >
            Empresa & Sistema
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* ABA 1: PERFIL & CONTA */}
        {/* ========================================================================= */}
        <TabsContent value="profile" className="space-y-6 max-w-4xl">
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-[#FF6B00]" /> Dados do Consultor
              </CardTitle>
              <CardDescription>
                Informações visíveis para a equipe e anexadas nos relatórios e transcrições.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#FF6B00]">
                  <AvatarImage src={profileForm.avatar} />
                  <AvatarFallback className="text-lg">{profileForm.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      const newUrl = prompt("Insira a URL da imagem de avatar:", profileForm.avatar);
                      if (newUrl) setProfileForm({ ...profileForm, avatar: newUrl });
                    }}
                  >
                    Alterar Foto
                  </Button>
                  <p className="text-[11px] text-muted-foreground">Recomendado: 250x250px (JPG ou PNG)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome Completo</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">E-mail Corporativo</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone / WhatsApp</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Cargo / Função</Label>
                  <Input
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Biografia Comercial / Mini Pitch</Label>
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-end">
              <Button onClick={handleSaveProfile} className="bg-[#FF6B00] hover:bg-[#E65C00] text-white">
                <Save className="h-4 w-4 mr-1.5" /> Salvar Alterações
              </Button>
            </CardFooter>
          </Card>

          {/* Segurança / Alteração de Senha */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" /> Segurança & Acesso
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso ao painel do CRM Focus Tech.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Senha Atual</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Nova Senha</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Confirmar Nova Senha</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPassword ? "Ocultar Senhas" : "Ver Senhas"}
                </button>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-end">
              <Button onClick={handleUpdatePassword} variant="outline" className="border-border">
                Atualizar Senha
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 2: PREFERÊNCIAS DE NOTIFICAÇÃO */}
        {/* ========================================================================= */}
        <TabsContent value="notifications" className="space-y-6 max-w-4xl">
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" /> Canais de Entrega
              </CardTitle>
              <CardDescription>
                Escolha por onde deseja ser notificado sobre as atividades da operação.
              </CardDescription>
            </CardHeader>

            <CardContent className="divide-y space-y-4">
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Notificações no Navegador (In-App)</p>
                  <p className="text-xs text-muted-foreground">Exibe alertas no sino e pop-ups durante a navegação no CRM.</p>
                </div>
                <Switch
                  checked={notifPrefs.inApp}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, inApp: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Alerta Sonoro (Chime)</p>
                  <p className="text-xs text-muted-foreground">Toca um sinal sonoro ao receber lembretes urgentes de reuniões.</p>
                </div>
                <Switch
                  checked={notifPrefs.sound}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, sound: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Alertas via WhatsApp (Focus Bot)</p>
                  <p className="text-xs text-muted-foreground">Receba lembretes de chamadas do Google Meet direto no seu WhatsApp.</p>
                </div>
                <Switch
                  checked={notifPrefs.whatsappAlerts}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, whatsappAlerts: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Resumo Diário por E-mail</p>
                  <p className="text-xs text-muted-foreground">Envio matinal com a lista de compromissos e tarefas do dia.</p>
                </div>
                <Switch
                  checked={notifPrefs.emailDigest}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, emailDigest: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FF6B00]" /> Gatilhos por Módulo
              </CardTitle>
              <CardDescription>
                Selecione os eventos de negócios que devem gerar notificações.
              </CardDescription>
            </CardHeader>

            <CardContent className="divide-y space-y-4">
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-emerald-500" /> Reuniões do Google Meet
                  </p>
                  <p className="text-xs text-muted-foreground">Notificar 15 minutos antes do início de cada chamada agendada.</p>
                </div>
                <Switch
                  checked={notifPrefs.alertMeetings}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, alertMeetings: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <FileAudio className="h-4 w-4 text-purple-500" /> Transcrições IA Processadas
                  </p>
                  <p className="text-xs text-muted-foreground">Avisar quando a IA estruturar o relatório da chamada com participantes e ações.</p>
                </div>
                <Switch
                  checked={notifPrefs.alertTranscriptions}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, alertTranscriptions: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" /> Metas Batidas & Fechamentos
                  </p>
                  <p className="text-xs text-muted-foreground">Comemorar em tempo real quando um membro da equipe atingir 100% da meta.</p>
                </div>
                <Switch
                  checked={notifPrefs.alertGoals}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, alertGoals: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-500" /> Novos Leads & Avanço no Pipeline
                  </p>
                  <p className="text-xs text-muted-foreground">Notificar quando novos leads forem atribuídos ou mudarem de estágio.</p>
                </div>
                <Switch
                  checked={notifPrefs.alertLeads}
                  onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, alertLeads: v })}
                />
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-end">
              <Button onClick={handleSaveNotifPrefs} className="bg-[#FF6B00] hover:bg-[#E65C00] text-white">
                <Save className="h-4 w-4 mr-1.5" /> Salvar Preferências
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 3: GESTÃO DE EQUIPE & PERMISSÕES */}
        {/* ========================================================================= */}
        <TabsContent value="team" className="space-y-6 max-w-5xl">
          <Card className="border bg-card shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" /> Membros da Operação Comercial
                </CardTitle>
                <CardDescription>
                  Controle os usuários que possuem acesso ao CRM, seus cargos e níveis de privilégio.
                </CardDescription>
              </div>

              <Button
                onClick={() => setOpenInviteModal(true)}
                className="bg-[#FF6B00] hover:bg-[#E65C00] text-white text-xs h-8 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> + Convidar Colaborador
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y border-t">
                {teamList.map((member) => {
                  const accessCfg = ACCESS_LEVEL_BADGES[member.accessLevel] || ACCESS_LEVEL_BADGES.closer;

                  return (
                    <div
                      key={member.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground">{member.name}</h4>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${accessCfg.badge}`}>
                              {accessCfg.label}
                            </Badge>
                            {member.status === "active" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {member.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleMemberStatus(member.id)}
                          className="text-xs h-7"
                        >
                          {member.status === "active" ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 4: INTEGRAÇÕES & WEBHOOKS */}
        {/* ========================================================================= */}
        <TabsContent value="integrations" className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Meet */}
            <Card className="p-4 border bg-card shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Video className="h-5 w-5" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                    <Check className="h-3 w-3 mr-1" /> Conectado
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-foreground">Google Meet Integration</h4>
                <p className="text-xs text-muted-foreground">
                  Gera automaticamente links de reunião no Google Meet no módulo Tarefas e Agenda com 1 clique.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-8">
                Configurações do Google Meet
              </Button>
            </Card>

            {/* WhatsApp */}
            <Card className="p-4 border bg-card shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                    <Check className="h-3 w-3 mr-1" /> Ativo
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-foreground">WhatsApp Cloud API</h4>
                <p className="text-xs text-muted-foreground">
                  Disparo de scripts de abordagem, follow-up executivo e convites de reuniões no WhatsApp.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-8">
                Gerenciar Conexão WhatsApp
              </Button>
            </Card>
          </div>

          {/* Webhooks */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="h-4 w-4 text-purple-500" /> Webhooks de Automação (N8N / Zapier)
              </CardTitle>
              <CardDescription>
                Envie eventos em tempo real para automações externas quando negócios forem ganhos ou reuniões forem concluídas.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Endpoint URL (Webhook Target)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <Button onClick={handleTestWebhook} variant="outline" className="text-xs shrink-0 h-9">
                    <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" /> Testar Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chaves de API */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" /> Chaves de API do CRM
              </CardTitle>
              <CardDescription>
                Utilize seu token de autenticação para integrar ferramentas externas com o Focus CRM.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Chave Secreta de Produção</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    readOnly
                    value={apiKey}
                    className="text-xs font-mono bg-muted"
                  />
                  <Button onClick={handleCopyApiKey} variant="outline" className="text-xs shrink-0 h-9">
                    {copiedKey ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedKey ? "Copiado!" : "Copiar Token"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 5: EMPRESA & SISTEMA */}
        {/* ========================================================================= */}
        <TabsContent value="organization" className="space-y-6 max-w-4xl">
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF6B00]" /> Dados da Organização
              </CardTitle>
              <CardDescription>
                Informações cadastrais e padrões de moeda e SLA da sua empresa.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Razão Social / Nome da Empresa</Label>
                  <Input
                    value={orgForm.companyName}
                    onChange={(e) => setOrgForm({ ...orgForm, companyName: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">CNPJ</Label>
                  <Input
                    value={orgForm.cnpj}
                    onChange={(e) => setOrgForm({ ...orgForm, cnpj: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Fuso Horário Padrão</Label>
                  <Select
                    value={orgForm.timezone}
                    onValueChange={(v) => setOrgForm({ ...orgForm, timezone: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">América/São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">América/Manaus (GMT-4)</SelectItem>
                      <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Moeda Padrão</Label>
                  <Select
                    value={orgForm.currency}
                    onValueChange={(v) => setOrgForm({ ...orgForm, currency: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL - Real Brasileiro (R$)</SelectItem>
                      <SelectItem value="USD">USD - Dólar Americano ($)</SelectItem>
                      <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">SLA de Primeiro Contato com Lead (minutos)</Label>
                <Input
                  type="number"
                  value={orgForm.firstContactSlaMinutes}
                  onChange={(e) => setOrgForm({ ...orgForm, firstContactSlaMinutes: e.target.value })}
                  className="text-xs max-w-xs"
                />
                <p className="text-[11px] text-muted-foreground">Tempo limite para o SDR realizar o primeiro contato após entrada no pipeline.</p>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-end">
              <Button onClick={handleSaveOrg} className="bg-[#FF6B00] hover:bg-[#E65C00] text-white">
                <Save className="h-4 w-4 mr-1.5" /> Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL CONVIDAR MEMBRO */}
      <Dialog open={openInviteModal} onOpenChange={setOpenInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Convidar Novo Colaborador
            </DialogTitle>
            <DialogDescription>
              Envie um convite de acesso para o novo membro da equipe comercial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nome Completo *</Label>
              <Input
                placeholder="Ex: Roberto Mendes"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">E-mail Corporativo *</Label>
              <Input
                type="email"
                placeholder="roberto@focustech.co"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cargo</Label>
                <Input
                  placeholder="Ex: Closer Senior"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nível de Acesso</Label>
                <Select
                  value={inviteForm.accessLevel}
                  onValueChange={(v: any) => setInviteForm({ ...inviteForm, accessLevel: v })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gestor Comercial</SelectItem>
                    <SelectItem value="closer">Closer / Vendas</SelectItem>
                    <SelectItem value="sdr">SDR / Pré-vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">WhatsApp / Celular</Label>
              <Input
                placeholder="(11) 99999-8888"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteMember} className="bg-[#FF6B00] hover:bg-[#E65C00] text-white">
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
