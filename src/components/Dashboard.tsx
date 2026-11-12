import { useEffect } from 'react'
import { useBillingData, type BillingData } from '../useBillingData'
import { usePayment } from '../usePayment'
import { Header } from './Header'
import { UsageFeed } from './UsageFeed'
import { PeriodRing } from './PeriodRing'
import { InvoicePanel } from './InvoicePanel'
import { SetupWizard } from './SetupWizard'
import type { Subscription } from '../types'
import { billsTimeline } from '../bills'

const DAY_MS = 24 * 60 * 60 * 1000

type Props = { apiKey: string; onDisconnect: () => void }

export function Dashboard({ apiKey, onDisconnect }: Props) {
  const billing = useBillingData(apiKey)

  const unauthorized = billing.status === 'error' && billing.error.status === 401
  useEffect(() => {
    if (unauthorized) onDisconnect()
  }, [unauthorized, onDisconnect])

  if (billing.status === 'loading') {
    return <main className="screen mono muted">Loading…</main>
  }

  if (billing.status === 'error') {
    return (
      <main className="screen">
        <p className="error" role="alert">
          {billing.error.message}
        </p>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={billing.reload}>
            Retry
          </button>
          <button type="button" className="btn" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </main>
    )
  }

  const { data, reload } = billing
  if (!data.subscription) {
    return <SetupWizard apiKey={apiKey} tenantName={data.tenant.name} onDone={reload} />
  }

  return (
    <Overview
      key={data.openInvoice?.id ?? 'none'}
      apiKey={apiKey}
      data={data}
      subscription={data.subscription}
      reload={reload}
      onDisconnect={onDisconnect}
    />
  )
}

type OverviewProps = {
  apiKey: string
  data: BillingData
  subscription: Subscription
  reload: () => void
  onDisconnect: () => void
}

function Overview({ apiKey, data, subscription, reload, onDisconnect }: OverviewProps) {
  const { plan } = subscription
  const { usage, openInvoice } = data
  const payment = usePayment(apiKey, openInvoice)

  const now = data.loadedAt
  const start = new Date(subscription.current_period_start).getTime()
  const end = new Date(subscription.current_period_end).getTime()

  const days = Math.round((end - start) / DAY_MS)
  const ended = now >= end
  const day = ended ? days : Math.max(1, Math.floor((now - start) / DAY_MS) + 1)
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)))

  const inPeriod = usage.filter((e) => {
    const t = new Date(e.occurred_at).getTime()
    return t >= start && t < end
  })
  const units = inPeriod.reduce((sum, e) => sum + e.quantity, 0)
  const projected = Number(plan.base_fee) + units * Number(plan.unit_fee)
  const daily = new Array<number>(days).fill(0)
  for (const e of inPeriod) daily[Math.floor((new Date(e.occurred_at).getTime() - start) / DAY_MS)] += e.quantity

  const invoiceUnits = openInvoice
    ? usage.filter((e) => e.invoice === openInvoice.id).reduce((sum, e) => sum + e.quantity, 0)
    : 0

  const newestFirst = [...usage].reverse()
  const metrics = [...new Set(newestFirst.map((e) => e.metric))]

  const justPaid = payment.state === 'paid' || payment.state === 'replayed'
  const bills = billsTimeline(data.invoices, subscription, now).map((b) =>
    justPaid && b.invoice?.id === openInvoice?.id ? { ...b, status: 'PAID' as const } : b,
  )
  const unpaid = bills.filter((b) => b.status === 'UNPAID').length
  const notBilled = bills.filter((b) => b.status === 'NOT_BILLED').length
  const openDays = openInvoice ? Math.floor((now - new Date(openInvoice.created_at).getTime()) / DAY_MS) : 0

  const monthLabel = new Date(start).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })

  return (
    <>
      <Header
        tenant={data.tenant}
        subscription={subscription}
        apiKey={apiKey}
        onDisconnect={onDisconnect}
        unpaid={unpaid}
        notBilled={notBilled}
      />
      <main className="main">
        <UsageFeed
          events={newestFirst.slice(0, 6)}
          units={units}
          apiKey={apiKey}
          metrics={metrics}
          onAdded={reload}
          ended={ended}
        />
        <PeriodRing
          daily={daily}
          day={day}
          ended={ended}
          progress={progress}
          units={units}
          projected={projected}
          currency={plan.currency}
          monthLabel={monthLabel}
          secondMetric={metrics[1]}
          burst={payment.paidCount}
        />
        <InvoicePanel
          apiKey={apiKey}
          invoice={openInvoice}
          plan={plan}
          units={invoiceUnits}
          payment={payment}
          canGenerate={ended}
          bills={bills}
          openDays={openDays}
          onGenerated={reload}
        />
      </main>
    </>
  )
}
