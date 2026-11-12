import { useCallback, useEffect, useState } from 'react'
import { ApiError, getCurrentSubscription, getInvoices, getMe, getUsage } from './api'
import type { Invoice, Subscription, Tenant, UsageEvent } from './types'

export type BillingData = {
  tenant: Tenant
  subscription: Subscription | null
  usage: UsageEvent[]
  invoices: Invoice[]
  openInvoice: Invoice | null
  loadedAt: number
}

type Result =
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'ready'; data: BillingData }

export function useBillingData(key: string) {
  const [result, setResult] = useState<Result>({ status: 'loading' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let stale = false
    Promise.all([getMe(key), getCurrentSubscription(key), getUsage(key), getInvoices(key)])
      .then(([tenant, subscription, usage, invoices]) => {
        if (!stale) setResult({ status: 'ready', data: { tenant, subscription, usage, invoices, openInvoice: invoices.find((i) => i.status === 'OPEN') ?? null, loadedAt: Date.now() } })
      })
      .catch((e) => {
        if (!stale) setResult({ status: 'error', error: e instanceof ApiError ? e : new ApiError(0, String(e)) })
      })
    return () => {
      stale = true
    }
  }, [key, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...result, reload }
}
