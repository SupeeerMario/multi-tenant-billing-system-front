import assert from 'node:assert/strict'
import { addMonth, billsTimeline } from './bills.ts'
import type { Invoice, Subscription } from './types.ts'

assert.equal(addMonth('2026-01-31T00:00:00.000Z'), '2026-02-28T00:00:00.000Z')
assert.equal(addMonth('2026-12-01T00:00:00.000Z'), '2027-01-01T00:00:00.000Z')

const sub = { current_period_start: '2026-08-01T00:00:00Z' } as Subscription
const paid = { period_start: '2026-07-01T00:00:00Z', status: 'PAID' } as Invoice
const now = Date.parse('2026-11-12T00:00:00Z')
assert.deepEqual(
  billsTimeline([paid], sub, now).map((m) => m.status),
  ['PAID', 'NOT_BILLED', 'NOT_BILLED', 'NOT_BILLED', 'CURRENT'],
)
assert.deepEqual(
  billsTimeline([], { current_period_start: '2026-10-12T00:00:00Z' } as Subscription, now).map((m) => m.status),
  ['NOT_BILLED', 'CURRENT'],
)
console.log('bills.ts ok')
