import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Users,
  KanbanSquare,
  MessageCircle,
  Mail,
  Phone,
  Ticket,
  Workflow,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Shield,
  Headphones,
  GraduationCap,
  Settings2,
  Sparkles,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  Building2,
  Briefcase,
  FileText,
  Activity,
  Smartphone,
  Check,
  Star,
  Zap,
  LineChart,
  PieChart,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusLogo } from "@/components/focus-logo";
import pipelineHero from "@/assets/focus-crm-pipeline-hero.png.asset.json";
import ecosystemIcon from "@/assets/focus-ecosystem-icon.png.asset.json";
import marianaPhoto from "@/assets/mariana-rocha.jpg.asset.json";
import joaoPhoto from "@/assets/joao-silva.jpg.asset.json";
import anaPhoto from "@/assets/ana-lima.jpg.asset.json";
import pedroPhoto from "@/assets/pedro-tavares.jpg.asset.json";
import pipelineMockup from "@/assets/pipeline-mockup-2x.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Focus CRM — Organize sua empresa. Conecte sua equipe. Cresça." },
      {
        name: "description",
        content:
          "Plataforma corporativa de CRM, atendimento e processos. Implantação assistida, treinamento e suporte da equipe Focus.",
      },
      { property: "og:title", content: "Focus CRM — CRM corporativo com implantação assistida" },
      {
        property: "og:description",
        content:
          "Centralize clientes, vendas, atendimento e operações em uma única plataforma integrada.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustBar />
      <PlatformOverview />
      <PipelineSection />
      <ClientsSection />
      <TeamSection />
      <OmnichannelSection />
      <AutomationSection />
      <DashboardSection />
      <EcosystemSection />
      <ImplementationSection />
      <MobileSection />
      <ResultsSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <FocusLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#plataforma" className="text-sm text-muted-foreground hover:text-foreground">Plataforma</a>
          <a href="#pipeline" className="text-sm text-muted-foreground hover:text-foreground">Pipeline</a>
          <a href="#ecossistema" className="text-sm text-muted-foreground hover:text-foreground">Ecossistema</a>
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground">Planos</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Entrar</Link></Button>
          <Button asChild size="sm" className="hidden brand-gradient text-white hover:opacity-90 md:inline-flex">
            <a href="#cta">Solicitar Demo <ArrowRight className="ml-1 h-4 w-4" /></a>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.95_0.06_60),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,oklch(0.3_0.1_40),transparent_55%)]"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-5">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Organize sua empresa. <span className="brand-text-gradient">Conecte sua equipe.</span> Cresça com eficiência.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Centralize clientes, negociações, atendimento e processos em uma única plataforma. O Focus CRM ajuda sua equipe a trabalhar de forma organizada, produtiva e escalável.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white shadow-elevated hover:opacity-90">
              <a href="#cta">Solicitar Demonstração <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#plataforma">Conhecer Plataforma</a>
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 text-sm sm:grid-cols-4">
            {[
              ["+10k", "oportunidades gerenciadas"],
              ["+50k", "atendimentos registrados"],
              ["99,9%", "disponibilidade"],
              ["100%", "implantação assistida"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-xl font-bold text-foreground">{v}</dt>
                <dd className="text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-7">
          <CRMMockup />
        </div>
      </div>
    </section>
  );
}

/* ---------------- MOCKUP CRM ---------------- */
function CRMMockup() {
  return (
    <figure className="relative mx-auto w-full max-w-[940px]">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/15 via-transparent to-primary/5 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-elevated">
        <img
          src={pipelineHero.url}
          alt="Interface do Focus CRM com indicadores comerciais e pipeline de vendas em Kanban"
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full object-contain"
        />
      </div>
    </figure>
  );
}

/* ---------------- CHANNEL INTEGRATIONS ---------------- */
function TrustBar() {
  const channels = [
    { name: "WhatsApp", slug: "whatsapp", color: "25D366" },
    { name: "Instagram", slug: "instagram", color: "E4405F" },
    { name: "Messenger", slug: "messenger", color: "00B2FF" },
    { name: "Telegram", slug: "telegram", color: "26A5E4" },
    { name: "Gmail", slug: "gmail", color: "EA4335" },
    { name: "Outlook", slug: "maildotru", color: "0078D4" },
    { name: "Slack", slug: "slack", color: "4A154B", fallback: MessageCircle },
    { name: "Microsoft Teams", slug: "microsoftteams", color: "6264A7", fallback: Users },
  ];
  return (
    <section className="border-b bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Integrações com diversos canais
        </p>
        <div className="grid grid-cols-4 items-center justify-items-center gap-8 md:grid-cols-8">
          {channels.map((c) => (
            <div
              key={c.name}
              title={c.name}
              className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
            >
              {c.fallback ? (
                <c.fallback aria-label={c.name} className="h-9 w-9 text-primary" strokeWidth={1.8} />
              ) : (
                <img
                  src={`https://cdn.simpleicons.org/${c.slug}/${c.color}`}
                  alt={c.name}
                  loading="lazy"
                  className="h-9 w-9 object-contain"
                />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PLATFORM OVERVIEW ---------------- */
function PlatformOverview() {
  return (
    <section id="plataforma" className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Plataforma"
          title="Tudo que sua empresa precisa para organizar clientes, vendas e operações"
          desc="Cadastros, pipeline, contratos, tarefas, agenda e atendimento em um único ambiente corporativo."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, t: "Clientes 360°", d: "Histórico completo, contratos, documentos e linha do tempo." },
            { icon: KanbanSquare, t: "Pipeline visual", d: "Kanban com etapas, valores, responsáveis e probabilidade." },
            { icon: Calendar, t: "Agenda integrada", d: "Reuniões, follow-ups e tarefas sincronizadas." },
            { icon: FileText, t: "Contratos", d: "Geração, envio e acompanhamento centralizado." },
            { icon: MessageCircle, t: "Atendimento omnichannel", d: "WhatsApp, e-mail, telefone e tickets unificados." },
            { icon: Workflow, t: "Automações", d: "Fluxos sem código para padronizar processos." },
            { icon: BarChart3, t: "Dashboards executivos", d: "Indicadores comerciais, operacionais e de equipe." },
            { icon: Shield, t: "Permissões e LGPD", d: "Controle granular por usuário, setor e papel." },
          ].map((f) => (
            <div key={f.t} className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PIPELINE SECTION ---------------- */
function PipelineSection() {
  return (
    <section id="pipeline" className="border-b bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHead
              eyebrow="Pipeline"
              title="Gestão visual de oportunidades"
              desc="Acompanhe etapas, valores, responsáveis e probabilidade de conversão em tempo real. Padronize o processo comercial de toda a empresa."
              align="left"
            />
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Valor consolidado por etapa",
                "Previsão de fechamento ponderada",
                "Distribuição automática de leads",
                "Alertas de oportunidades paradas",
                "Histórico completo de movimentações",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  <span className="text-muted-foreground">{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border bg-card p-2 shadow-elevated sm:p-3">
              <img
                src={pipelineMockup.url}
                alt="Pipeline comercial do Focus CRM mostrando etapas de Lead, Contato, Proposta, Negociação, Fechamento e Cliente Ativo com valores e oportunidades"
                width={1425}
                height={618}
                className="w-full rounded-xl object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------------- CLIENTS SECTION ---------------- */
function ClientsSection() {
  return (
    <section className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <ClientMockup />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <SectionHead
              eyebrow="Clientes"
              title="Visão 360° de cada cliente"
              desc="Toda a relação com o cliente em um único cadastro: dados, contratos, propostas, mensagens, documentos e linha do tempo de atendimento."
              align="left"
            />
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Dados cadastrais e fiscais",
                "Histórico completo de atendimento",
                "Contratos, propostas e documentos",
                "Tarefas e atividades vinculadas",
                "Mensagens e ligações registradas",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  <span className="text-muted-foreground">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-elevated">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">Clientes / Grupo Helvetia</span>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-4 border-r p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl brand-gradient text-white font-bold">GH</div>
            <div>
              <div className="font-display text-base font-bold">Grupo Helvetia</div>
              <div className="text-xs text-muted-foreground">Indústria · 250+ colaboradores</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-xs">
            {[
              [Building2, "CNPJ 12.345.678/0001-90"],
              [Phone, "+55 11 4002-8922"],
              [Mail, "contato@helvetia.com.br"],
              [Target, "Responsável: Mariana R."],
            ].map(([I, t]: any) => (
              <div key={t} className="flex items-center gap-2.5 text-muted-foreground">
                <I className="h-3.5 w-3.5 text-primary" /> {t}
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[["LTV", "R$ 420k"], ["NPS", "9.2"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border bg-background p-2.5">
                <div className="text-[10px] uppercase text-muted-foreground">{l}</div>
                <div className="font-display text-sm font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-8 p-5">
          <div className="mb-3 flex items-center gap-4 border-b pb-2 text-xs">
            <span className="border-b-2 border-primary pb-2 font-semibold text-foreground">Linha do tempo</span>
            <span className="text-muted-foreground">Contratos</span>
            <span className="text-muted-foreground">Propostas</span>
            <span className="text-muted-foreground">Tarefas</span>
          </div>
          <div className="space-y-3">
            {[
              { i: MessageCircle, t: "Reunião de alinhamento", d: "Mariana R. · há 2 horas", c: "Cliente solicitou expansão para 3 novas unidades." },
              { i: FileText, t: "Proposta enviada", d: "Sistema · ontem", c: "Pacote Enterprise · R$ 420.000 / 24 meses." },
              { i: Phone, t: "Ligação registrada", d: "João S. · 3 dias", c: "Apresentação técnica concluída." },
              { i: CheckCircle2, t: "Contrato assinado", d: "Sistema · 1 semana", c: "Implantação iniciada em 02/01/2026." },
            ].map((e, idx) => (
              <div key={idx} className="flex gap-3 rounded-lg border bg-background p-3">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-accent text-primary">
                  <e.i className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{e.t}</span>
                    <span className="text-muted-foreground">{e.d}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.c}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- TEAM SECTION ---------------- */
function TeamSection() {
  return (
    <section className="border-b bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Equipe"
          title="Sua equipe alinhada em um único ambiente"
          desc="Metas, tarefas, agenda e indicadores individuais e por setor — produtividade visível em tempo real."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Performance da equipe</h3>
              <span className="text-xs text-muted-foreground">Janeiro 2026</span>
            </div>
            <div className="space-y-3">
              {[
                { n: "Mariana Rocha", r: "SDR", m: 92, v: "R$ 384k", photo: marianaPhoto.url },
                { n: "João Silva", r: "Comercial", m: 78, v: "R$ 256k", photo: joaoPhoto.url },
                { n: "Ana Lima", r: "Atendimento", m: 88, v: "1.240 tickets", photo: anaPhoto.url },
                { n: "Pedro Tavares", r: "Pré-vendas", m: 65, v: "R$ 184k", photo: pedroPhoto.url },
              ].map((p) => (
                <div key={p.n} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photo}
                        alt={`Foto de ${p.n}`}
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold">{p.n}</div>
                        <div className="text-[11px] text-muted-foreground">{p.r}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{p.v}</div>
                      <div className="text-[11px] text-success">{p.m}% da meta</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full brand-gradient" style={{ width: `${p.m}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { i: Target, l: "Meta do mês", v: "R$ 1.2M", s: "82% atingido" },
              { i: CheckCircle2, l: "Tarefas concluídas", v: "1.847", s: "+18% vs. dez" },
              { i: Clock, l: "Tempo médio de resposta", v: "2m 18s", s: "Dentro do SLA" },
            ].map((c) => (
              <div key={c.l} className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <c.i className="h-4 w-4" />
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.l}</div>
                <div className="mt-1 font-display text-2xl font-bold">{c.v}</div>
                <div className="mt-1 text-xs text-success">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- OMNICHANNEL ---------------- */
function OmnichannelSection() {
  const channels = [
    { i: MessageCircle, l: "WhatsApp", c: "bg-success/10 text-success" },
    { i: Mail, l: "E-mail", c: "bg-chart-2/10 text-chart-2" },
    { i: Phone, l: "Telefone", c: "bg-primary/10 text-primary" },
    { i: Ticket, l: "Tickets", c: "bg-chart-5/10 text-chart-5" },
    { i: Headphones, l: "Suporte", c: "bg-warning/10 text-warning" },
  ];
  return (
    <section className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHead
              eyebrow="Atendimento"
              title="Toda a comunicação do cliente em um único lugar"
              desc='"Nunca mais perca informações importantes dos seus clientes." WhatsApp, e-mail, telefone, tickets e suporte centralizados com histórico completo.'
              align="left"
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {channels.map((c) => (
                <div key={c.l} className="rounded-xl border bg-card p-4 text-center shadow-card">
                  <div className={`mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg ${c.c}`}>
                    <c.i className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">{c.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-elevated">
            <div className="border-b bg-muted/40 px-4 py-2.5 text-xs font-medium">Caixa de entrada unificada</div>
            <div className="divide-y">
              {[
                { c: "bg-success", ch: "WhatsApp", n: "Carla Mendes", t: "Gostaria de fechar a proposta…", d: "2m" },
                { c: "bg-chart-2", ch: "E-mail", n: "Construtora Vega", t: "Re: Renovação contrato 2026", d: "14m" },
                { c: "bg-primary", ch: "Telefone", n: "João Pereira", t: "Ligação perdida · 0:38", d: "1h" },
                { c: "bg-chart-5", ch: "Ticket", n: "#4821 · Suporte", t: "Integração WhatsApp Business", d: "3h" },
                { c: "bg-warning", ch: "Suporte", n: "Studio Arq+", t: "Treinamento de novos usuários", d: "5h" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                  <span className={`h-2 w-2 rounded-full ${m.c}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{m.n}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.ch}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{m.t}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- AUTOMATION ---------------- */
function AutomationSection() {
  const steps = [
    { i: Users, t: "Novo Lead" },
    { i: Workflow, t: "Distribuição automática" },
    { i: Calendar, t: "Follow-up agendado" },
    { i: FileText, t: "Envio de proposta" },
    { i: Target, t: "Fechamento" },

  ];
  return (
    <section className="border-b bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Automações"
          title="Padronize processos com fluxos visuais"
          desc="Crie automações sem código que conectam pipeline, atendimento, equipe e dashboards."
        />
        <div className="mt-14">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 px-4 lg:px-0">

            {steps.map((s, i) => (
              <div key={s.t} className="flex items-center gap-2">
                <div className="flex w-36 flex-col items-center rounded-xl border bg-card p-3 text-center shadow-card">
                  <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                    <s.i className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold">{s.t}</div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- DASHBOARD ---------------- */
function DashboardSection() {
  return (
    <section className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Dashboards"
          title="Visão executiva em tempo real"
          desc="Acompanhe a operação comercial e o desempenho de cada equipe em um painel corporativo."
        />
        <div className="mt-14 overflow-hidden rounded-2xl border bg-card shadow-elevated">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5 text-xs">
            <span className="font-medium">Dashboard executivo · Q1 2026</span>
            <span className="text-muted-foreground">Atualizado há 2 min</span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b p-5 md:grid-cols-5">
            {[
              ["Novos leads", "1.284", TrendingUp],
              ["Oportunidades", "R$ 7.7M", LineChart],
              ["Conversões", "32%", Target],
              ["Receita prevista", "R$ 2.4M", BarChart3],
              ["Clientes ativos", "1.547", Users],
            ].map(([l, v, I]: any) => (
              <div key={l} className="rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
                  <I className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="mt-1 font-display text-xl font-bold">{v}</div>
                <div className="mt-0.5 text-[10px] text-success">+12% vs. trimestre anterior</div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-3">
            <div className="rounded-lg border bg-background p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Receita prevista por mês</span>
                <span className="text-xs text-muted-foreground">2026</span>
              </div>
              <div className="flex h-44 items-end gap-2">
                {[42, 58, 65, 72, 68, 84, 91, 78, 88, 95, 82, 100].map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div
                      className="w-full rounded-t bg-success"
                      style={{ height: `calc(${h}% - 14px)` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Funil de conversão</span>
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-2.5">
                {[
                  ["Leads", 100, "bg-chart-2"],
                  ["Contato", 68, "bg-warning"],
                  ["Proposta", 45, "bg-primary"],
                  ["Negociação", 32, "bg-chart-5"],
                  ["Fechamento", 18, "bg-success"],
                ].map(([l, p, c]: any) => (
                  <div key={l}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{l}</span>
                      <span className="font-semibold">{p}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${c}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ECOSYSTEM ---------------- */
function EcosystemSection() {
  const modules = ["Focus ERP", "Focus BI", "Focus Finance", "Focus Log", "Focus E-commerce", "Focus Suporte"];
  return (
    <section id="ecossistema" className="border-b bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Ecossistema Focus"
          title="Integrado com toda a operação da sua empresa"
          desc="O Focus CRM se conecta nativamente ao restante do ecossistema, do pedido à entrega."
        />
        <div className="relative mx-auto mt-16 grid max-w-3xl place-items-center">
          <div className="relative grid h-[420px] w-full place-items-center">
            <div className="absolute h-72 w-72 rounded-full border border-dashed border-primary/30" />
            <div className="absolute h-[420px] w-[420px] rounded-full border border-dashed border-primary/20" />
            <img
              src={ecosystemIcon.url}
              alt="Símbolo Focus"
              width={144}
              height={144}
              className="z-10 h-36 w-36 object-contain"
            />
            {modules.map((m, i) => {
              const angle = (i / modules.length) * Math.PI * 2 - Math.PI / 2;
              const r = 180;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <div
                  key={m}
                  className="absolute rounded-xl border bg-card px-3 py-2 text-xs font-semibold shadow-card"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  {m}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          CRM envia vendas → ERP recebe pedidos → Finance gera cobranças → BI gera indicadores → Log acompanha entregas.
        </p>
      </div>
    </section>
  );
}

/* ---------------- IMPLEMENTATION ---------------- */
function ImplementationSection() {
  const steps = [
    { i: Search, t: "Diagnóstico Inicial", d: "Mapeamento dos processos e necessidades da empresa." },
    { i: Settings2, t: "Configuração Personalizada", d: "Adequação da plataforma à realidade do seu negócio." },
    { i: GraduationCap, t: "Treinamento da Equipe", d: "Capacitação completa de gestores e operacional." },
    { i: Headphones, t: "Acompanhamento", d: "Suporte humanizado e contínuo da equipe Focus." },
    { i: TrendingUp, t: "Evolução", d: "Otimização constante dos processos e indicadores." },
  ];
  return (
    <section className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Implantação assistida"
          title="Não entregamos apenas um sistema. Implantamos um método de gestão."
          desc="A equipe Focus acompanha cada etapa, do diagnóstico à evolução contínua dos seus processos."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border bg-card p-6 shadow-card">
              <div className="absolute -top-3 left-6 grid h-7 w-7 place-items-center rounded-full brand-gradient text-xs font-bold text-white shadow-card">
                {i + 1}
              </div>
              <div className="mb-3 mt-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <s.i className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- MOBILE ---------------- */
function MobileSection() {
  return (
    <section className="relative overflow-hidden border-b bg-muted/30 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead
            eyebrow="Focus CRM Mobile"
            title="Sua operação na palma da mão"
            desc="Pipeline, clientes, agenda, tarefas e atendimento — disponíveis onde sua equipe estiver."
            align="left"
          />
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {["Pipeline", "Clientes", "Agenda", "Tarefas", "Notificações", "Indicadores", "Atendimento", "Negociações"].map((i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <Smartphone className="h-3.5 w-3.5 text-primary" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative grid place-items-center">
          <div className="flex gap-6">
            {[0, 1].map((idx) => (
              <PhoneFrame key={idx} className={idx === 1 ? "translate-y-8" : "-translate-y-2"}>
                {idx === 0 ? <MobilePipelinePreview /> : <MobileClientPreview />}
              </PhoneFrame>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* side buttons */}
      <div className="absolute -left-[2px] top-24 h-7 w-[3px] rounded-l-sm bg-zinc-700" />
      <div className="absolute -left-[2px] top-36 h-12 w-[3px] rounded-l-sm bg-zinc-700" />
      <div className="absolute -left-[2px] top-52 h-12 w-[3px] rounded-l-sm bg-zinc-700" />
      <div className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r-sm bg-zinc-700" />
      {/* outer titanium frame */}
      <div className="relative w-[232px] rounded-[2.75rem] bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-800 p-[3px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        {/* inner bezel */}
        <div className="rounded-[2.6rem] bg-black p-[8px]">
          {/* screen */}
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-card">
            {/* dynamic island */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
            {/* status bar */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-[10px] text-[9px] font-semibold text-foreground">
              <span>9:41</span>
              <span className="opacity-0">·</span>
            </div>
            <div className="px-3 pb-4 pt-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


function MobilePipelinePreview() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold">Pipeline</div>
      <div className="rounded-lg bg-muted p-2">
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Proposta · 8</div>
        <div className="mt-1.5 space-y-1.5">
          {["Helvetia · R$ 420k", "Logística Alfa · R$ 240k", "Distrib. Sul · R$ 98k"].map((t) => (
            <div key={t} className="rounded bg-background p-1.5 text-[10px] font-medium shadow-card">{t}</div>
          ))}
        </div>
      </div>
      <div className="rounded-lg bg-muted p-2">
        <div className="text-[10px] font-semibold uppercase text-muted-foreground">Fechamento · 3</div>
        <div className="mt-1.5 space-y-1.5">
          <div className="rounded bg-background p-1.5 text-[10px] font-medium shadow-card">Vega · R$ 84k</div>
        </div>
      </div>
    </div>
  );
}
function MobileClientPreview() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-xs font-bold text-white">GH</div>
        <div>
          <div className="text-xs font-bold">Grupo Helvetia</div>
          <div className="text-[9px] text-muted-foreground">Cliente ativo</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[["LTV", "R$ 420k"], ["NPS", "9.2"]].map(([l, v]) => (
          <div key={l} className="rounded border bg-background p-1.5">
            <div className="text-[8px] uppercase text-muted-foreground">{l}</div>
            <div className="text-xs font-bold">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {["Reunião há 2h", "Proposta enviada", "Contrato ativo"].map((t) => (
          <div key={t} className="flex items-center gap-1.5 rounded border bg-background p-1.5 text-[10px]">
            <CheckCircle2 className="h-3 w-3 text-success" /> {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- RESULTS ---------------- */
function ResultsSection() {
  const items = [
    { i: TrendingUp, v: "+40%", t: "Mais produtividade", d: "Equipes mais focadas no que importa." },
    { i: Shield, v: "-32%", t: "Redução de perdas comerciais", d: "Nenhuma oportunidade esquecida." },
    { i: Target, v: "100%", t: "Processos padronizados", d: "Padrão único em toda a operação." },
    { i: Activity, v: "3x", t: "Mais controle operacional", d: "Indicadores em tempo real." },
    { i: LineChart, v: "+28%", t: "Previsibilidade de receita", d: "Forecast confiável por etapa." },
    { i: Star, v: "9.2", t: "NPS dos clientes Focus", d: "Atendimento e suporte humanizados." },
  ];
  return (
    <section className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Resultados"
          title="Crescimento mensurável, processos previsíveis"
          desc="Indicadores médios das empresas que implantaram o Focus CRM com a metodologia Focus."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <it.i className="h-5 w-5" />
              </div>
              <div className="brand-text-gradient font-display text-4xl font-bold">{it.v}</div>
              <div className="mt-1 font-display text-base font-semibold">{it.t}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function TestimonialsSection() {
  const t = [
    {
      q: "Conseguimos padronizar todo o processo comercial em 60 dias. Nossa equipe ganhou previsibilidade e controle.",
      n: "Roberto Almeida",
      r: "Diretor Comercial · Grupo Helvetia",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces",
    },
    {
      q: "A implantação assistida fez toda a diferença. Não foi apenas um sistema, foi um método de gestão.",
      n: "Patrícia Souza",
      r: "CEO · Studio Arq+",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    },
    {
      q: "Centralizar WhatsApp, e-mail e tickets reduziu drasticamente o tempo de resposta dos atendentes.",
      n: "Marcos Ribeiro",
      r: "Coordenador de Atendimento · Construtora Vega",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    },
  ];
  return (
    <section className="border-b bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead eyebrow="Depoimentos" title="O que dizem nossos clientes" />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {t.map((x) => (
            <div key={x.n} className="flex flex-col rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="flex-1 text-sm text-foreground">"{x.q}"</p>
              <div className="mt-5 flex items-center gap-3 border-t pt-4">
                <img
                  src={x.img}
                  alt={x.n}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PRICING ---------------- */
function PricingSection() {
  const plans = [
    {
      n: "Starter",
      d: "Pequenas equipes começando a estruturar processos.",
      p: "R$ 149",
      u: "/usuário/mês",
      f: ["Até 5 usuários", "Pipeline e clientes", "Tarefas e agenda", "Suporte por chat"],
    },
    {
      n: "Professional",
      d: "Equipes comerciais em crescimento.",
      p: "R$ 249",
      u: "/usuário/mês",
      f: ["Usuários ilimitados", "Automações", "WhatsApp + E-mail", "Dashboards executivos", "Implantação assistida"],
      highlight: true,
    },
    {
      n: "Business",
      d: "Empresas multiequipe e multifilial.",
      p: "R$ 389",
      u: "/usuário/mês",
      f: ["Permissões avançadas", "API e integrações", "Contratos e propostas", "Suporte prioritário", "Consultoria mensal"],
    },
    {
      n: "Enterprise",
      d: "Operações corporativas de grande porte.",
      p: "Sob consulta",
      u: "",
      f: ["SLA dedicado", "Ambiente isolado", "Onboarding executivo", "Integração com Focus ERP/BI", "Gestor de conta dedicado"],
    },
  ];
  return (
    <section id="planos" className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Planos"
          title="Escolha o plano ideal para sua operação"
          desc="Todos os planos incluem implantação assistida pela equipe Focus."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.n}
              className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
                p.highlight ? "shadow-elevated ring-2 ring-primary" : "shadow-card"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-6 rounded-full brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Mais escolhido
                </div>
              )}
              <h3 className="font-display text-lg font-bold">{p.n}</h3>
              <p className="mt-1 min-h-[40px] text-xs text-muted-foreground">{p.d}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">{p.p}</span>
                <span className="text-xs text-muted-foreground">{p.u}</span>
              </div>
              <ul className="my-6 flex-1 space-y-2 text-sm">
                {p.f.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" /> {x}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={p.highlight ? "brand-gradient text-white hover:opacity-90" : ""}
                variant={p.highlight ? "default" : "outline"}
              >
                <a href="#cta">Solicitar proposta</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  return (
    <section id="cta" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl brand-gradient p-10 text-center text-white shadow-elevated md:p-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
          
          <h2 className="relative font-display text-3xl font-bold md:text-5xl">
            Sua empresa está pronta para crescer com mais organização e eficiência?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-white/90">
            Solicite uma demonstração e descubra como o Focus CRM pode transformar vendas, atendimento e gestão da sua equipe.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/auth">Agendar Demonstração <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <a href="mailto:contato@focustech.com.br">Falar com Especialista</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  const cols = [
    { t: "Produtos", l: ["Focus CRM", "Focus ERP", "Focus BI", "Focus Finance", "Focus Log", "Focus E-commerce"] },
    { t: "Empresa", l: ["Institucional", "Contato", "Carreira", "Parceiros"] },
    { t: "Suporte", l: ["Central de Ajuda", "Documentação", "Status", "Treinamentos"] },
    { t: "Legal", l: ["LGPD", "Termos de Uso", "Política de Privacidade"] },
  ];
  return (
    <footer className="border-t bg-muted/40 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <FocusLogo />
            <p className="mt-4 text-xs text-muted-foreground">
              Plataforma corporativa de CRM, atendimento e processos. Desenvolvida pela Focus Tech.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                { Icon: Youtube, href: "#", label: "YouTube" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">{c.t}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {c.l.map((x) => (
                  <li key={x}><a className="hover:text-foreground" href="#">{x}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Focus Tech. Focus CRM® é uma marca registrada. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">LGPD</a>
            <a href="#" className="hover:text-foreground">Termos</a>
            <a href="#" className="hover:text-foreground">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- SHARED ---------------- */
function SectionHead({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {desc && <p className="mt-4 text-muted-foreground">{desc}</p>}
    </div>
  );
}
