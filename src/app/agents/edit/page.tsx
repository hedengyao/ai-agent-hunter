'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function CreateAgentPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    minSignalStrength: 85,
    narrativeFilter: ['hot', 'trending'] as string[],
    maxPosition: 10,
    takeProfit: 100,
    stopLoss: 20,
    gasLimit: 50,
    autoExecute: true,
  })
  
  const [creating, setCreating] = useState(false)

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('请输入 Agent 名称')
      return
    }

    setCreating(true)

    try {
      // 获取当前连接的钱包地址
      const walletAddress = localStorage.getItem('wallet_address') || ''

      // 真实调用 API 创建 Agent
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          config: formData,
          walletAddress: walletAddress,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Agent "${formData.name}" 创建成功！`)
        // 跳转到所有 Agent 页面
        router.push('/agents')
      } else {
        toast.error(result.error || '创建失败')
      }
    } catch (error) {
      console.error('创建 Agent 失败:', error)
      toast.error('创建失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  const toggleNarrative = (narrative: string) => {
    setFormData(prev => ({
      ...prev,
      narrativeFilter: prev.narrativeFilter.includes(narrative)
        ? prev.narrativeFilter.filter(n => n !== narrative)
        : [...prev.narrativeFilter, narrative],
    }))
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
            <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>创建 Agent</span>
            <div style={{ width: '100px' }} />
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            创建新的 Agent
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>配置你的 AI 狩猎策略</p>
        </div>

        {/* 策略模板选择 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>选择策略模板</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div 
              onClick={() => setFormData({
                ...formData,
                name: '激进狩猎',
                minSignalStrength: 85,
                maxPosition: 15,
                takeProfit: 150,
                stopLoss: 25,
              })}
              style={{
                background: formData.name === '激进狩猎' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${formData.name === '激进狩猎' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#ef4444' }}>激进狩猎</h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>高风险高收益，追求最大 Alpha</p>
                </div>
                {formData.name === '激进狩猎' && (
                  <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>✓</span>
                )}
              </div>
            </div>

            <div 
              onClick={() => setFormData({
                ...formData,
                name: '平衡狩猎',
                minSignalStrength: 88,
                maxPosition: 10,
                takeProfit: 100,
                stopLoss: 20,
              })}
              style={{
                background: formData.name === '平衡狩猎' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${formData.name === '平衡狩猎' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#f59e0b' }}>平衡狩猎</h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>风险收益平衡，稳健增长</p>
                </div>
                {formData.name === '平衡狩猎' && (
                  <span style={{ color: '#f59e0b', fontSize: '1.5rem' }}>✓</span>
                )}
              </div>
            </div>

            <div 
              onClick={() => setFormData({
                ...formData,
                name: '保守狩猎',
                minSignalStrength: 90,
                maxPosition: 5,
                takeProfit: 50,
                stopLoss: 10,
              })}
              style={{
                background: formData.name === '保守狩猎' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${formData.name === '保守狩猎' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#10b981' }}>保守狩猎</h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>低风险优先，保护本金</p>
                </div>
                {formData.name === '保守狩猎' && (
                  <span style={{ color: '#10b981', fontSize: '1.5rem' }}>✓</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 创建表单 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          {/* Agent 名称 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>Agent 名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="给你的 Agent 起个名字..."
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '1rem',
                outline: 'none',
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

          {/* 创建按钮 */}
          <button
            onClick={handleSave}
            disabled={creating || !formData.name}
            style={{
              width: '100%',
              padding: '1rem',
              background: creating || !formData.name ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
              color: creating || !formData.name ? '#6b7280' : '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: creating || !formData.name ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {creating ? '创建中...' : '创建 Agent'}
          </button>
        </div>
      </main>
    </div>
  )
}
