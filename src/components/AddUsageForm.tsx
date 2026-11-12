import { useState, type FormEvent } from 'react'
import { addUsage } from '../api'

type Props = { apiKey: string; metrics: string[]; onAdded: () => void }

export function AddUsageForm({ apiKey, metrics, onAdded }: Props) {
  const [metric, setMetric] = useState(metrics[0] ?? 'api_calls')
  const [quantity, setQuantity] = useState('100')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await addUsage(apiKey, metric.trim(), Number(quantity), new Date().toISOString())
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setBusy(false)
  }

  return (
    <form className="add-usage" onSubmit={submit} aria-label="Record usage">
      <input
        className="input mono"
        aria-label="Metric"
        list="metric-options"
        value={metric}
        onChange={(e) => setMetric(e.target.value)}
        required
        maxLength={32}
      />
      <datalist id="metric-options">
        {metrics.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
      <input
        className="input mono qty"
        aria-label="Quantity"
        type="number"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <button type="submit" className="btn" disabled={busy}>
        + Add
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
