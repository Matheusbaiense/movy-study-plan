# Backup & Disaster Recovery

## Supabase Automated Backups

Backups automáticos são gerenciados pelo Supabase:

- **Plano Free:** backups diários, retenção de 7 dias (ponto-no-tempo não disponível)
- **Plano Pro+:** Point-in-Time Recovery (PITR) com retenção de 7–90 dias
- **Verificar configuração:** Supabase Dashboard → Project → Database → Backups

**Project ID:** `xpthmguzcbmndyyexfbt`

## Export Manual (Supabase CLI)

```bash
# Instalar CLI se necessário
npm install -g supabase

# Autenticar
supabase login

# Dump completo do schema + dados
supabase db dump \
  --db-url "postgresql://postgres:[password]@db.xpthmguzcbmndyyexfbt.supabase.co:5432/postgres" \
  -f backup-$(date +%Y%m%d).sql

# Somente schema (sem dados)
supabase db dump --db-url "..." --schema-only -f schema-$(date +%Y%m%d).sql

# Somente dados (sem schema)
supabase db dump --db-url "..." --data-only -f data-$(date +%Y%m%d).sql
```

A senha do banco fica em: Supabase Dashboard → Project Settings → Database → Database Password.

## Restore a partir de Dump

```bash
# Restore em novo projeto Supabase
psql "postgresql://postgres:[password]@db.[new-project-id].supabase.co:5432/postgres" \
  -f backup-20260101.sql

# Restore local (Docker)
supabase start
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f backup-20260101.sql
```

## Migração para VPS (PostgreSQL standalone)

Se migrar do Supabase gerenciado para PostgreSQL em VPS própria:

1. **Dump do Supabase:**
   ```bash
   pg_dump --no-owner --no-privileges \
     "postgresql://postgres:[pw]@db.xpthmguzcbmndyyexfbt.supabase.co:5432/postgres" \
     -f full-backup.sql
   ```

2. **Restore no PostgreSQL da VPS:**
   ```bash
   psql -U postgres -d movy_production -f full-backup.sql
   ```

3. **Atualizar variáveis de ambiente:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[nova-url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[nova-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[nova-service-key]
   ```

4. **Auth:** Se sair do Supabase Auth, migrar para NextAuth ou Lucia.
   - Exportar `auth.users` antes de migrar
   - Considerar manter Supabase Auth mesmo com DB em VPS (possível via proxy)

5. **Storage:** Se usar Supabase Storage para arquivos, migrar para S3/R2 ou MinIO.
   - Exportar buckets via `supabase storage download`

> Referência: [`docs/AI-HANDOVER.md`](./AI-HANDOVER.md) — seção VPS Migration Plan

## Verificação Periódica (recomendado mensal)

```bash
# 1. Verificar que backups automáticos estão ativos no dashboard
# 2. Testar restore em projeto/DB de homologação
# 3. Verificar que todas as migrations estão commitadas em supabase/migrations/
supabase db diff --local  # deve retornar vazio se schema == migrations

# 4. Confirmar que variáveis críticas estão no Vercel
vercel env ls --environment=production
```

## Contato de Emergência

Em caso de perda de dados ou indisponibilidade crítica:
- Supabase Status: https://status.supabase.com
- Supabase Support: https://supabase.com/support
