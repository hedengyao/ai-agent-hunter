'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import toast, { Toaster } from 'react-hot-toast'

function EditForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const encodedData = searchParams.get('data') || ''
  
  // 解码 Agent 数据
  const agent = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null
  
  const [formData, setFormData] = useState(agent ? {
    name: agent.name,
    minSignalStrength: 85,
    narrativeFilter: ['hot', 'trending'],
    maxPosition: 10,
    takeProfit: 100,
    stopLoss: 20,
    gasLimit: 50,
    autoExecute: true,
  } : null)

  if (!agent || !formData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <p>未找到 Agent 数据</p>
      </div>
    )
  }

  const handleSave = () => {
    toast.success(`Agent "${agent.name}" 配置已保存`)
    setTimeout(() => router.back(), 1000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <Toaster position="top-right" />
      
      {/* 导航栏 */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回
            </button>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>编辑 Agent</span>
            <div style={{ width: '100px' }} />
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            编辑 {agent.name}
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>调整 Agent 的策略参数</p>
        </div>

        {/* 编辑表单 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          {/* Agent 名称 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>Agent 名称</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '1rem',
                opacity: 0.5,
              }}
            />
          </div>

          {/* 最小信号强度 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>最小信号强度</label>
            <input
              type="range"
              min="50"
              max="100"
              value={formData.minSignalStrength}
              onChange={(e) => setFormData({ ...formData, minSignalStrength: parseInt(e.target.value) })}
              style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', appearance: 'none', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: formData.minSignalStrength >= 85 ? '#00ff88' : '#f59e0b' }}>
              <span>当前值：{formData.minSignalStrength}</span>
              <span>建议：≥85</span>
            </div>
          </div>

          {/* 最大仓位 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>最大仓位 (%)</label>
            <input
              type="range"
              min="1"
              max="50"
              value={formData.maxPosition}
              onChange={(e) => setFormData({ ...formData, maxPosition: parseInt(e.target.value) })}
              style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', appearance: 'none', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#00d4ff' }}>
              <span>当前值：{formData.maxPosition}%</span>
              <span>建议：5-15%</span>
            </div>
          </div>

          {/* 止盈 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>止盈 (%)</label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: parseInt(e.target.value) })}
              style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', appearance: 'none', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
              <span>当前值：+{formData.takeProfit}%</span>
              <span>建议：80-150%</span>
            </div>
          </div>

          {/* 止损 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>止损 (%)</label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: parseInt(e.target.value) })}
              style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', appearance: 'none', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
              <span>当前值：-{formData.stopLoss}%</span>
              <span>建议：15-25%</span>
            </div>
          </div>

          {/* Gas 上限 */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>Gas 上限 (USD)</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={formData.gasLimit}
              onChange={(e) => setFormData({ ...formData, gasLimit: parseInt(e.target.value) })}
              style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', appearance: 'none', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#a855f7' }}>
              <span>当前值：${formData.gasLimit}</span>
              <span>建议：$30-80</span>
            </div>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,136,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            保存配置
          </button>
        </div>
      </main>
    </div>
  )
}

export default function EditAgentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        <p>加载中...</p>
      </div>
    }>
      <EditForm />
    </Suspense>
  )
}
