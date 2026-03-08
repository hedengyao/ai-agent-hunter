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
  const [statsData, setStatsData] = useState({
    totalPnl: 0,
    todayTrades: 0,
  })
  const [loading, setLoading] = useState(true)

  // 加载真实数据
  useEffect(() => {
    async function loadData() {
      try {
        // 获取 Agent 列表
        const agentsRes = await fetch('/api/agents')
        const agentsData = await agentsRes.json()
        if (agentsData.success) {
          setAgents(agentsData.data || [])
        }

        // 获取信号列表
        const signalsRes = await fetch('/api/signals')
        const signalsData = await signalsRes.json()
        if (signalsData.success) {
          setSignals(signalsData.data || [])
        }

        // 获取交易统计
        const statsRes = await fetch('/api/trades/stats')
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStatsData({
            totalPnl: statsData.data.totalPnl || 0,
            todayTrades: statsData.data.todayTrades || 0,
          })
        }

        // 获取今日交易
        const tradesRes = await fetch('/api/trades/today')
        const tradesData = await tradesRes.json()
        if (tradesData.success) {
          setTrades(tradesData.data || [])
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // 每 30 秒刷新一次
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // 计算统计数据
  const runningCount = agents.filter(a => a.status === 'running').length
  const totalTrades = agents.reduce((sum, a) => sum + (a.total_trades || 0), 0)
  
  // 计算平均收益（所有 Agent 的总 PnL / Agent 数量）
  const totalPnl = agents.reduce((sum, a) => sum + (a.total_pnl || 0), 0)
  const avgPnl = agents.length > 0 ? totalPnl / agents.length : 0

  const stats = [
    { label: '活跃信号', value: signals.length.toString(), change: '+3 今日', color: '#00ff88', icon: '⚡', link: '/signals' },
    { label: '平均收益', value: `${avgPnl >= 0 ? '+' : ''}$${avgPnl.toFixed(2)}`, change: '+23% 本周', color: '#00d4ff', icon: '📈', link: '/logs' },
    { label: '运行中 Agent', value: runningCount.toString(), change: `共 ${agents.length} 个`, color: '#ff00ff', icon: '🤖', link: '/agents?status=running' },
    { label: '总交易数', value: totalTrades.toString(), change: `今日 ${statsData.todayTrades} 笔`, color: '#a855f7', icon: '📊', link: '/logs' },
  ]

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

  // 编辑 Agent - 跳转到编辑页面
  const editAgent = (agent: any) => {
    const encodedData = encodeURIComponent(JSON.stringify(agent))
    router.push(`/agents/edit?data=${encodedData}`)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af' }}>加载数据...</p>
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
              <div>
                <h1 className="gradient-text" style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>AI Agent Hunter</h1>
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
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0 }}>AI Agent Hunter</h1>
            <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>从人找机会，到 Agent 自动狩猎</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/signals" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary button-hover" style={{ minWidth: '200px', height: '56px', fontSize: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                信号广场
              </button>
            </a>
            <a href="/agents" style={{ textDecoration: 'none' }}>
              <button className="btn-primary button-hover group" style={{ minWidth: '200px', height: '56px', fontSize: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                创建 Agent
              </button>
            </a>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map((stat, i) => (
            <a key={i} href={stat.link} style={{ textDecoration: 'none' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', color: stat.color }}>
                  <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>{stat.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', textAlign: 'center' }}>{stat.change}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{
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
                    }}/>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{agent.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => editAgent(agent)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1rem' }}
                      title="编辑 Agent"
                    >
                      ⚙️
                    </button>
                    <button 
                      onClick={() => toggleAgent(agent.id, agent.status)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      {agent.status === 'running' ? '⏹️' : '▶️'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>胜率</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981', margin: 0 }}>{agent.win_rate?.toFixed(1) || '0'}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>收益</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: agent.total_pnl >= 0 ? '#00ff88' : '#ef4444', margin: 0 }}>
                      {agent.total_pnl >= 0 ? '+' : ''}${agent.total_pnl?.toFixed(2) || '0'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>交易</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{agent.total_trades || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>最后活动</p>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                      {agent.last_run_at ? new Date(agent.last_run_at).toLocaleString('zh-CN') : '从未运行'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}>
            {trades.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>代币</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>操作</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>金额</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>PnL</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>时间</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade: any, i: number) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{trade.token_symbol}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: trade.action === 'buy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: trade.action === 'buy' ? '#10b981' : '#ef4444',
                        }}>{trade.action === 'buy' ? '买入' : '卖出'}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#9ca3af' }}>{trade.amount?.toFixed(4)}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: trade.pnl >= 0 ? '#10b981' : '#ef4444' }}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', color: '#9ca3af' }}>
                        {new Date(trade.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: trade.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: trade.status === 'completed' ? '#10b981' : '#f59e0b',
                        }}>{trade.status === 'completed' ? '完成' : '处理中'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                <p>今日暂无交易</p>
              </div>
            )}
          </div>
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
