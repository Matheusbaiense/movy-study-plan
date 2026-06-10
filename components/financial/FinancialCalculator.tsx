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
const MUTED = 'rgba(28,18,51,0.58)'
const HAIR = 'rgba(28,18,51,0.10)'

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
        <div className="fc-no-print">
          <h1 className="fc-title">Capacidade Financeira</h1>
          <p className="fc-subtitle">Calculadora de proof of funds para visto de estudante australiano.</p>
        </div>

        <Section title="Dados do estudante">
          <div className="fc-grid">
            <Field label="Estudante">
              <input style={input} value={data.student} onChange={(event) => set('student', event.target.value)} />
            </Field>
            <Field label="Data estimada da aplicacao">
              <input style={input} type="date" value={data.applicationDate} onChange={(event) => set('applicationDate', event.target.value)} />
            </Field>
            <Field label="Localizacao na aplicacao">
              <select style={input} value={data.location} onChange={(event) => set('location', event.target.value as StudentLocation)}>
                <option value="offshore">Offshore</option>
                <option value="onshore">Onshore</option>
              </select>
            </Field>
            <Field label="Duracao do visto (meses)">
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

        <Section title="Valores da simulacao">
          <div className="fc-grid">
            <Field label="Cotacao AUD para BRL">
              <NumberInput value={data.exchangeRate} step="0.01" onChange={(value) => setNumber('exchangeRate', value)} />
            </Field>
            <Field label="Curso remanescente (AUD)">
              <NumberInput value={data.remainingCourseFee} onChange={(value) => setNumber('remainingCourseFee', value)} />
            </Field>
            <Field label={customTravel ? 'Passagem personalizada (AUD)' : 'Passagem automatica (AUD)'}>
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
            <span style={logoMark}>M</span>
            <span>Movy <b>Education</b></span>
          </div>
          <h2 className="fc-doc-title">Demonstracao de Capacidade Financeira</h2>
          <p className="fc-doc-meta">
            {data.student || 'Estudante'} | {data.location === 'offshore' ? 'Offshore' : 'Onshore'} | {data.visaMonths} meses | {formatDateBr(applicationDate)}
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
                <td>Total capacidade financeira</td>
                <td>{formatAud(result.totalAud)}</td>
                <td>{formatBrl(result.totalBrl)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="fc-note">
            Cotacao AUD para BRL: {data.exchangeRate}. Valores estimados; o valor em reais varia com o cambio.
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
  padding: '9px 10px',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  color: INK,
}

const primaryButton: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '11px 16px',
  background: INK,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
}

const secondaryButton: React.CSSProperties = {
  border: `1px solid ${HAIR}`,
  borderRadius: 9,
  padding: '9px 11px',
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
  borderRadius: 16,
  padding: '22px 24px',
  boxShadow: '0 12px 40px rgba(28,18,51,0.08)',
  fontFamily: 'Outfit, system-ui, sans-serif',
}

const logoMark: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: INK,
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 800,
  fontSize: 16,
}

const styles = `
.fc-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 390px); gap: 20px; align-items: start; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box; }
.fc-form { display: grid; gap: 18px; min-width: 0; }
.fc-title { margin: 0; font-size: 28px; letter-spacing: 0; color: ${INK}; }
.fc-subtitle { margin: 6px 0 0; color: ${MUTED}; font-size: 13px; }
.fc-section { background: #fff; border: 1px solid ${HAIR}; border-radius: 16px; padding: 18px; }
.fc-section h2 { margin: 0 0 14px; font-size: 15px; letter-spacing: 0; color: ${INK}; }
.fc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
.fc-field { display: grid; gap: 6px; min-width: 0; }
.fc-field > span { font-size: 11px; font-weight: 700; color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.06em; }
.fc-inline { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.fc-help { margin: 10px 0 0; font-size: 11px; color: ${MUTED}; line-height: 1.45; }
.fc-constants { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.fc-constants div { display: grid; gap: 3px; padding: 10px; border-radius: 10px; background: #F8F7FB; }
.fc-constants span { color: ${MUTED}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.fc-constants strong { color: ${INK}; font-size: 13px; }
.fc-result { position: sticky; top: 20px; display: grid; gap: 14px; min-width: 0; }
.fc-actions { display: flex; justify-content: flex-end; }
.fc-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; font-size: 18px; font-weight: 800; letter-spacing: 0; color: ${INK}; }
.fc-brand b { color: ${GOLD}; }
.fc-doc-title { margin: 12px 0 2px; font-size: 20px; letter-spacing: 0; color: ${INK}; }
.fc-doc-meta { margin: 0; font-size: 12px; color: ${MUTED}; }
.fc-rule { height: 3px; background: linear-gradient(90deg, ${INK}, ${PURPLE} 55%, ${GOLD}); border-radius: 3px; margin: 14px 0 16px; }
.fc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.fc-table th { text-align: right; padding: 8px 0; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: ${MUTED}; border-bottom: 1px solid ${HAIR}; }
.fc-table th:first-child { text-align: left; }
.fc-table td { padding: 9px 0; color: rgba(28,18,51,0.82); text-align: right; border-bottom: 1px solid ${HAIR}; }
.fc-table td:first-child { text-align: left; }
.fc-table tbody td:nth-child(2) { font-weight: 700; color: ${INK}; }
.fc-table tfoot td { border-top: 2px solid ${INK}; border-bottom: 0; font-weight: 800; color: ${INK}; }
.fc-note { margin: 16px 0 0; font-size: 10.5px; color: ${MUTED}; line-height: 1.5; border-left: 3px solid ${GOLD}; padding-left: 10px; }
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
