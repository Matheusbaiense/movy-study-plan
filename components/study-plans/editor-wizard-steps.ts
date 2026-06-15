export type EditorWizardStep = 'cliente' | 'preferencias' | 'cursos' | 'custos' | 'revisao'

export const EDITOR_WIZARD_STEPS: { id: EditorWizardStep; label: string }[] = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'preferencias', label: 'Preferências' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'custos', label: 'Custos' },
  { id: 'revisao', label: 'Revisão' },
]

export function wizardStepIndex(step: EditorWizardStep): number {
  return EDITOR_WIZARD_STEPS.findIndex((item) => item.id === step)
}

export function wizardPrev(step: EditorWizardStep): EditorWizardStep | null {
  const idx = wizardStepIndex(step)
  return idx > 0 ? EDITOR_WIZARD_STEPS[idx - 1]!.id : null
}

export function wizardNext(step: EditorWizardStep): EditorWizardStep | null {
  const idx = wizardStepIndex(step)
  return idx < EDITOR_WIZARD_STEPS.length - 1 ? EDITOR_WIZARD_STEPS[idx + 1]!.id : null
}
