export type Tenant = {
  id: number
  name: string
  is_active: boolean
}

export type Plan = {
  id: number
  name: string
  base_fee: string
  unit_fee: string
  currency: string
  interval: 'MONTHLY'
  is_active: boolean
}

export type Subscription = {
  id: number
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE'
  current_period_start: string
  current_period_end: string
  plan: Plan
}

export type UsageEvent = {
  id: number
  subscription: number
  metric: string
  quantity: number
  invoice: number | null
  occurred_at: string
}

export type Invoice = {
  id: number
  tenant: number
  amount: string
  status: 'OPEN' | 'PAID' | 'VOID'
  period_start: string
  period_end: string
  currency: string
  created_at: string
  paid_at: string | null
}
