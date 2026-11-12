import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import { ConnectScreen } from './components/ConnectScreen'
import { Dashboard } from './components/Dashboard'

const STORAGE_KEY = 'billing.apiKey'

function readKey() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function App() {
  const [apiKey, setApiKey] = useState(readKey)

  function connect(key: string) {
    try {
      localStorage.setItem(STORAGE_KEY, key)
    } catch {
    }
    setApiKey(key)
  }

  function disconnect() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
    setApiKey(null)
  }

  return (
    <MotionConfig reducedMotion="user">
      {apiKey ? (
        <Dashboard key={apiKey} apiKey={apiKey} onDisconnect={disconnect} />
      ) : (
        <ConnectScreen onConnect={connect} />
      )}
    </MotionConfig>
  )
}

export default App
