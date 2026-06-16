'use client'

import { Printer } from 'lucide-react'
import type { InvoicePrintData } from '@/lib/hr/types'
import { formatAUD, formatDateAU, computeTotalCents } from '@/lib/hr/calculations'

const printStyles = `
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  .tax-invoice-paper {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 32px !important;
  }
}
`

interface TaxInvoiceProps {
  data: InvoicePrintData
  locale?: string
}

export function TaxInvoice({ data, locale = 'en' }: TaxInvoiceProps) {
  const { invoice, employee, lines, org } = data
  const total = computeTotalCents(lines.map((l) => l.amount_cents))

  return (
    <>
      <style>{printStyles}</style>

      {/* Print button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, gap: 12 }}>
        <button
          onClick={() => window.print()}
          aria-label={locale === 'pt' ? 'Imprimir / Salvar PDF' : 'Print / Save as PDF'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#4B1A77', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Printer size={16} aria-hidden="true" />
          {locale === 'pt' ? 'Imprimir / Salvar PDF' : 'Print / Save as PDF'}
        </button>
      </div>

      {/* Invoice paper */}
      <div className="tax-invoice-paper" style={{
        background: '#fff', color: '#111',
        maxWidth: 800, margin: '0 auto',
        padding: 48, borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        fontFamily: 'Arial, sans-serif',
        fontSize: 13, lineHeight: 1.5,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#4B1A77', letterSpacing: '-0.02em' }}>
              {org.name}
            </div>
            {org.abn && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>ABN: {org.abn}</div>
            )}
            {org.address && (
              <div style={{ fontSize: 12, color: '#555' }}>{org.address}</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '0.04em' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              <strong>Invoice #:</strong> {invoice.invoice_number}
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              <strong>Date:</strong> {invoice.issued_at
                ? formatDateAU(invoice.issued_at.slice(0, 10))
                : formatDateAU(new Date().toISOString().slice(0, 10))}
            </div>
          </div>
        </div>

        {/* TO / FROM */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>TO</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{org.name}</div>
            {org.abn && <div style={{ fontSize: 12, color: '#555' }}>ABN: {org.abn}</div>}
            {org.address && <div style={{ fontSize: 12, color: '#555' }}>{org.address}</div>}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>FROM</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{employee.full_name}</div>
            {employee.abn && <div style={{ fontSize: 12, color: '#555' }}>ABN: {employee.abn}</div>}
            <div style={{ fontSize: 12, color: '#555' }}>{employee.email}</div>
          </div>
        </div>

        {/* Services table */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>SERVICES</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Hours</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, fontWeight: 700 }}>Payment AU$</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 4px', fontSize: 12, whiteSpace: 'nowrap' }}>{line.date}</td>
                  <td style={{ padding: '8px 4px', fontSize: 12 }}>
                    {line.description}
                    {line.multiplier !== 1.0 && (
                      <span style={{ fontSize: 10, color: '#888', marginLeft: 6 }}>
                        ({line.multiplier}x penalty)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {line.hours.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatAUD(line.rate_cents)}/hr
                  </td>
                  <td style={{ padding: '8px 4px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatAUD(line.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ borderTop: '2px solid #111', paddingTop: 12, minWidth: 220, textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
              TOTAL DUE: {formatAUD(total)}
            </div>
          </div>
        </div>

        {/* GST note */}
        <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 24, textAlign: 'right' }}>
          *No GST has been charged. GST free supply.
        </div>

        {/* Bank details */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 10 }}>
            PAY INTO ACCOUNT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 24px', fontSize: 13 }}>
            <span style={{ color: '#555', fontWeight: 600 }}>Bank:</span>
            <span>{employee.bank_name ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>BSB:</span>
            <span>{employee.bsb ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>Account:</span>
            <span>{employee.account_number ?? '—'}</span>
            <span style={{ color: '#555', fontWeight: 600 }}>Name:</span>
            <span>{employee.account_name ?? '—'}</span>
          </div>
        </div>
      </div>
    </>
  )
}
