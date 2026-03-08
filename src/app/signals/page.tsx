'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSignals, type Signal } from '@/lib/signals'
import { Toaster } from 'react-hot-toast'

export default function SignalsPage() {
  const router = useRouter()
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'smart_money' | 'kol' | 'whale' | 'convergence'>('all')

  useEffect(() => {
    loadSignals()
    // 每 60 秒刷新一次
    const interval = setInterval(loadSignals, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadSignals() {
    try {
      const data = await getSignals(50)
      setSignals(data)
    } catch (error) {
      console.log('使用模拟信号数据')
    } finally {
      setLoading(false)
    }
  }

  const filteredSignals = filter === 'all'
    ? signals
    : signals.filter(s => s.signalType === filter)

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
          }}>信号广场</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>发现最强 Alpha 信号</p>
        </div>

        {/* 过滤器 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'all' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === 'all' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.5rem',
              color: filter === 'all' ? '#00ff88' : '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('smart_money')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'smart_money' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === 'smart_money' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.5rem',
              color: filter === 'smart_money' ? '#00ff88' : '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            🧠 聪明钱
          </button>
          <button
            onClick={() => setFilter('kol')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'kol' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === 'kol' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.5rem',
              color: filter === 'kol' ? '#00ff88' : '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            📢 KOL
          </button>
          <button
            onClick={() => setFilter('whale')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'whale' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === 'whale' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.5rem',
              color: filter === 'whale' ? '#00ff88' : '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            🐋 巨鲸
          </button>
          <button
            onClick={() => setFilter('convergence')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'convergence' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === 'convergence' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.5rem',
              color: filter === 'convergence' ? '#00ff88' : '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            ✨ 多源收敛
          </button>
        </div>

        {/* 信号列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#00ff88',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}/>
            <p style={{ color: '#9ca3af' }}>加载信号中...</p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
            <p>暂无信号</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => router.push(`/signals/${signal.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#000',
                    }}>
                      {signal.tokenSymbol[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{signal.tokenSymbol}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                        {signal.chainId === '196' ? 'X Layer' : 'Ethereum'} · 信号强度：{signal.signalStrength}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>${signal.price}</p>
                      <p style={{ fontSize: '0.875rem', color: signal.priceChange24h >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                        {signal.priceChange24h >= 0 ? '+' : ''}{signal.priceChange24h}%
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>市值</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{signal.marketCap}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>流动性</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{signal.liquidity}</p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
