'use client'

import { useState, useEffect } from 'react'
import { WalletConnect } from '@/components/WalletConnect'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [statsData, setStatsData] = useState({ totalPnl: 0, todayTrades: 0 })

  // 加载真实数据（基于钱包地址）
  useEffect(() => {
    async function loadData() {
      const savedWallet = localStorage.getItem('wallet_address')

      if (!savedWallet) {
        // 未连接钱包：清空所有数据
        setAgents([])
        setSignals([])
        setTrades([])
        setStatsData({ totalPnl: 0, todayTrades: 0 })
        return
      }

      try {
        // 启动 Agent 监控（确保后台任务运行）
        await fetch('/api/agent-monitor', { method: 'POST' }).catch(() => {})

        // 获取用户数据
        const userRes = await fetch(`/api/user?wallet=${savedWallet}`)
        const userData = await userRes.json()

        if (userData.success) {
          setAgents(userData.data.agents || [])
          setTrades(userData.data.trades || [])

          // 计算统计
          const totalPnl = userData.data.agents?.reduce((sum: number, a: any) => sum + (a.total_pnl || 0), 0) || 0
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const todayTrades = userData.data.trades?.filter((t: any) => {
            const tradeDate = new Date(t.created_at)
            return tradeDate >= today
          }).length || 0

          setStatsData({ totalPnl, todayTrades })
        }

        // 获取信号
        const signalsRes = await fetch('/api/signals')
        const signalsData = await signalsRes.json()
        if (signalsData.success) {
          setSignals(signalsData.data || [])
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: '活跃信号', value: signals.length.toString(), change: `${signals.filter(s => { const d = new Date(s.created_at); const today = new Date(); today.setHours(0,0,0,0); return d >= today }).length} 今日`, color: '#00ff88', icon: '⚡', link: '/signals' },
    { label: '平均收益', value: `${agents.length > 0 ? (agents.reduce((sum, a) => sum + (a.total_pnl || 0), 0) / agents.length).toFixed(2) : '0.00'}`, change: `${agents.length > 0 ? `$${(agents.reduce((sum, a) => sum + (a.total_pnl || 0), 0) / agents.length * 0.15).toFixed(2)} 本周` : '本周'}`, color: '#00d4ff', icon: '📈', link: '/logs' },
    { label: '运行中 Agent', value: agents.filter(a => a.status === 'running').length.toString(), change: `共 ${agents.length} 个`, color: '#ff00ff', icon: '🤖', link: '/agents?status=running' },
    { label: '总交易数', value: agents.reduce((sum, a) => sum + (a.total_trades || 0), 0).toString(), change: `今日 ${statsData.todayTrades} 笔`, color: '#a855f7', icon: '📊', link: '/logs' },
  ]

  const todayTrades = trades.filter(t => {
    const tradeDate = new Date(t.created_at)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tradeDate >= today
  })

  // 停止/启动 Agent
  const toggleAgent = (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running'
    
    // 如果是停止操作，显示确认对话框
    if (newStatus === 'stopped') {
      const confirmed = window.confirm('确定要停止这个 Agent 吗？停止后将不再产生收益。')
      if (!confirmed) return
    }
    
    setAgents(agents.map(a => 
      a.id === agentId ? { ...a, status: newStatus as 'running' | 'stopped' } : a
    ))
    
    toast.success(`Agent 已${newStatus === 'running' ? '启动' : '停止'}`)
  }

  // 编辑 Agent - 跳转到编辑页面并传递数据
  const editAgent = (agent: any) => {
    // 将 Agent 数据编码后传递到编辑页面
    const encodedData = encodeURIComponent(JSON.stringify(agent))
    router.push(`/agents/${agent.id}/edit?data=${encodedData}`)
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
                boxShadow: '0 0 20px rgba(0,255,136,0.4)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="gradient-text" style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.2,
                  margin: 0,
                }}>AI Agent Hunter</h1>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>自动狩猎平台</p>
              </div>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="gradient-text" style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>AI Agent Hunter</h1>
            <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>从人找机会，到 Agent 自动狩猎</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/signals" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#f8fafc',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                信号广场
              </button>
            </a>
            <a href="/agents/edit" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                color: '#000',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,136,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                创建 Agent
              </button>
            </a>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {stats.map((stat, i) => (
            <a href={stat.link} key={i} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredCard === i ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transform: hoveredCard === i ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === i ? `0 20px 40px ${stat.color}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                  <span style={{ fontSize: '1.875rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>{stat.change}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Agent 列表 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>我的 Agent</h2>
            <a href="/agents" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              查看全部
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          {agents.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}>
              {agents.map((agent, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        borderRadius: '50%',
                        background: agent.status === 'running' ? '#00ff88' : '#6b7280',
                        display: 'inline-block',
                        animation: agent.status === 'running' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                      }}/>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{agent.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => editAgent(agent)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.25rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                          e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        title="编辑 Agent"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => toggleAgent(agent.id, agent.status)}
                        style={{
                          background: agent.status === 'running' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.25rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = agent.status === 'running' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'
                          e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = agent.status === 'running' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        title={agent.status === 'running' ? '停止 Agent' : '启动 Agent'}
                      >
                        {agent.status === 'running' ? '⏹️' : '▶️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>胜率</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981', margin: 0 }}>{agent.winRate}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>收益</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#00ff88', margin: 0 }}>+${(agent.pnl || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>交易</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{agent.trades || 0}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>最后活动</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{agent.activity || '暂无'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '1rem',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>暂时没有创建 Agent</p>
            </div>
          )}
        </div>

        {/* 今日交易 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>今日交易</h2>
            <a href="/logs" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              查看日志
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          {trades.length > 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {['代币', '操作', '金额', 'PnL', '时间', '状态'].map((header, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>
                        <a href={`/signals/${i === 0 ? '1' : i === 1 ? '2' : '3'}`} style={{ color: '#00d4ff', textDecoration: 'none' }}>{header}</a>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{trade.token}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: 'rgba(16,185,129,0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.3)',
                        }}>{trade.action}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#9ca3af' }}>{trade.amount}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: trade.pnl.startsWith('+') ? '#10b981' : '#ef4444' }}>{trade.pnl}</td>
                      <td style={{ padding: '1rem', color: '#9ca3af' }}>{trade.time}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: trade.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: trade.status === 'completed' ? '#10b981' : '#f59e0b',
                          border: '1px solid rgba(16,185,129,0.3)',
                        }}>{trade.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '1rem',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>暂时没有交易</p>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem 0', marginTop: '4rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>© 2026 AI Agent Hunter. Built for OKX AI Hackathon.</p>
          <p style={{ marginTop: '0.5rem' }}>Powered by OKX OnchainOS + Qwen 3.5 Plus</p>
        </div>
      </footer>
    </div>
  )
}
