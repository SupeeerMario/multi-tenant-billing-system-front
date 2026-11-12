import { useEffect, useRef, useState } from 'react'
import { ApiError, payInvoice } from './api'
import type { Invoice } from './types'

export type PayState = 'idle' | 'processing' | 'paid' | 'replayed' | 'declined' | 'error'

const newKey = (invoiceId: number) => `pay_${invoiceId}_${crypto.randomUUID()}`
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MAX_TRIES = 4

export function usePayment(apiKey: string, invoice: Invoice | null) {
  const [state, setState] = useState<PayState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [paidInvoice, setPaidInvoice] = useState<Invoice | null>(null)
  const [paidCount, setPaidCount] = useState(0)

  const [idempotencyKey, setIdempotencyKey] = useState(() => newKey(invoice?.id ?? 0))

  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function send(): Promise<Invoice> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await payInvoice(apiKey, invoice!.id, invoice!.amount, idempotencyKey)
      } catch (e) {
        const retryable =
          e instanceof ApiError && (e.status === 0 || (e.status === 409 && /processing/i.test(e.message)))
        if (!retryable || attempt >= MAX_TRIES) throw e
        if (alive.current) setMessage(`Still in flight, retrying with the same key (${attempt}/${MAX_TRIES - 1})…`)
        await wait(800 * attempt)
      }
    }
  }

  async function pay() {
    if (!invoice || state === 'processing' || state === 'replayed') return

    if (state === 'paid') {
      setState('replayed')
      try {
        const again = await send()
        if (!alive.current) return
        setMessage(
          again.paid_at === paidInvoice?.paid_at
            ? 'Same key, same answer. No second charge.'
            : 'Unexpected: server answered with a different payment.',
        )
      } catch (e) {
        if (alive.current) setMessage(e instanceof Error ? e.message : String(e))
      }
      await wait(2200)
      if (alive.current) setState('paid')
      return
    }

    setState('processing')
    setMessage(null)
    try {
      const result = await send()
      if (!alive.current) return
      setPaidInvoice(result)
      setPaidCount((n) => n + 1)
      setState('paid')
    } catch (e) {
      if (!alive.current) return
      const err = e instanceof ApiError ? e : new ApiError(0, String(e))
      if (err.status === 402) {
        const code = (err.body as { code?: string } | null)?.code
        setMessage(`Declined by the payment gateway${code ? `: ${code.replace(/_/g, ' ')}` : ''}.`)
        setState('declined')
        setIdempotencyKey(newKey(invoice.id))
      } else if (err.status === 409 && /already paid/i.test(err.message)) {
        setPaidInvoice({ ...invoice, status: 'PAID' })
        setState('paid')
      } else {
        setMessage(err.message)
        setState('error')
        if (err.status === 422) setIdempotencyKey(newKey(invoice.id))
      }
    }
  }

  return { state, pay, paidCount, idempotencyKey, message, paidInvoice }
}
