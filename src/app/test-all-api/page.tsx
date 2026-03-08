'use client'

import { useState } from 'react'

export default function TestAllAPIPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string, key: string) => {
    setLoading(true)
    try {
      const res = await fetch(endpoint)
      const data = await res.json()
      setResults((prev: any) => ({ ...prev, [key]: { success: true, data: data } }))
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, [key]: { success: false, error: error.message } }))
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🧪 API 测试中心</h1>

      {/* OKX API 测试 */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00ff88' }}>📡 OKX API 测试</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => testAPI('/api/okx-curl', 'okx-curl')}
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
            {loading ? '测试中...' : '测试代币信息'}
          </button>
          <button
            onClick={() => testAPI('/api/signals', 'signals')}
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
            {loading ? '测试中...' : '测试 Signals API'}
          </button>
        </div>
        {results['okx-curl'] && (
          <pre style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem' }}>
            {JSON.stringify(results['okx-curl'], null, 2)}
          </pre>
        )}
        {results['signals'] && (
          <pre style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem' }}>
            {JSON.stringify(results['signals'], null, 2)}
          </pre>
        )}
      </div>

      {/* 功能测试 */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f59e0b' }}>🎯 功能测试</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/agents/edit">
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              创建 Agent
            </button>
          </a>
          <a href="/signals">
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              信号广场
            </button>
          </a>
          <a href="/agents">
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              我的 Agent
            </button>
          </a>
          <a href="/logs">
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              狩猎日志
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
