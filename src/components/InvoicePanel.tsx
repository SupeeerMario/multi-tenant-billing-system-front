import { useState } from 'react'
import type { Invoice, Plan } from '../types'
import type { PayState, usePayment } from '../usePayment'
import { generateInvoice } from '../api'
import { money, shortDate } from '../format'
import { PayButton } from './PayButton'
import { CountUp } from './CountUp'
import { Mascot } from './Mascot'
import { BillsStrip } from './BillsStrip'
import type { BillMonth } from '../bills'

type Props = {
  apiKey: string
  invoice: Invoice | null
  plan: Plan
  units: number
  payment: ReturnType<typeof usePayment>
  canGenerate: boolean
  onGenerated: () => void
  bills: BillMonth[]
  openDays: number
}

const STATUS: Record<PayState, { color: string; text: (key: string) => string }> = {
  idle: { color: 'var(--muted)', text: (key) => `Idempotency-Key ready: ${key}` },
  processing: { color: 'var(--amber)', text: () => 'Key claimed. Gateway call in flight.' },
  paid: { color: 'var(--lime)', text: () => 'Charged once. Ledger pair written.' },
  replayed: { color: 'var(--text)', text: () => 'Sending the same key again…' },
  declined: { color: 'var(--danger)', text: () => 'Declined.' },
  error: { color: 'var(--danger)', text: () => 'Payment failed.' },
}

export function InvoicePanel({ apiKey, invoice, plan, units, payment, canGenerate, onGenerated, bills, openDays }: Props) {
  const generate = canGenerate && (!invoice || payment.state === 'paid') && (
    <GenerateButton apiKey={apiKey} onGenerated={onGenerated} />
  )

  if (!invoice) {
    return (
      <section className="column invoice" aria-label="Invoices">
        <BillsStrip bills={bills} />
        <div className="label mono">
          <span>NO OPEN INVOICE</span>
        </div>
        <div className="invoice-total muted">{money(0, plan.currency)}</div>
        <div className="mascot-row">
          <Mascot color="var(--lime)" busy={false} />
          <div className="mascot-text mono lime">
            {canGenerate ? 'Period over. Ready to bill it.' : 'All paid up. Next invoice when this period ends.'}
          </div>
        </div>
        {generate}
      </section>
    )
  }

  const opts = { timeZone: 'UTC' } as const
  const start = new Date(invoice.period_start)
  const lastDay = new Date(new Date(invoice.period_end).getTime() - 24 * 60 * 60 * 1000)
  const monthName = start.toLocaleDateString('en-US', { ...opts, month: 'long' })
  const monthYear = start.toLocaleDateString('en-US', { ...opts, month: 'long', year: 'numeric' })
  const range = `${shortDate(invoice.period_start)} – ${shortDate(lastDay.toISOString())}`
  const issued = shortDate(invoice.created_at)
  const amount = Number(invoice.amount)
  const status = STATUS[payment.state]
  const key = payment.idempotencyKey
  const shortKey = key.slice(0, key.lastIndexOf('_') + 9)

  return (
    <section className="column invoice" aria-label="Open invoice">
      <BillsStrip bills={bills} />
      <div className="label mono">
        <span>INVOICE #{String(invoice.id).padStart(4, '0')}</span>
        <span className={payment.paidInvoice ? undefined : 'amber'}>
          {payment.paidInvoice ? payment.paidInvoice.status : `UNPAID · ${openDays === 0 ? 'OPEN TODAY' : `OPEN ${openDays}D`}`}
        </span>
      </div>
      <div className="invoice-for">
        <span className="muted">Bill for</span> {monthYear}
      </div>
      <div className="invoice-period mono muted">
        Usage {range} · issued {issued}
      </div>
      <div className="invoice-total">
        <CountUp value={amount} format={(n) => money(n, invoice.currency)} />
      </div>
      <div className="breakdown mono muted">
        {plan.base_fee} base
        <br />
        {units.toLocaleString('en-US')} × {Number(plan.unit_fee)} usage
      </div>
      <PayButton
        state={payment.state}
        amountLabel={`${monthName.toUpperCase()} · ${money(amount, invoice.currency)}`}
        ariaLabel={`Pay invoice ${invoice.id} for ${monthYear}, ${money(amount, invoice.currency)}`}
        onPay={payment.pay}
      />
      <div className="mascot-row">
        <Mascot color={status.color} busy={payment.state === 'processing' || payment.state === 'replayed'} />
        <div className="mascot-text mono" role="status" style={{ color: status.color }}>
          {payment.message ?? status.text(shortKey)}
        </div>
      </div>
      {generate}
    </section>
  )
}

function GenerateButton({ apiKey, onGenerated }: { apiKey: string; onGenerated: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setBusy(true)
    setError(null)
    try {
      await generateInvoice(apiKey)
      onGenerated()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="btn" onClick={run} disabled={busy}>
        {busy ? 'Generating…' : 'Generate next invoice'}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
