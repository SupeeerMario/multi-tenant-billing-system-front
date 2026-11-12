import { money } from '../format'
import { CountUp } from './CountUp'

type Props = {
  daily: number[]
  day: number
  ended: boolean
  progress: number
  units: number
  projected: number
  currency: string
  monthLabel: string
  secondMetric?: string
  burst: number
}

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30)

const DOTS = Array.from({ length: 10 }, (_, i) => ({
  deg: (i * 137) % 360,
  duration: 2.4 + (i % 4) * 0.5,
  delay: i * 0.45,
}))

export function PeriodRing({ daily, day, progress, units, projected, currency, monthLabel, secondMetric, burst, ended }: Props) {
  const days = daily.length
  const busiest = Math.max(1, ...daily)
  const pct = (progress * 100).toFixed(2)

  return (
    <section className="ring" aria-label={ended ? 'Billing period ended' : `Billing period, day ${day} of ${days}`}>
      <div className="ring-dash" aria-hidden="true" />

      {DOTS.map((d, i) => (
        <div key={i} className="dot-lane" aria-hidden="true" style={{ transform: `rotate(${d.deg}deg)` }}>
          <div className="falling-dot" style={{ animationDuration: `${d.duration}s`, animationDelay: `${d.delay}s` }} />
        </div>
      ))}

      {daily.map((qty, i) => {
        const state = ended || i + 1 < day ? 'past' : i + 1 === day ? 'today' : 'future'
        const length = state === 'future' ? 1 : 1.5 + (qty / busiest) * 17
        return (
          <div
            key={i}
            className="tick"
            aria-hidden="true"
            style={{ height: `${length}cqw`, transform: `rotate(${(i * 360) / days}deg) translateY(-28.8cqw)` }}
          >
            <div className={`tick-bar tick-${state}`} style={{ animationDelay: `${i * 0.035}s` }} />
          </div>
        )
      })}

      <div
        className="ring-arc"
        aria-hidden="true"
        style={{ background: `conic-gradient(var(--lime) 0 ${pct}%, var(--track) ${pct}% 100%)` }}
      />

      {burst > 0 && (
        <div key={burst} aria-hidden="true">
          {RAYS.map((deg) => (
            <div key={deg} className="ray-lane" style={{ transform: `rotate(${deg}deg)` }}>
              <div className="ray" />
            </div>
          ))}
        </div>
      )}

      <div className="ring-center">
        <div className={ended ? 'label mono amber' : 'label mono'}>
          {ended ? 'PERIOD ENDED' : `DAY ${day} / ${days} · ${days - day} LEFT`}
        </div>
        <div className="projected">
          <CountUp value={projected} format={(n) => money(n, currency)} />
        </div>
        <div className="muted ring-sub">
          {ended ? 'awaiting invoice' : 'projected'} · {monthLabel}
        </div>
        <div className="muted ring-sub mono">
          <CountUp value={units} format={(n) => Math.round(n).toLocaleString('en-US')} /> units
        </div>
      </div>

      <div className="orbit orbit-satellite" aria-hidden="true">
        <div className="satellite">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <rect x="10" y="10" width="8" height="8" rx="1.5" />
            <rect x="1" y="11" width="7" height="6" />
            <rect x="20" y="11" width="7" height="6" />
            <path d="M14 10V5M12 4h4" />
          </svg>
        </div>
      </div>
      {secondMetric && (
        <div className="orbit orbit-metric" aria-hidden="true">
          <div className="metric-marker mono">
            <span className="metric-dot" />
            {secondMetric}
          </div>
        </div>
      )}
    </section>
  )
}
