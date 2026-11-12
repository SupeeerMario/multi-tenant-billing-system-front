import { useState, type FormEvent } from 'react'
import { createPlan, createSubscription } from '../api'

type Props = { apiKey: string; tenantName: string; onDone: () => void }

export function SetupWizard({ apiKey, tenantName, onDone }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ name: 'Starter', base_fee: '10.00', unit_fee: '0.001', currency: 'USD', start: today })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (e: { target: { name: string; value: string } }) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const plan = await createPlan({
        name: form.name,
        base_fee: form.base_fee,
        unit_fee: form.unit_fee,
        currency: form.currency.toUpperCase(),
      })
      await createSubscription(apiKey, plan.id, `${form.start}T00:00:00Z`)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  return (
    <main className="screen">
      <h1 className="screen-title">Set up billing for {tenantName}</h1>
      <p className="muted">No active subscription yet. Pick a plan; billing periods are one month from the start date.</p>

      <form className="card" onSubmit={submit}>
        <label className="field">
          <span className="label mono">PLAN NAME</span>
          <input className="input" name="name" value={form.name} onChange={set} required maxLength={32} />
        </label>
        <div className="row">
          <label className="field">
            <span className="label mono">BASE FEE / MONTH</span>
            <input className="input mono" name="base_fee" type="number" min="0" step="0.01" value={form.base_fee} onChange={set} required />
          </label>
          <label className="field">
            <span className="label mono">PRICE PER UNIT</span>
            <input className="input mono" name="unit_fee" type="number" min="0" step="any" value={form.unit_fee} onChange={set} required />
          </label>
        </div>
        <div className="row">
          <label className="field">
            <span className="label mono">CURRENCY</span>
            <input className="input mono" name="currency" value={form.currency} onChange={set} required pattern="[A-Za-z]{3}" title="3-letter code, e.g. USD" />
          </label>
          <label className="field">
            <span className="label mono">PERIOD START</span>
            <input className="input mono" name="start" type="date" value={form.start} onChange={set} required />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create plan & subscribe'}
        </button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
