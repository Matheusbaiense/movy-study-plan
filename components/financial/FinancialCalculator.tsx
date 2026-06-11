'use client'

import { useMemo, useState } from 'react'
import {
  COST,
  computeFinancialCapacity,
  defaultTravelCost,
  formatAud,
  formatBrl,
  type FinancialInput,
  type StudentLocation,
} from '@/lib/financial/calculator'

const INK = '#2A1153'
const PURPLE = '#4B1A77'
const GOLD = '#FBB615'
const ORANGE = '#F36B1C'
const MUTED = '#5A4E72'
const HAIR = '#E0D6EE'

const todayIso = () => new Date().toISOString().slice(0, 10)

const initial: FinancialInput = {
  student: '',
  applicationDate: todayIso(),
  location: 'offshore',
  visaMonths: 12,
  adults: 1,
  dependents5to18: 0,
  dependentsUnder5: 0,
  exchangeRate: 3.35,
  travelCost: 2000,
  remainingCourseFee: 0,
}

export function FinancialCalculator() {
  const [data, setData] = useState<FinancialInput>(initial)
  const [customTravel, setCustomTravel] = useState(false)
  const calculatedTravel = useMemo(() => defaultTravelCost(data), [data])
  const effectiveData = useMemo(
    () => (customTravel ? data : { ...data, travelCost: calculatedTravel }),
    [calculatedTravel, customTravel, data],
  )
  const result = useMemo(() => computeFinancialCapacity(effectiveData), [effectiveData])

  function set<K extends keyof FinancialInput>(key: K, value: FinancialInput[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function setNumber<K extends keyof FinancialInput>(key: K, value: number) {
    set(key, value as FinancialInput[K])
  }

  const applicationDate = data.applicationDate || todayIso()

  return (
    <div className="fc-shell">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="fc-form">
        <div className="fc-no-print fc-head">
          <span className="movy-kicker">Comprovação · Visto de estudante</span>
          <h1 className="fc-title">Capacidade financeira</h1>
          <p className="fc-subtitle">Calculadora de proof of funds para o visto de estudante australiano, em AUD e BRL.</p>
        </div>

        <Section title="Dados do estudante">
          <div className="fc-grid">
            <Field label="Estudante">
              <input style={input} value={data.student} onChange={(event) => set('student', event.target.value)} />
            </Field>
            <Field label="Data estimada da aplicação">
              <input style={input} type="date" value={data.applicationDate} onChange={(event) => set('applicationDate', event.target.value)} />
            </Field>
            <Field label="Localização na aplicação">
              <select style={input} value={data.location} onChange={(event) => set('location', event.target.value as StudentLocation)}>
                <option value="offshore">Offshore</option>
                <option value="onshore">Onshore</option>
              </select>
            </Field>
            <Field label="Duração do visto (meses)">
              <NumberInput value={data.visaMonths} onChange={(value) => setNumber('visaMonths', value)} />
            </Field>
          </div>
        </Section>

        <Section title="Aplicantes e dependentes">
          <div className="fc-grid">
            <Field label="Aplicantes maiores de 18">
              <NumberInput value={data.adults} onChange={(value) => setNumber('adults', value)} />
            </Field>
            <Field label="Dependentes 5 a 18">
              <NumberInput value={data.dependents5to18} onChange={(value) => setNumber('dependents5to18', value)} />
            </Field>
            <Field label="Dependentes menores de 5">
              <NumberInput value={data.dependentsUnder5} onChange={(value) => setNumber('dependentsUnder5', value)} />
            </Field>
          </div>
        </Section>

        <Section title="Valores da simulação">
          <div className="fc-grid">
            <Field label="Cotação AUD para BRL">
              <NumberInput value={data.exchangeRate} step="0.01" onChange={(value) => setNumber('exchangeRate', value)} />
            </Field>
            <Field label="Curso remanescente (AUD)">
              <NumberInput value={data.remainingCourseFee} onChange={(value) => setNumber('remainingCourseFee', value)} />
            </Field>
            <Field label={customTravel ? 'Passagem personalizada (AUD)' : 'Passagem automática (AUD)'}>
              <div className="fc-inline">
                <NumberInput
                  value={customTravel ? data.travelCost : calculatedTravel}
                  disabled={!customTravel}
                  onChange={(value) => setNumber('travelCost', value)}
                />
                <button type="button" style={secondaryButton} onClick={() => setCustomTravel((value) => !value)}>
                  {customTravel ? 'Usar regra' : 'Editar'}
                </button>
              </div>
            </Field>
          </div>
          <p className="fc-help">
            Regra da planilha: passagem = {formatAud(COST.travelOnshorePerApplicant)} por pessoa onshore ou {formatAud(COST.travelOffshorePerApplicant)} por pessoa offshore.
          </p>
        </Section>

        <Section title="Constantes do Excel">
          <div className="fc-constants">
            <Mini label="Principal" value={formatAud(COST.primaryApplicant)} />
            <Mini label="Adulto adicional" value={formatAud(COST.additionalAdult)} />
            <Mini label="Dependente" value={formatAud(COST.dependent)} />
            <Mini label="Escola 5-18" value={formatAud(COST.schoolPerSchoolAge)} />
          </div>
        </Section>
      </div>

      <aside className="fc-result">
        <div className="fc-no-print fc-actions">
          <button type="button" onClick={() => window.print()} style={primaryButton}>Salvar PDF / Imprimir</button>
        </div>

        <article id="fc-doc" style={docCard}>
          <div className="fc-brand">
            <svg viewBox="0 0 120 120" width={34} height={34} aria-hidden><use href="#movySymColor" /></svg>
            <span>MOVY <b>EDUCATION</b></span>
          </div>
          <h2 className="fc-doc-title">Demonstração de Capacidade Financeira</h2>
          <p className="fc-doc-meta">
            {data.student || 'Estudante'} · {data.location === 'offshore' ? 'Offshore' : 'Onshore'} · {data.visaMonths} meses · {formatDateBr(applicationDate)}
          </p>
          <div className="fc-rule" />

          <table className="fc-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>AUD</th>
                <th>BRL</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Custo de vida" aud={result.costOfLiving} brl={result.costOfLivingBrl} />
              <Row label="Passagem" aud={result.travelCost} brl={result.travelBrl} />
              <Row label="Curso remanescente" aud={result.remainingCourseFee} brl={result.remainingCourseBrl} />
              <Row label="Escola dos dependentes" aud={result.dependentSchoolFee} brl={result.dependentSchoolBrl} />
            </tbody>
            <tfoot>
              <tr>
                <td>Total da capacidade financeira</td>
                <td>{formatAud(result.totalAud)}</td>
                <td>{formatBrl(result.totalBrl)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="fc-note">
            Cotação AUD para BRL: {data.exchangeRate}. Valores estimados; o valor em reais varia com o câmbio.
          </p>
        </article>
      </aside>
    </div>
  )
}

function Row({ label, aud, brl }: { label: string; aud: number; brl: number }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{formatAud(aud)}</td>
      <td>{formatBrl(brl)}</td>
    </tr>
  )
}

function formatDateBr(iso: string): string {
  const parts = iso.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fc-no-print fc-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="fc-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function NumberInput({ value, onChange, step = '1', disabled = false }: { value: number; onChange: (value: number) => void; step?: string; disabled?: boolean }) {
  return (
    <input
      style={{ ...input, textAlign: 'right', background: disabled ? '#F4F2F8' : '#fff' }}
      type="number"
      step={step}
      disabled={disabled}
      value={value}
      onChange={(event) => {
        const parsed = Number.parseFloat(event.target.value)
        onChange(Number.isFinite(parsed) ? parsed : 0)
      }}
    />
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${HAIR}`,
  borderRadius: 9,
  padding: '10px 11px',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  color: INK,
  outline: 'none',
}

const primaryButton: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '11px 18px',
  background: INK,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
}

const secondaryButton: React.CSSProperties = {
  border: `1px solid ${HAIR}`,
  borderRadius: 9,
  padding: '9px 12px',
  background: '#fff',
  color: INK,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
  whiteSpace: 'nowrap',
}

const docCard: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${HAIR}`,
  borderRadius: 14,
  padding: '24px 26px',
  boxShadow: '0 18px 46px -24px rgba(42,17,83,0.32)',
  fontFamily: 'Outfit, system-ui, sans-serif',
}

const styles = `
.fc-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 400px); gap: 22px; align-items: start; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box; }
.fc-form { display: grid; gap: 16px; min-width: 0; }
.fc-head { margin-bottom: 4px; }
.fc-title { margin: 8px 0 0; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: clamp(30px, 3.6vw, 42px); letter-spacing: -0.035em; line-height: 0.96; color: ${INK}; }
.fc-subtitle { margin: 10px 0 0; color: ${MUTED}; font-size: 14px; line-height: 1.5; max-width: 52ch; }
.fc-section { background: #fff; border: 1px solid ${HAIR}; border-radius: 12px; padding: 18px 20px; }
.fc-section h2 { margin: 0 0 16px; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${ORANGE}; }
.fc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
.fc-field { display: grid; gap: 6px; min-width: 0; }
.fc-field > span { font-size: 11px; font-weight: 700; color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.05em; }
.fc-inline { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.fc-help { margin: 12px 0 0; font-size: 11.5px; color: ${MUTED}; line-height: 1.5; }
.fc-constants { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.fc-constants div { display: grid; gap: 3px; padding: 11px 12px; border-radius: 10px; background: #F8F7FB; border: 1px solid ${HAIR}; }
.fc-constants span { color: ${MUTED}; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.fc-constants strong { color: ${INK}; font-family: 'Outfit', sans-serif; font-size: 15px; }
.fc-result { position: sticky; top: 20px; display: grid; gap: 14px; min-width: 0; }
.fc-actions { display: flex; justify-content: flex-end; }
.fc-brand { display: flex; align-items: center; gap: 11px; margin-bottom: 4px; font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; letter-spacing: -0.01em; color: ${INK}; }
.fc-brand b { color: ${GOLD}; }
.fc-doc-title { margin: 14px 0 3px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 21px; letter-spacing: -0.02em; color: ${INK}; }
.fc-doc-meta { margin: 0; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.02em; color: ${MUTED}; }
.fc-rule { height: 3px; background: linear-gradient(90deg, ${PURPLE}, ${ORANGE} 55%, ${GOLD}); border-radius: 3px; margin: 16px 0 16px; }
.fc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.fc-table th { text-align: right; padding: 8px 0; font-family: 'Space Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: ${MUTED}; border-bottom: 1px solid ${HAIR}; }
.fc-table th:first-child { text-align: left; }
.fc-table td { padding: 10px 0; color: rgba(28,18,51,0.82); text-align: right; border-bottom: 1px solid ${HAIR}; }
.fc-table td:first-child { text-align: left; }
.fc-table tbody td:nth-child(2) { font-weight: 700; color: ${INK}; }
.fc-table tfoot td { border-top: 2px solid ${INK}; border-bottom: 0; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 15px; color: ${INK}; padding-top: 12px; }
.fc-table tfoot td:nth-child(3) { color: ${PURPLE}; }
.fc-note { margin: 16px 0 0; font-size: 11px; color: ${MUTED}; line-height: 1.5; border-left: 3px solid ${GOLD}; padding-left: 11px; }
#fc-doc, #fc-doc * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
@media (max-width: 960px) {
  .fc-shell { grid-template-columns: 1fr; }
  .fc-result { position: static; }
  .fc-actions { justify-content: stretch; }
  .fc-actions button { width: 100%; }
}
@media (max-width: 520px) {
  .fc-shell { gap: 14px; }
  .fc-section { padding: 14px; border-radius: 12px; }
  #fc-doc { padding: 16px !important; border-radius: 12px !important; }
  .fc-inline { grid-template-columns: 1fr; }
  .fc-table { font-size: 11.5px; }
}
@media print {
  @page { size: A4; margin: 14mm; }
  body * { visibility: hidden !important; }
  #fc-doc, #fc-doc * { visibility: visible !important; }
  #fc-doc { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: 0 !important; box-shadow: none !important; }
  .fc-no-print { display: none !important; }
}
`
