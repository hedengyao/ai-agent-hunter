'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

// 策略模板
const STRATEGY_TEMPLATES = [
  {
    id: 'aggressive',
    name: '激进狩猎',
    description: '高风险高收益，追求最大 Alpha',
    color: '#ef4444',
    defaultParams: {
      minSignalStrength: 85,
      narrativeFilter: ['hot'],
      maxPosition: 10,
      takeProfit: 100,
      stopLoss: 20,
      gasLimit: 50,
      autoExecute: true,
    },
  },
  {
    id: 'balanced',
    name: '平衡狩猎',
    description: '风险收益平衡，稳健增长',
    color: '#f59e0b',
    defaultParams: {
      minSignalStrength: 88,
      narrativeFilter: ['hot', 'trending'],
      maxPosition: 7,
      takeProfit: 80,
      stopLoss: 15,
      gasLimit: 40,
      autoExecute: true,
    },
  },
  {
    id: 'conservative',
    name: '保守狩猎',
    description: '低风险优先，保护本金',
    color: '#10b981',
    defaultParams: {
      minSignalStrength: 90,
      narrativeFilter: ['hot', 'trending'],
      maxPosition: 5,
      takeProfit: 50,
      stopLoss: 10,
      gasLimit: 30,
      autoExecute: true,
    },
  },
]

export default function AgentsPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const [params, setParams] = useState({
    minSignalStrength: 85,
    narrativeFilter: ['hot'],
    maxPosition: 10,
    takeProfit: 100,
    stopLoss: 20,
    gasLimit: 50,
    autoExecute: true,
  })
  const [creating, setCreating] = useState(false)

  // 选择策略模板
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = STRATEGY_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setParams(template.defaultParams)
      setAgentName(template.name)
    }
  }

  // 切换叙事过滤
  const toggleNarrative = (narrative: string) => {
    setParams(prev => ({
      ...prev,
      narrativeFilter: prev.narrativeFilter.includes(narrative)
        ? prev.narrativeFilter.filter(n => n !== narrative)
        : [...prev.narrativeFilter, narrative],
    }))
  }

  // 创建 Agent
  const handleCreate = async () => {
    if (!agentName) {
      toast.error('请输入 Agent 名称')
      return
    }

    setCreating(true)
    
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          params,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Agent "${agentName}" 创建成功！`)
        setTimeout(() => router.push('/'), 1000)
      } else {
        toast.error(result.error || '创建失败')
      }
    } catch (error) {
      toast.error('创建失败，请重试')
      console.error(error)
    } finally {
      setCreating(false)
    }
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
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="gradient-text" style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AI Agent Hunter</span>
            </a>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>← 返回主页</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>创建 Agent</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>配置你的 AI 狩猎策略</p>
        </div>

        {/* 策略模板选择 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>选择策略模板</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {STRATEGY_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                style={{
                  background: selectedTemplate === template.id
                    ? `rgba(${template.color === '#ef4444' ? '239,68,68' : template.color === '#f59e0b' ? '245,158,11' : '16,185,129'},0.1)`
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${selectedTemplate === template.id ? template.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate !== template.id) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate !== template.id) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: template.color }}>
                      {template.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <span style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      background: template.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}>✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent 名称 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Agent 名称</h2>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="给我的 Agent 起个名字..."
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* 参数配置 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>策略参数</h2>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            {/* 最小信号强度 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>最小信号强度</label>
                <span style={{ fontSize: '0.875rem', color: '#00ff88', fontWeight: 600 }}>{params.minSignalStrength}</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={params.minSignalStrength}
                onChange={(e) => setParams(prev => ({ ...prev, minSignalStrength: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>50</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>100</span>
              </div>
            </div>

            {/* 叙事过滤 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>
                叙事过滤
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['hot', 'trending', 'normal'].map((narrative) => (
                  <button
                    key={narrative}
                    onClick={() => toggleNarrative(narrative)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: params.narrativeFilter.includes(narrative)
                        ? 'rgba(0,255,136,0.2)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${params.narrativeFilter.includes(narrative) ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '0.5rem',
                      color: params.narrativeFilter.includes(narrative) ? '#00ff88' : '#9ca3af',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {narrative === 'hot' ? '🔥 Hot' : narrative === 'trending' ? '📈 Trending' : '📝 Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* 最大仓位 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>最大仓位 (%)</label>
                <span style={{ fontSize: '0.875rem', color: '#00ff88', fontWeight: 600 }}>{params.maxPosition}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={params.maxPosition}
                onChange={(e) => setParams(prev => ({ ...prev, maxPosition: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* 止盈 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>止盈 (%)</label>
                <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>+{params.takeProfit}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={params.takeProfit}
                onChange={(e) => setParams(prev => ({ ...prev, takeProfit: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* 止损 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>止损 (%)</label>
                <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600 }}>-{params.stopLoss}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={params.stopLoss}
                onChange={(e) => setParams(prev => ({ ...prev, stopLoss: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Gas 上限 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Gas 上限 (USD)</label>
                <span style={{ fontSize: '0.875rem', color: '#a855f7', fontWeight: 600 }}>${params.gasLimit}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={params.gasLimit}
                onChange={(e) => setParams(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* 自动执行 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.875rem', color: '#9ca3af' }}>自动执行交易</label>
              <button
                onClick={() => setParams(prev => ({ ...prev, autoExecute: !prev.autoExecute }))}
                style={{
                  width: '3rem',
                  height: '1.75rem',
                  background: params.autoExecute ? '#00ff88' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{
                  position: 'absolute',
                  width: '1.25rem',
                  height: '1.25rem',
                  background: '#fff',
                  borderRadius: '50%',
                  top: '0.25rem',
                  left: params.autoExecute ? '1.5rem' : '0.25rem',
                  transition: 'all 0.3s ease',
                }}/>
              </button>
            </div>
          </div>
        </div>

        {/* 创建按钮 */}
        <button
          onClick={handleCreate}
          disabled={creating || !selectedTemplate}
          style={{
            width: '100%',
            padding: '1rem',
            background: creating || !selectedTemplate
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: creating || !selectedTemplate ? '#6b7280' : '#000',
            fontWeight: 700,
            border: 'none',
            borderRadius: '0.75rem',
            cursor: creating || !selectedTemplate ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!creating && selectedTemplate) {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,136,0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {creating ? '创建中...' : '创建 Agent'}
        </button>
      </main>
    </div>
  )
}
