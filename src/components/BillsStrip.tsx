import type { BillMonth } from '../bills'
import { money } from '../format'

const WORDS: Record<BillMonth['status'], string> = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  NOT_BILLED: 'not billed yet',
  CURRENT: 'running now',
  VOID: 'void',
}

export function BillsStrip({ bills }: { bills: BillMonth[] }) {
  const shown = bills.slice(-8)
  return (
    <div className="bills">
      <div className="label mono">
        <span>BILLS</span>
        <span>{shown.length < bills.length ? `LAST ${shown.length} MONTHS` : ''}</span>
      </div>
      <ol className="bills-strip">
        {shown.map((b) => {
          const month = new Date(b.start).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
          const long = new Date(b.start).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
          const amount = b.invoice ? `, ${money(Number(b.invoice.amount), b.invoice.currency)}` : ''
          const text = `${long}: ${WORDS[b.status]}${amount}`
          return (
            <li key={b.start} className="bill" data-status={b.status} title={text} aria-label={text}>
              <span className="bill-dot" />
              <span className="bill-month mono">{month}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
