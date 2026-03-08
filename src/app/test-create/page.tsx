'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function TestCreateAgent() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createAgent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试 Agent ' + Date.now(),
          config: {
            minSignalStrength: 85,
            maxPosition: 10,
            takeProfit: 100,
            stopLoss: 20,
          }
        }),
      })
      const data = await res.json()
      setResult(data)
      
      if (data.success) {
        toast.success('创建成功！')
      } else {
        toast.error('创建失败：' + (data.error || '未知错误'))
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
      toast.error('创建失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <Toaster position="top-right" />
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🧪 测试创建 Agent</h1>
      
      <button
        onClick={createAgent}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
          color: loading ? '#6b7280' : '#000',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '1rem',
        }}
      >
        {loading ? '创建中...' : '创建测试 Agent'}
      </button>
      
      {result && (
        <pre style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '0.5rem', overflow: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
