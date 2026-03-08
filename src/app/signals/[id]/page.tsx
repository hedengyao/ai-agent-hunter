'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSignalDetail, type Signal } from '@/lib/signals'
import toast, { Toaster } from 'react-hot-toast'

// 模拟信号数据
const DEMO_SIGNALS: Record<string, Signal> = {
  '1': {
    id: '1',
    tokenSymbol: 'TITAN',
    tokenAddress: '0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd',
    chainId: '196',
    signalStrength: 92,
    signalType: 'convergence',
    triggeredWallets: [
      { address: '0xabc1...', type: 'smart_money', amount: '$125K' },
      { address: '0xdef2...', type: 'smart_money', amount: '$89K' },
      { address: '0xghi3...', type: 'kol', amount: '$210K' },
    ],
    price: '3.01',
    priceChange24h: 156.3,
    marketCap: '$2.17M',
    liquidity: '$690K',
    riskScore: 85,
    narrative: 'hot',
    createdAt: new Date().toISOString(),
  },
  '2': {
    id: '2',
    tokenSymbol: 'xETH',
    tokenAddress: '0xe7b000003a45145decf8a28fc755ad5ec5ea025a',
    chainId: '196',
    signalStrength: 88,
    signalType: 'smart_money',
    triggeredWallets: [
      { address: '0xjkl4...', type: 'smart_money', amount: '$95K' },
      { address: '0xmno5...', type: 'whale', amount: '$320K' },
    ],
    price: '1985.70',
    priceChange24h: 89.7,
    marketCap: '$5.5M',
    liquidity: '$1.2M',
    riskScore: 90,
    narrative: 'trending',
    createdAt: new Date().toISOString(),
  },
  '3': {
    id: '3',
    tokenSymbol: 'PEPE',
    tokenAddress: '0x7890abcd',
    chainId: '1',
    signalStrength: 85,
    signalType: 'kol',
    triggeredWallets: [
      { address: '0xpqr6...', type: 'kol', amount: '$180K' },
      { address: '0xstu7...', type: 'kol', amount: '$150K' },
    ],
    price: '0.00001234',
    priceChange24h: 67.8,
    marketCap: '$8.9M',
    liquidity: '$890K',
    riskScore: 78,
    narrative: 'hot',
    createdAt: new Date().toISOString(),
  },
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
        // 优先使用模拟数据
        const demoSignal = DEMO_SIGNALS[params.id as string]
        if (demoSignal) {
          setSignal(demoSignal)
        } else {
          // 尝试加载真实数据
          const data = await getSignalDetail(params.id as string)
          setSignal(data || null)
        }
      } catch (error) {
        console.log('使用模拟信号数据')
        const demoSignal = DEMO_SIGNALS[params.id as string]
        if (demoSignal) {
          setSignal(demoSignal)
        }
      } finally {
        setLoading(false)
      }
    }
    loadSignal()
  }, [params.id])

  // AI 分析
  const handleAnalyze = async () => {
    if (!signal) return
    
    setAnalyzing(true)
    
    // TODO: 调用 Qwen AI 分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAnalysis(`## ${signal.tokenSymbol} 分析报告

**信号强度**: ${signal.signalStrength}/100
**信号类型**: ${signal.signalType === 'convergence' ? '多源收敛' : signal.signalType === 'smart_money' ? '聪明钱' : 'KOL/巨鲸'}

**聪明钱动向**: 
${signal.triggeredWallets.map(w => `- ${w.type === 'smart_money' ? '🧠' : w.type === 'kol' ? '📢' : '🐋'} ${w.amount}`).join('\n')}

**价格趋势**: 
当前价格 $${signal.price}
24h 涨幅 ${signal.priceChange24h}%

**风险评估**: 
- 市值：${signal.marketCap}
- 流动性：${signal.liquidity}
- 风险评分：${signal.riskScore}/100

**投资建议**: 
${signal.signalStrength >= 90 ? '强烈建议买入 - 多个聪明钱同时建仓，信号强度极高' : 
  signal.signalStrength >= 85 ? '建议买入 - 聪明钱积极建仓，信号强度高' : 
  '建议观望 - 等待更明确信号'}

**目标价位**: 
- 短期：+50%
- 中期：+100%

**止损建议**: -20%`)
    
    setAnalyzing(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
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
      </div>
    )
  }

  if (!signal) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9ca3af' }}>信号不存在</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            返回首页
          </button>
        </div>
      </div>
    )
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
            <button
              onClick={() => router.back()}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回
            </button>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>AI Agent Hunter</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        {/* 信号头部 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#000',
              }}>
                {signal.tokenSymbol[0]}
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{signal.tokenSymbol}</h1>
                <p style={{ color: '#9ca3af', margin: '0.25rem 0 0 0' }}>{signal.chainId === '196' ? 'X Layer' : 'Ethereum'}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: signal.signalStrength >= 80 ? '#00ff88' : '#f59e0b' }}>
                {signal.signalStrength}/100
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>信号强度</p>
            </div>
          </div>

          {/* 价格信息 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>价格</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>${signal.price}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>24h</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: signal.priceChange24h >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                {signal.priceChange24h >= 0 ? '+' : ''}{signal.priceChange24h}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>市值</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{signal.marketCap}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>流动性</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{signal.liquidity}</p>
            </div>
          </div>

          {/* 触发钱包 */}
          <div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>触发钱包</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {signal.triggeredWallets.map((wallet, i) => (
                <span key={i} style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}>
                  {wallet.type === 'smart_money' ? '🧠' : wallet.type === 'kol' ? '📢' : '🐋'} {wallet.amount}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI 分析 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AI 分析</h2>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                background: analyzing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                color: analyzing ? '#6b7280' : '#000',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {analyzing ? (
                <>
                  <span style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#00ff88',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}/>
                  分析中...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  生成分析
                </>
              )}
            </button>
          </div>

          {analysis && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '1rem',
              padding: '1.5rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}>
              {analysis}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <button style={{
            background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1rem',
            cursor: 'pointer',
            fontSize: '1rem',
          }}>
            一键跟单
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#f8fafc',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.75rem',
            padding: '1rem',
            cursor: 'pointer',
            fontSize: '1rem',
          }}>
            加入自选
          </button>
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
