-- ============================================================
-- Movy Internal Hub — Migration 002: Content Blocks & Categories
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── EXTEND CONTENTS TABLE ─────────────────────────────────

ALTER TABLE public.contents
  ADD COLUMN IF NOT EXISTS blocks        JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS content_type  TEXT NOT NULL DEFAULT 'process'
    CHECK (content_type IN ('process','template','training','login','policy','faq','checklist','reference')),
  ADD COLUMN IF NOT EXISTS category      TEXT,
  ADD COLUMN IF NOT EXISTS visibility    TEXT NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('internal','dept_only','restricted')),
  ADD COLUMN IF NOT EXISTS summary       TEXT,
  ADD COLUMN IF NOT EXISTS read_minutes  INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS version       TEXT DEFAULT '1.0';

-- ─── CHECKLIST PROGRESS TABLE ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.checklist_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id    UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  checked_items TEXT[] DEFAULT '{}',
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own checklist progress"
  ON public.checklist_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users upsert own checklist progress"
  ON public.checklist_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users update own checklist progress"
  ON public.checklist_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER checklist_progress_updated_at
  BEFORE UPDATE ON public.checklist_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── NEW DEPARTMENTS ───────────────────────────────────────

INSERT INTO public.departments (slug, name_pt, name_en, name_es, icon, color)
VALUES
  ('finance',        'Financeiro',     'Finance',        'Finanzas',       '💰', '#FFC51C'),
  ('administrative', 'Administrativo', 'Administrative', 'Administrativo', '📋', '#5A4E72')
ON CONFLICT (slug) DO NOTHING;

-- ─── INDEXES ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_contents_content_type
  ON public.contents (content_type);

CREATE INDEX IF NOT EXISTS idx_contents_category
  ON public.contents (category);

CREATE INDEX IF NOT EXISTS idx_contents_dept_status
  ON public.contents (department_id, status);

CREATE INDEX IF NOT EXISTS idx_checklist_progress_user_content
  ON public.checklist_progress (user_id, content_id);
