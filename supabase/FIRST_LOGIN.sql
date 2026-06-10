-- ============================================================
-- Movy Internal Hub — Primeiro Login / First Login Setup
-- ============================================================
-- Executar NO Supabase SQL Editor DEPOIS do primeiro login com Google.
-- Run in Supabase SQL Editor AFTER your first Google login.
--
-- Dashboard: https://supabase.com/dashboard/project/xpthmguzcbmndyyexfbt
-- ============================================================

-- PASSO 1: Verificar se o teu perfil foi criado automaticamente
-- Após o primeiro login, deves ver uma linha com is_active = false
SELECT id, email, role, is_active FROM public.profiles;

-- PASSO 2: Promover o teu utilizador a super_admin e activar
-- Substitui 'admin@movyeducation.com' pelo teu email
UPDATE public.profiles
SET
  role      = 'super_admin',
  is_active = TRUE
WHERE email = 'admin@movyeducation.com';

-- PASSO 3: Confirmar
SELECT id, email, role, is_active FROM public.profiles WHERE email = 'admin@movyeducation.com';

-- ============================================================
-- ADICIONAR MAIS MEMBROS DA EQUIPA
-- Após promoveres o teu utilizador, os outros podem:
--   1. Fazer login com Google (@movyeducation.com)
--   2. O perfil é criado com is_active = FALSE e role = 'reader'
--   3. Tu activas e defines o role na página /users do Hub
--      (ou com SQL aqui em baixo enquanto a página não está pronta)
-- ============================================================

-- Exemplo: activar e promover outro membro
-- UPDATE public.profiles
-- SET role = 'editor', is_active = TRUE
-- WHERE email = 'bia@movyeducation.com';

-- Roles disponíveis: 'reader' | 'editor' | 'admin' | 'super_admin'
-- super_admin: invisível para admins — apenas tu (super_admin) o vês
