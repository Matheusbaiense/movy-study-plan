# Movy Internal Hub

Aplicação interna da Movy Education para cotações, study plans, processos e base operacional.

## Stack

- Next.js App Router
- Supabase Auth/Postgres/RLS
- OpenWolf para memória operacional, logs e coordenação com agentes
- TypeScript

## Setup local

Copie `.env.example` para `.env.local` e preencha as chaves necessárias:

```bash
npm ci
npm run dev
```

O banco Supabase já contém as tabelas principais do hub, `audit_logs` e `study_plans`.

## Study Plans

O módulo de cotações cobre os padrões principais encontrados nos study plans:

- ELICOS vendido por semanas, com tuition semanal, material, matrícula, férias e depósito por semanas.
- VET com tuition total, matrícula, material opcional, scholarship e parcelamento.
- Higher Education com tuition total, matrícula e sem material por padrão.
- Custos adicionais por tipo de aplicante, incluindo OSHC, visto, médico e taxas administrativas.
- Cronograma calculado por blocos de estudo/férias e resumo financeiro.

## Deploy

Esta versão usa Next.js com rotas dinâmicas e Supabase, então deve ir para Vercel ou outro host Node/Next. GitHub Pages servia apenas para a versão estática antiga.
