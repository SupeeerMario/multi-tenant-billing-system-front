import { useState, type FormEvent } from 'react'
import { createTenant, getMe } from '../api'

type Props = { onConnect: (key: string) => void }

export function ConnectScreen({ onConnect }: Props) {
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function connect(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await getMe(key.trim())
      onConnect(key.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  async function create(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const tenant = await createTenant(name.trim())
      setNewKey(tenant.api_key)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setBusy(false)
  }

  async function copy() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
  }

  if (newKey) {
    return (
      <main className="screen">
        <h1 className="screen-title">Tenant created</h1>
        <p className="muted">
          This is your API key. The server shows it <strong>only once</strong>: copy it somewhere safe before you
          continue.
        </p>
        <div className="key-box mono">{newKey}</div>
        <div className="row">
          <button type="button" className="btn" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy key'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onConnect(newKey)}>
            Continue
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <div className="brand">
        ORBIT<span className="lime">//</span>BILLING
      </div>

      <form className="card" onSubmit={connect}>
        <h2 className="card-title">Use an existing API key</h2>
        <label className="field">
          <span className="label mono">API KEY</span>
          <input
            className="input mono"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy || !key.trim()}>
          Connect
        </button>
      </form>

      <div className="divider mono muted">OR</div>

      <form className="card" onSubmit={create}>
        <h2 className="card-title">Create a new tenant</h2>
        <label className="field">
          <span className="label mono">TENANT NAME</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={32} />
        </label>
        <button type="submit" className="btn" disabled={busy || !name.trim()}>
          Create tenant
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
