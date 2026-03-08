'use client'

import { useState } from 'react'

export default function TestAPIPage() {
  const [okxResult, setOkxResult] = useState<any>(null)
  const [qwenResult, setQwenResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOKX = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-okx')
      const data = await res.json()
      setOkxResult(data)
    } catch (error) {
      setOkxResult({ success: false, error: error })
    }
    setLoading(false)
  }

  const testQwen = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-qwen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: '分析代币 TITAN 的投资价值' }),
      })
      const data = await res.json()
      setQwenResult(data)
    } catch (error) {
      setQwenResult({ success: false, error: error })
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>API 测试页面</h1>

      {/* OKX API 测试 */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ff88' }}>📡 OKX API 测试</h2>
        <button
          onClick={testOKX}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: loading ? '#6b7280' : '#000',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? '测试中...' : '测试 OKX API'}
        </button>
        {okxResult && (
          <pre style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', overflow: 'auto' }}>
            {JSON.stringify(okxResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Qwen AI 测试 */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#a855f7' }}>🤖 Qwen AI 测试</h2>
        <button
          onClick={testQwen}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: loading ? '#6b7280' : '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? '测试中...' : '测试 Qwen AI'}
        </button>
        {qwenResult && (
          <pre style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', overflow: 'auto' }}>
            {JSON.stringify(qwenResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
