'use client'

import {
  EDITOR_WIZARD_STEPS,
  wizardNext,
  wizardPrev,
  type EditorWizardStep,
} from './editor-wizard-steps'
import { color, font, ink } from '@/lib/ui/theme'

interface EditorWizardNavProps {
  step: EditorWizardStep
  onStepChange: (step: EditorWizardStep) => void
}

export function EditorWizardNav({ step, onStepChange }: EditorWizardNavProps) {
  const currentIndex = EDITOR_WIZARD_STEPS.findIndex((item) => item.id === step)
  const prev = wizardPrev(step)
  const next = wizardNext(step)
  const progress = ((currentIndex + 1) / EDITOR_WIZARD_STEPS.length) * 100

  return (
    <div className="sp-wizard-nav" role="navigation" aria-label="Etapas da proposta">
      <div className="sp-wizard-progress" aria-hidden>
        <div className="sp-wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="sp-wizard-steps">
        {EDITOR_WIZARD_STEPS.map((item, index) => {
          const active = item.id === step
          const done = index < currentIndex
          return (
            <button
              key={item.id}
              type="button"
              className={active ? 'sp-wizard-step active' : done ? 'sp-wizard-step done' : 'sp-wizard-step'}
              onClick={() => onStepChange(item.id)}
              aria-current={active ? 'step' : undefined}
            >
              <span className="sp-wizard-step-num">{index + 1}</span>
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="sp-wizard-footer">
        <button type="button" style={ghostBtn} disabled={!prev} onClick={() => prev && onStepChange(prev)}>
          Anterior
        </button>
        <span style={{ fontSize: 12, color: ink(0.5), fontFamily: font.mono }}>
          Etapa {currentIndex + 1} de {EDITOR_WIZARD_STEPS.length}
        </span>
        <button
          type="button"
          style={next ? primaryBtn : { ...ghostBtn, opacity: 0.5, cursor: 'default' }}
          disabled={!next}
          onClick={() => next && onStepChange(next)}
        >
          Próximo
        </button>
      </div>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 9,
  padding: '9px 14px',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
}

const primaryBtn: React.CSSProperties = {
  border: 0,
  borderRadius: 9,
  padding: '9px 16px',
  background: color.orange,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
}
