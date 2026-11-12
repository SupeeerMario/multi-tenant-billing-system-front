import type { Invoice, Plan, Subscription, Tenant, UsageEvent } from './types'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown = null) {
    super(message)
    this.status = status
    this.body = body
  }
}

function readError(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    if ('detail' in body) return String(body.detail)
    return Object.entries(body)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
      .join(' · ')
  }
  return `Request failed (${status})`
}

type RequestOptions = { key?: string; method?: string; body?: unknown; headers?: Record<string, string> }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  if (options.key) headers.Authorization = `Api-Key ${options.key}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`/billing/${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the billing server. Check your connection.')
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, readError(body, res.status), body)
  return body as T
}

export const createTenant = (name: string) =>
  request<Tenant & { api_key: string }>('tenants/', { method: 'POST', body: { name } })

export const createPlan = (plan: { name: string; base_fee: string; unit_fee: string; currency: string }) =>
  request<Plan>('plans/', { method: 'POST', body: { ...plan, interval: 'MONTHLY' } })

export const getMe = (key: string) => request<Tenant>('tenants/me/', { key })

export async function getCurrentSubscription(key: string): Promise<Subscription | null> {
  try {
    return await request<Subscription>('subscriptions/current/', { key })
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export const createSubscription = (key: string, plan: number, current_period_start: string) =>
  request<unknown>('subscriptions/', { key, method: 'POST', body: { plan, current_period_start } })

export const getUsage = (key: string) => request<UsageEvent[]>('usage/', { key })

export const addUsage = (key: string, metric: string, quantity: number, occurred_at: string) =>
  request<UsageEvent>('usage/', { key, method: 'POST', body: { metric, quantity, occurred_at } })

export const getInvoices = (key: string, status?: 'open' | 'paid' | 'void') =>
  request<Invoice[]>(status ? `invoices/?status=${status}` : 'invoices/', { key })

export const generateInvoice = (key: string) => request<Invoice>('invoices/generate/', { key, method: 'POST' })

export const payInvoice = (key: string, invoiceId: number, amount: string, idempotencyKey: string) =>
  request<Invoice>(`invoices/${invoiceId}/pay/`, {
    key,
    method: 'POST',
    body: { amount },
    headers: { 'Idempotency-Key': idempotencyKey },
  })
