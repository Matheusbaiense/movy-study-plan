-- Feature 2: Course Presets Manager.
-- DB-backed presets so prices/schools can be edited in Settings without code.
-- DRAFTED but NOT YET APPLIED — apply via Supabase MCP `apply_migration` or the
-- dashboard SQL editor, then build the Settings UI (see docs/AI-HANDOVER.md).
-- Idempotent and safe to run on the live project.

create table if not exists public.course_presets (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('elicos', 'vet', 'he')),
  provider text not null,
  name text not null,
  rate_per_week numeric not null default 0,
  tuition numeric not null default 0,
  enrolment_fee numeric not null default 0,
  material_fee numeric not null default 0,
  has_material boolean not null default false,
  scholarship numeric not null default 0,
  timetable text not null default '',
  payment_parts int not null default 4,
  payment_frequency text not null default '',
  deposit_weeks int not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_presets_type_idx on public.course_presets(type, sort_order);

drop trigger if exists course_presets_updated_at on public.course_presets;
create trigger course_presets_updated_at
  before update on public.course_presets
  for each row execute function public.set_updated_at();

alter table public.course_presets enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_presets' and policyname = 'active users read presets') then
    create policy "active users read presets" on public.course_presets
      for select using (public.is_active_user());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_presets' and policyname = 'admins manage presets') then
    create policy "admins manage presets" on public.course_presets
      for all using (public.current_user_role() in ('admin', 'super_admin'))
      with check (public.current_user_role() in ('admin', 'super_admin'));
  end if;
end $$;

-- Seed from lib/study-plans/defaults.ts COURSE_PRESETS (only if table is empty).
insert into public.course_presets (type, provider, name, rate_per_week, tuition, enrolment_fee, material_fee, has_material, payment_parts, payment_frequency, deposit_weeks, timetable, sort_order)
select * from (values
  ('elicos','Language Links','General English',260,0,250,250,false,4,'A cada 6 semanas',3,'Morning / Evening',1),
  ('elicos','Language Links','English for IELTS and Academic Purposes (EIAP)',260,0,250,250,false,4,'A cada 6 semanas',3,'Evening / 3 days option',2),
  ('elicos','ILSC','General English / Academic English',290,0,250,240,false,4,'A cada 5-6 semanas',4,'Morning / Evening',3),
  ('elicos','Milner','General English',260,0,250,250,false,4,'A cada 6 semanas',3,'Morning / Evening',4),
  ('vet','Greystone College','Diploma of Project Management',0,6400,250,0,false,5,'Mensal',0,'',5),
  ('vet','Greenwich College','Diploma + Advanced Diploma pathway',0,12000,250,0,false,8,'Mensal',0,'',6),
  ('vet','Stanley College','Diploma of Community Services',0,12000,250,500,true,4,'Por termo',0,'',7),
  ('vet','NIT Australia','Advanced Diploma of Civil Construction Design',0,0,250,0,false,8,'Mensal',0,'',8),
  ('he','ECU','Master program',0,0,0,0,false,4,'Por semestre',0,'',9),
  ('he','Curtin University','Master program',0,0,0,0,false,4,'Por semestre',0,'',10),
  ('he','Murdoch University','Master program',0,0,0,0,false,4,'Por semestre',0,'',11),
  ('he','Kaplan Business School','Master of Business Analytics',0,0,0,0,false,4,'Por semestre',0,'',12)
) as seed(type, provider, name, rate_per_week, tuition, enrolment_fee, material_fee, has_material, payment_parts, payment_frequency, deposit_weeks, timetable, sort_order)
where not exists (select 1 from public.course_presets);
