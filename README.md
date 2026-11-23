# Tarefas RH/DP

Site pessoal para controlar as tarefas diárias do setor de RH/DP. Um único usuário, tema escuro, em português do Brasil.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Recharts · Zod + React Hook Form · TanStack Table · Vercel.

## O que tem

- **/login** e-mail e senha (Supabase Auth). Todas as outras rotas exigem login.
- **/dashboard** 6 indicadores, 4 gráficos e as 5 tarefas atrasadas mais antigas.
- **/tarefas** tabela com busca, filtros, ordenação, paginação, criar/editar/excluir, edição rápida de status e exportação CSV.
- **/relatorios** por status, prioridade, área, solicitante (com linha Total), evolução mensal e atrasadas, cada um com exportação CSV.
- **/configuracoes** áreas e solicitantes (adicionar, renomear, desativar, reordenar) e importação de tarefas por CSV.

Os cálculos de "Dias em aberto", "Situação do prazo", indicadores e relatórios ficam no banco (views e uma função SQL), sempre com a data de hoje em `America/Sao_Paulo`. Por isso dashboard, relatórios e tabela mostram os mesmos números.

## Rodar no seu computador

```bash
npm install
cp .env.example .env.local   # preencha as duas variáveis
npm run dev                  # http://localhost:3000
```

Variáveis (Supabase > Project Settings > API):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a chave `anon`/publishable, **nunca** a `service_role`)

A segurança vem da RLS: sem login, ou logado como outro usuário, ninguém vê seus dados.

## Passo a passo para publicar (iniciante)

### 1. Supabase: projeto, migrations e seed

1. Em [supabase.com](https://supabase.com), crie um projeto novo.
2. Abra **SQL Editor > New query**. Cole e rode, nesta ordem, o conteúdo de:
   1. `supabase/migrations/20250101000001_schema.sql`
   2. `supabase/migrations/20250101000002_views_relatorios.sql`
3. Faça o passo 2 abaixo (criar seu usuário) **antes** de rodar o `supabase/seed.sql`, que usa o primeiro usuário cadastrado.

> Alternativa com Supabase CLI: `supabase link --project-ref SEU_ID` e `supabase db push`.

### 2. Criar seu usuário e fechar o cadastro público

1. **Authentication > Users > Add user > Create new user.** Informe e-mail e senha e marque *Auto Confirm User*.
2. Rode o `supabase/seed.sql` no SQL Editor. Ele cria as áreas padrão e algumas tarefas de exemplo.
   Para apagar os exemplos: `delete from tarefas where observacoes like '[EXEMPLO]%';`
3. **Authentication > Sign In / Providers** (ou *Settings*): desative **Allow new users to sign up**.

### 3. GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/rh-dp-tarefas.git
git branch -M main
git push -u origin main
```

O `.gitignore` já exclui `.env*.local` e `node_modules`. Nunca suba chaves.

### 4. Vercel

1. Em [vercel.com](https://vercel.com): **Add New > Project** e importe o repositório.
2. Em *Environment Variables*, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Clique em **Deploy**.

### 5. Autorizar a URL da Vercel no Supabase

**Authentication > URL Configuration:** coloque a URL da Vercel (ex.: `https://rh-dp-tarefas.vercel.app`) em **Site URL** e adicione `https://rh-dp-tarefas.vercel.app/**` em **Redirect URLs**.

## Importar tarefas por CSV

Em **/configuracoes**, baixe o modelo, preencha e envie. Colunas: `data_entrada, prazo, area, descricao, solicitante, prioridade, status, data_conclusao, observacoes`. Datas em `dd/mm/aaaa`. Áreas e solicitantes que não existirem são criados.

## Tipos do banco

`src/lib/types.ts` tem os tipos usados no app. Para gerar os tipos oficiais do Supabase:

```bash
npm run types   # edite SEU_PROJECT_ID no package.json antes
```

## Estrutura

```
src/app/            rotas (login, dashboard, tarefas, relatorios, configuracoes) e Server Actions
src/components/     UI, gráficos, tabela, formulários
src/lib/supabase/   clientes (browser, server, middleware)
src/lib/validators/ schemas Zod
supabase/migrations SQL (tabelas, RLS, views, funções)
supabase/seed.sql   áreas padrão e tarefas de exemplo
```
