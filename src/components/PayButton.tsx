import { AnimatePresence, motion } from 'motion/react'
import type { PayState } from '../usePayment'

type Props = { state: PayState; amountLabel: string; ariaLabel: string; onPay: () => void }

const LABELS: Record<PayState, (amount: string) => string> = {
  idle: (amount) => `PAY ${amount}`,
  processing: () => 'PROCESSING…',
  paid: () => 'PAID ✓ · TAP AGAIN',
  replayed: () => 'REPLAYED',
  declined: () => 'DECLINED · TRY AGAIN',
  error: (amount) => `RETRY ${amount}`,
}

export function PayButton({ state, amountLabel, ariaLabel, onPay }: Props) {
  return (
    <button
      type="button"
      className="pay-button"
      data-state={state}
      aria-busy={state === 'processing'}
      aria-label={state === 'idle' ? ariaLabel : undefined}
      onClick={onPay}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          className="pay-label"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {LABELS[state](amountLabel)}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
