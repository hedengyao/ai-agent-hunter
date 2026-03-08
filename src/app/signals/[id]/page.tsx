'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

interface Signal {
  id: string
  tokenSymbol: string
  tokenAddress: string
  chainId: string
  signalStrength: number
  signalType: string
  triggeredWallets: Array<{ address: string; type: string; amount: string }>
  price: string
  priceChange24h: number
  marketCap: string
  liquidity: string
  narrative?: string
  createdAt: string
}

export default function SignalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [signal, setSignal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  useEffect(() => {
    async function loadSignal() {
      try {
        // 从数据库获取信号
        const res = await fetch(`/api/signals/${params.id}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          setSignal(data.data)
        } else {
          toast.error('信号不存在')
        }
      } catch (error) {
        console.error('加载信号失败:', error)
        toast.error('加载失败')
      } finally {
        setLoading(false)
      }
    }

    loadSignal()
  }, [params.id])

  const analyzeSignal = async () => {
    if (!signal) return
    
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenSymbol: signal.tokenSymbol,
          tokenAddress: signal.tokenAddress,
          chainId: signal.chainId,
          signalStrength: signal.signalStrength,
          price: signal.price,
          priceChange24h: signal.priceChange24h,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setAnalysis(data.analysis)
        toast.success('AI 分析完成')
      } else {
        toast.error(data.error || '分析失败')
      }
    } catch (error) {
      console.error('AI 分析失败:', error)
      toast.error('分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af' }}>加载信号详情...</p>
        </div>
      </div>
    )
  }

  if (!signal) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af' }}>信号不存在</p>
          <button onClick={() => router.back()} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '0.5rem', cursor: 'pointer' }}>返回</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
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
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回
            </button>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>信号详情</span>
            <div style={{ width: '100px' }} />
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        {/* 信号头部 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#000',
              }}>
                {signal.tokenSymbol[0]}
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{signal.tokenSymbol}</h1>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                  {signal.chainId === '196' ? 'X Layer' : signal.chainId === '1' ? 'Ethereum' : `Chain ${signal.chainId}`}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: signal.signalStrength >= 80 ? '#00ff88' : signal.signalStrength >= 60 ? '#f59e0b' : '#ef4444' }}>
                {signal.signalStrength}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>信号强度</p>
            </div>
          </div>

          {/* 信号强度条 */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#9ca3af' }}>信号强度</span>
              <span style={{ color: signal.signalStrength >= 80 ? '#00ff88' : signal.signalStrength >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                {signal.signalStrength}/100
              </span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                width: `${signal.signalStrength}%`,
                height: '100%',
                background: signal.signalStrength >= 80 
                  ? 'linear-gradient(90deg, #00ff88, #00d4ff)' 
                  : signal.signalStrength >= 60 
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* 价格信息 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>当前价格</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>${signal.price}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>24h 变化</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: signal.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                {signal.priceChange24h >= 0 ? '+' : ''}{signal.priceChange24h}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>市值</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>{signal.marketCap}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>流动性</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>{signal.liquidity}</p>
            </div>
          </div>

          {/* 触发钱包 */}
          {signal.triggeredWallets && signal.triggeredWallets.length > 0 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem' }}>触发钱包</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {signal.triggeredWallets.map((wallet, i) => (
                  <div key={i} style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span>{wallet.type === 'smart_money' ? '🧠' : wallet.type === 'kol' ? '📢' : '🐋'}</span>
                    <span style={{ fontSize: '0.875rem' }}>{wallet.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 叙事标签 */}
          {signal.narrative && (
            <div style={{ marginTop: '1.5rem' }}>
              <span style={{
                padding: '0.5rem 1rem',
                background: signal.narrative === 'hot' ? 'rgba(239,68,68,0.2)' : signal.narrative === 'trending' ? 'rgba(245,158,11,0.2)' : 'rgba(107,114,128,0.2)',
                color: signal.narrative === 'hot' ? '#ef4444' : signal.narrative === 'trending' ? '#f59e0b' : '#9ca3af',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                {signal.narrative === 'hot' ? '🔥 热门叙事' : signal.narrative === 'trending' ? '📈 上升趋势' : '📝 普通'}
              </span>
            </div>
          )}
        </div>

        {/* AI 分析 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>🤖 AI 分析</h2>
            <button
              onClick={analyzeSignal}
              disabled={analyzing}
              style={{
                padding: '0.75rem 1.5rem',
                background: analyzing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: analyzing ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {analyzing ? '分析中...' : '生成分析报告'}
            </button>
          </div>

          {analysis ? (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '0.5rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}>
              {analysis}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
              <p style={{ fontSize: '1.125rem' }}>点击"生成分析报告"开始 AI 分析</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>基于 Qwen 3.5 大模型的专业分析</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
