import type { Invoice, Subscription } from './types'

export type BillMonth = {
  start: string
  status: 'PAID' | 'UNPAID' | 'NOT_BILLED' | 'CURRENT' | 'VOID'
  invoice: Invoice | null
}

export function addMonth(iso: string): string {
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const next = new Date(d)
  next.setUTCFullYear(y, m, Math.min(d.getUTCDate(), lastDay))
  return next.toISOString()
}

export function billsTimeline(invoices: Invoice[], subscription: Subscription, now: number): BillMonth[] {
  const billed: BillMonth[] = [...invoices]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map((inv) => ({
      start: inv.period_start,
      status: inv.status === 'OPEN' ? 'UNPAID' : inv.status,
      invoice: inv,
    }))

  const pending: BillMonth[] = []
  for (let start = subscription.current_period_start; pending.length < 24; start = addMonth(start)) {
    if (new Date(start).getTime() > now) break
    const ended = new Date(addMonth(start)).getTime() <= now
    pending.push({ start, status: ended ? 'NOT_BILLED' : 'CURRENT', invoice: null })
  }
  return [...billed, ...pending]
}
