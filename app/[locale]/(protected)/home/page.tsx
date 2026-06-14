import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'
import { color, ink, font, t } from '@/lib/ui/theme'
import { createStudyPlan } from '../study-plans/actions'

interface Props {
  params: Promise<{ locale: string }>
}

const TZ = 'Australia/Perth'

function greeting(isEn: boolean) {
  const hour = Number(new Date().toLocaleString('en-US', { timeZone: TZ, hour: '2-digit', hour12: false }))
  if (hour < 12) return isEn ? 'Good morning' : 'Bom dia'
  if (hour < 18) return isEn ? 'Good afternoon' : 'Boa tarde'
  return isEn ? 'Good evening' : 'Boa noite'
}

async function counts() {
  const supabase = await createClient()
  const [plans, docs, users] = await Promise.all([
    // study_plans is missing from the generated types (other code casts too)
    (supabase as any).from('study_plans').select('id', { count: 'exact', head: true }),
    supabase.from('contents').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])
  return {
    plans: plans.count ?? null,
    docs: docs.count ?? null,
    users: users.count ?? null,
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const isEn = locale === 'en'

  const firstName = (profile.full_name ?? profile.email).split(' ')[0]
  const today = new Date()
    .toLocaleDateString(isEn ? 'en-AU' : 'pt-BR', { timeZone: TZ, weekday: 'long', day: '2-digit', month: 'long' })
    .toUpperCase()

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 28, paddingTop: 4 }}>
      {/* Masthead */}
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span className="movy-kicker">Movy Internal Hub</span>
          <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: t.textSubtle, letterSpacing: '0.04em' }}>{today} · PERTH</span>
        </div>
        <hr className="movy-rule" style={{ margin: '14px 0 24px' }} />
        <h1 className="movy-display" style={{ margin: 0, fontSize: 'clamp(42px, 6.6vw, 78px)', lineHeight: 0.92 }}>
          {greeting(isEn)}<span style={{ color: color.gold }}>.</span>
        </h1>
        <p style={{ margin: '16px 0 0', maxWidth: 540, color: t.textMuted, fontSize: 18, fontWeight: 500, lineHeight: 1.55 }}>
          {isEn ? <>Welcome back, <strong style={{ color: t.text, fontWeight: 700 }}>{firstName}</strong>.</>
            : <>Bem-vindo de volta, <strong style={{ color: t.text, fontWeight: 700 }}>{firstName}</strong>.</>}{' '}
          {isEn ? 'What would you like to do today?' : 'O que você quer fazer hoje?'}
        </p>
      </header>

      {/* Primary actions */}
      <section style={{ display: 'grid', gap: 16 }} className="grid-cols-1 lg:grid-cols-2">
        {/* Proposta — dark, dominant (intentionally dark in both themes) */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, background: color.purpleDeeper, color: '#fff', border: `1px solid ${color.purpleDeep}` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(100% 90% at 100% 100%, rgba(243,107,28,0.20), transparent 52%)' }} />
          <svg viewBox="0 0 120 120" width={260} height={260} aria-hidden style={{ position: 'absolute', right: -28, bottom: -42, color: '#fff', opacity: 0.1 }}>
            <use href="#movySymMono" />
          </svg>
          <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: color.gold }} />
          <div style={{ position: 'relative', padding: '28px 30px 30px', minHeight: 232, display: 'flex', flexDirection: 'column' }}>
            <span className="movy-kicker movy-kicker--gold">{isEn ? 'Proposals' : 'Propostas'}</span>
            <h2 className="movy-display" style={{ margin: '14px 0 8px', fontSize: 'clamp(26px, 3.2vw, 34px)', lineHeight: 0.98, color: '#fff', maxWidth: 320 }}>
              {isEn ? 'Create a proposal' : 'Criar uma proposta'}
            </h2>
            <p style={{ margin: '0 0 22px', maxWidth: 340, color: 'rgba(255,255,255,0.66)', fontSize: 14, lineHeight: 1.55 }}>
              {isEn ? 'Simulate ELICOS, VET and Higher Education — fees, materials and per-course costs.' : 'Simule ELICOS, VET e Higher Education — taxas, materiais e custos por curso.'}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <form action={createStudyPlan.bind(null, locale)}>
                <button className="movy-btn-primary" style={solidBtn(color.orange)}>
                  {isEn ? 'New proposal' : 'Nova proposta'}<span aria-hidden style={{ fontSize: 16 }}>→</span>
                </button>
              </form>
              <Link href={`/${locale}/study-plans`} prefetch={false} style={ghostBtn}>{isEn ? 'View all' : 'Ver todas'}</Link>
            </div>
          </div>
        </div>

        {/* Capacidade Financeira — surface card */}
        <Link href={`/${locale}/financial`} prefetch={false} className="movy-card movy-card--hover" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '28px 30px 30px', minHeight: 232, textDecoration: 'none' }}>
          <svg viewBox="0 0 120 120" width={210} height={210} aria-hidden style={{ position: 'absolute', right: -22, bottom: -34, color: color.purple, opacity: 0.08 }}>
            <use href="#movySymMono" />
          </svg>
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color.purple }} />
          <span className="movy-kicker">{isEn ? 'Financial' : 'Comprovação'}</span>
          <h2 className="movy-display" style={{ margin: '14px 0 8px', fontSize: 'clamp(26px, 3.2vw, 34px)', lineHeight: 0.98, color: t.text, maxWidth: 300 }}>
            {isEn ? 'Financial capacity' : 'Capacidade financeira'}
          </h2>
          <p style={{ margin: '0 0 22px', maxWidth: 320, color: t.textMuted, fontSize: 14, lineHeight: 1.55 }}>
            {isEn ? 'Visa proof-of-funds — living costs, travel, course and dependants, in AUD and BRL.' : 'Comprovação para o visto — custo de vida, passagem, curso e dependentes, em AUD e BRL.'}
          </p>
          <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, color: t.text, fontFamily: font.ui, fontWeight: 700, fontSize: 14 }}>
            {isEn ? 'Open calculator' : 'Abrir calculadora'}<span aria-hidden style={{ fontSize: 16, color: color.orange }}>→</span>
          </span>
        </Link>
      </section>

      {/* CRM — coming soon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 14, background: t.surfaceSunken, border: `1px solid ${t.border}`, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <span className="movy-kicker movy-kicker--muted">{isEn ? 'Coming soon · CRM' : 'Em breve · CRM'}</span>
          <div style={{ marginTop: 8, fontFamily: font.display, fontSize: 18, fontWeight: 600, color: t.text, letterSpacing: '-0.015em' }}>
            {isEn ? 'Student & lead management' : 'Gestão de leads e estudantes'}
          </div>
          <p style={{ margin: '4px 0 0', color: t.textMuted, fontSize: 13.5, lineHeight: 1.5, maxWidth: 560 }}>
            {isEn ? 'Pipeline, contacts and follow-ups — connected to proposals. In development.' : 'Pipeline, contatos e follow-ups — conectado às propostas. Em desenvolvimento.'}
          </p>
        </div>
        <span style={{ fontFamily: font.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color.orange, border: `1px solid ${t.border}`, background: t.surface, padding: '6px 12px', borderRadius: 999 }}>
          {isEn ? 'In progress' : 'Em breve'}
        </span>
      </div>

    </div>
  )
}



function solidBtn(bg: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 9, border: 0, borderRadius: 10,
    padding: '12px 20px', background: bg, color: '#fff', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', fontFamily: font.ui,
  }
}

const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', borderRadius: 10, padding: '12px 18px',
  background: 'transparent', color: 'rgba(255,255,255,0.82)', fontWeight: 600,
  textDecoration: 'none', fontSize: 14, fontFamily: font.ui,
  border: '1px solid rgba(255,255,255,0.18)',
}
