import type { Subscription, Tenant } from '../types'
import { shortDate } from '../format'

type Props = {
  tenant: Tenant
  subscription: Subscription
  apiKey: string
  onDisconnect: () => void
  unpaid: number
  notBilled: number
}

export function Header({ tenant, subscription, apiKey, onDisconnect, unpaid, notBilled }: Props) {
  const owed = [unpaid && `${unpaid} UNPAID`, notBilled && `${notBilled} NOT BILLED`].filter(Boolean).join(' · ')

  return (
    <header className="header mono">
      <div className="brand">
        {tenant.name}
        <span className="lime">//</span>BILLING
      </div>
      <div className="muted">
        {subscription.plan.name.toUpperCase()} · PERIOD {shortDate(subscription.current_period_start).toUpperCase()} –{' '}
        {shortDate(subscription.current_period_end).toUpperCase()}
      </div>
      <div className="header-right">
        <div className="status-pill" data-owed={notBilled ? 'missed' : unpaid ? 'unpaid' : undefined}>
          <span className="dot" />
          {owed || subscription.status}
        </div>
        <button type="button" className="link-button" onClick={onDisconnect} title="Forget this API key on this browser">
          KEY ••••{apiKey.slice(-4)} · DISCONNECT
        </button>
      </div>
    </header>
  )
}
