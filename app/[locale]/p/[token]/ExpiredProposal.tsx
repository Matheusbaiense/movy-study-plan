'use client'

import { Clock } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Branded "proposal expired" state for the public share route (C-H2).
 * Replaces a bare notFound() with a trustworthy, on-brand dead-end.
 * Client component so the lucide icon reference never crosses the RSC boundary.
 */
export function ExpiredProposal() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <EmptyState
          icon={Clock}
          title="Proposta expirada"
          description="Este link não está mais ativo. Entre em contato com seu consultor para receber uma proposta atualizada."
        />
      </div>
    </main>
  )
}
