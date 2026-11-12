import { AnimatePresence, motion } from 'motion/react'
import type { UsageEvent } from '../types'
import { shortDate, time } from '../format'
import { CountUp } from './CountUp'
import { AddUsageForm } from './AddUsageForm'

type Props = {
  events: UsageEvent[]
  units: number
  apiKey: string
  metrics: string[]
  onAdded: () => void
  ended: boolean
}

export function UsageFeed({ events, units, apiKey, metrics, onAdded, ended }: Props) {
  return (
    <section className="column" aria-label="Usage feed">
      <div className="label mono">
        <span>INCOMING USAGE</span>
        <span>
          <CountUp value={units} format={(n) => Math.round(n).toLocaleString('en-US')} /> units
        </span>
      </div>
      <AddUsageForm apiKey={apiKey} metrics={metrics} onAdded={onAdded} />
      {ended && <p className="hint mono">Period ended: new usage counts toward the next period.</p>}
      {events.length === 0 && <p className="hint mono">No usage yet. Add some above.</p>}
      <ul className="feed">
        <AnimatePresence initial={true}>
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              layout
              className={i === 0 ? 'feed-row mono newest' : 'feed-row mono'}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.08 }}
            >
              <span className="muted">
                {shortDate(e.occurred_at)} {time(e.occurred_at)}
              </span>
              <span>{e.metric}</span>
              <span className="lime">+{e.quantity}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
