# Desenvolvendo no GitHub Codespaces

Este repo já vem pronto pra Codespaces (`.devcontainer/devcontainer.json`: Node 20,
`npm install` automático e porta 3000 encaminhada). Assim você desenvolve no navegador,
sem peso no PC local e **sem o Google Drive no meio do caminho**.

## 1. Criar o Codespace

1. Abra **https://github.com/Matheusbaiense/movy-study-plan**
2. Botão verde **`< > Code`** → aba **Codespaces** → **Create codespace on main**
3. Espere o build (~2 min). O devcontainer roda `npm install` sozinho.

> Conta de estudante (GitHub Student Pack) dá mais horas de Codespaces grátis.

## 2. Configurar as variáveis de ambiente

O Codespace **não** herda os segredos da Vercel — você precisa criar um `.env.local`.
Os valores ficam em **Vercel → projeto `movy-study-plan` → Settings → Environment Variables**.

No terminal do Codespace:

```bash
cp .env.example .env.local
# edite .env.local e cole os valores reais (Supabase + Wise)
code .env.local
```

Mínimo pra subir a UI: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(já vêm preenchidos no exemplo). `WISE_API_TOKEN` é opcional — sem ele o câmbio cai
nos provedores grátis (mid-market, sem a taxa da Wise).

> **Atalho pra design sem auth:** `MOVY_PREVIEW=1` no `.env.local` faz o app rodar como
> um super_admin fake, pulando o login do Supabase. Não use em produção.

### Alternativa: Codespaces Secrets (recomendado pra não recriar o .env toda vez)

Em **GitHub → Settings → Codespaces → Secrets**, cadastre `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WISE_API_TOKEN` e
`WISE_PROFILE_ID` com escopo neste repo. Eles entram como variáveis de ambiente em todo
Codespace novo — aí nem precisa do `.env.local` (o Next lê de `process.env`).

## 3. Rodar

```bash
npm run dev
```

A porta 3000 abre em preview automaticamente. Rotas úteis: `/pt/cambio`, `/pt/financial`,
`/pt/study-plans`.

## 4. Fluxo de trabalho

- Edite, comite e dê push normalmente pelo terminal do Codespace.
- Push em `main` → a Vercel faz deploy de produção automático.
- Branches → preview deploy por branch (link no PR).

## Notas

- **OAuth do Google (login real):** o callback do Supabase usa allowlist de domínios. A
  URL do Codespace (`*.app.github.dev`) muda a cada criação, então pra testar o login de
  verdade ou você adiciona a URL na config de Auth do Supabase, ou usa `MOVY_PREVIEW=1`.
- **Validação rápida:** `npx tsc --noEmit` e `npm run build` rodam direto no Codespace
  (no PC local o Drive corrompe o `node_modules` — esse problema some no Codespace).
- **Segredos:** nunca comite `.env.local`. Os tokens da Wise e a service-role key são
  secretos — só na Vercel e/ou Codespaces Secrets.
