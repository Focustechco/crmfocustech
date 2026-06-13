## Focus CRM — visão geral

O escopo que você descreveu é um SaaS gigante (CRM + WhatsApp + Automação + Financeiro + IA + Mobile + White-label). Construir tudo de uma vez resulta em um app raso e instável. Vou entregar em **fases**, cada uma já funcional e bonita, começando por uma **v1 sólida** que estabelece identidade visual, autenticação e o núcleo de CRM.

App nativo Android/iOS está **fora do escopo do Lovable** (web only). O web será 100% responsivo e instalável como PWA depois, se quiser.

Stack real usada: **TanStack Start + React + TypeScript + Tailwind v4 + Lovable Cloud (Postgres + Auth + Storage)** + **Lovable AI** para o Focus AI. Stripe/Evolution/OpenAI entram nas fases seguintes via secrets.

---

## Fase 1 — Fundação + CRM núcleo (esta entrega)

**Design System (Focus Tech)**
- Paleta exata: laranja `#FF6B00`, laranja escuro `#E65C00`, branco, cinzas `#F5F7FA`/`#D9DDE3`, grafite `#1A1A1A`
- Tokens semânticos em `src/styles.css` (oklch), Dark + Light Mode
- Tipografia premium (display + sans), cards suaves, ícones outline (lucide), animações sutis
- Layout app: sidebar colapsável + topbar + área de conteúdo

**Autenticação (Lovable Cloud)**
- E-mail/senha + Google
- Tabela `profiles` (nome, avatar, empresa, cargo)
- Layout `_authenticated` protegido

**Banco (Postgres + RLS)**
- `profiles`, `leads`, `pipeline_stages`, `deals`, `activities`, `tags`
- RLS por `auth.uid()` — cada usuário vê só os seus dados

**Telas v1**
1. Landing pública minimalista com slogan "Organize. Automatize. Cresça."
2. `/auth` — login / signup
3. `/dashboard` — KPIs (leads, deals, receita do mês, conversão, tarefas), gráfico de funil + receita mensal, agenda do dia, últimos contatos
4. `/leads` — tabela com busca, filtros, tags, criar/editar/excluir, importar CSV
5. `/pipeline` — Kanban drag-and-drop com etapas personalizáveis (Novo Lead → Pós-venda), score e probabilidade
6. `/clients` — listagem + timeline básica do cliente
7. `/settings` — perfil, marca, tema (dark/light), etapas do pipeline

---

## Fases seguintes (peça quando quiser)

- **Fase 2 — Vendas & Tarefas:** propostas, orçamentos, contratos, tarefas estilo ClickUp (lista/kanban/calendário), calendário com Google/Outlook
- **Fase 3 — WhatsApp CRM:** integração Evolution API, multiatendimento, respostas rápidas, etiquetas
- **Fase 4 — Automação:** editor visual drag-and-drop (gatilhos → ações)
- **Fase 5 — E-mail & Documentos:** Gmail/Outlook/SMTP, templates, storage de contratos/PDFs
- **Fase 6 — Financeiro:** receitas, despesas, fluxo de caixa, Stripe para assinaturas/PIX/boletos
- **Fase 7 — Relatórios avançados** (PDF/Excel/CSV) + **Focus AI** (resumos, geração de propostas, insights, chat estilo ChatGPT)
- **Fase 8 — White-label:** logo, domínio, cores por workspace + papéis (Admin/Gestor/Comercial/Atendimento/Financeiro) com permissões granulares

---

## O que preciso confirmar antes de codar

1. **Aprovar começar pela Fase 1** como descrito acima? (Recomendo fortemente — base sólida antes de empilhar módulos.)
2. **Autenticação:** e-mail/senha + Google OK como padrão?
3. **Dark mode:** ativar já na v1 com toggle no header?

Se você responder só "pode ir", assumo sim para os três e começo a Fase 1.