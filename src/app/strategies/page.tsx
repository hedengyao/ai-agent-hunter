'use client'

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// 策略模板数据
const STRATEGIES = [
  {
    id: 'whale-hunter',
    name: '巨鲸追踪者',
    description: '专注跟踪巨鲸钱包的大额交易',
    author: 'OKX Research',
    followers: 2345,
    winRate: 76.5,
    totalPnl: 12450,
    risk: 'high',
    params: {
      minSignalStrength: 85,
      maxPosition: 15,
      takeProfit: 150,
      stopLoss: 25,
    },
  },
  {
    id: 'safe-alpha',
    name: '稳健 Alpha',
    description: '低风险高胜率，适合保守投资者',
    author: 'AlphaDAO',
    followers: 1892,
    winRate: 82.3,
    totalPnl: 8920,
    risk: 'low',
    params: {
      minSignalStrength: 90,
      maxPosition: 5,
      takeProfit: 50,
      stopLoss: 10,
    },
  },
  {
    id: 'momentum-king',
    name: '动量之王',
    description: '追逐市场热点，快速进出',
    author: 'CryptoKing',
    followers: 3421,
    winRate: 71.2,
    totalPnl: 18760,
    risk: 'high',
    params: {
      minSignalStrength: 80,
      maxPosition: 20,
      takeProfit: 200,
      stopLoss: 30,
    },
  },
  {
    id: 'balanced-pro',
    name: '平衡专业版',
    description: '风险收益平衡，长期稳定增长',
    author: 'ProTrader',
    followers: 1567,
    winRate: 78.9,
    totalPnl: 9850,
    risk: 'medium',
    params: {
      minSignalStrength: 88,
      maxPosition: 10,
      takeProfit: 100,
      stopLoss: 15,
    },
  },
]

export default function StrategiesPage() {
  const router = useRouter()
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const filteredStrategies = selectedRisk === 'all'
    ? STRATEGIES
    : STRATEGIES.filter(s => s.risk === selectedRisk)

  const handleCopy = (strategyId: string) => {
    toast.success('策略已复制到我的 Agent！')
    router.push('/agents')
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
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>策略市场</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>复制成功交易者的策略</p>
        </div>

        {/* 风险过滤器 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              style={{
                padding: '0.5rem 1rem',
                background: selectedRisk === risk ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedRisk === risk ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '0.5rem',
                color: selectedRisk === risk ? '#00ff88' : '#9ca3af',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {risk === 'all' ? '全部' : risk === 'low' ? '低风险' : risk === 'medium' ? '中风险' : '高风险'}
            </button>
          ))}
        </div>

        {/* 策略列表 */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredStrategies.map((strategy) => (
            <div
              key={strategy.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* 左侧信息 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{strategy.name}</h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: strategy.risk === 'low' ? 'rgba(16,185,129,0.2)' : strategy.risk === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: strategy.risk === 'low' ? '#10b981' : strategy.risk === 'medium' ? '#f59e0b' : '#ef4444',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {strategy.risk === 'low' ? '低风险' : strategy.risk === 'medium' ? '中风险' : '高风险'}
                  </span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{strategy.description}</p>
                
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>作者</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{strategy.author}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>跟随者</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{strategy.followers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>胜率</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', margin: 0 }}>{strategy.winRate}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>总收益</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', margin: 0 }}>+${strategy.totalPnl.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 右侧按钮 */}
              <button
                onClick={() => handleCopy(strategy.id)}
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                复制策略
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
