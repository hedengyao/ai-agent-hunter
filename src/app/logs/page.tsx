'use client'

import { useState, useEffect } from 'react'

export default function LogsPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  // 统计数据
  const [stats, setStats] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalPnl: 0,
  })

  useEffect(() => {
    fetchTrades(currentPage)
    fetchStats()
  }, [currentPage])

  const fetchTrades = async (page: number) => {
    try {
      const res = await fetch(`/api/trades?page=${page}&limit=${itemsPerPage}`)
      const data = await res.json()
      if (data.success) {
        setTrades(data.data || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/trades/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(16,185,129,0.2)', text: '#10b981', label: '✅ 成功' }
      case 'failed':
        return { bg: 'rgba(239,68,68,0.2)', text: '#ef4444', label: '❌ 失败' }
      default:
        return { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b', label: '⏳ 进行中' }
    }
  }

  const getActionColor = (action: string) => {
    return action === 'buy' 
      ? { bg: 'rgba(0,212,255,0.2)', text: '#00d4ff', label: '买入' }
      : { bg: 'rgba(255,0,255,0.2)', text: '#ff00ff', label: '卖出' }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
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
              <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Agent Hunter</span>
            </a>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>← 返回主页</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 2rem 0', background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📜 狩猎日志
        </h1>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard
            title="总记录"
            value={stats.totalTrades}
            icon="📊"
            color="#00d4ff"
          />
          <StatCard
            title="成功"
            value={stats.successfulTrades}
            icon="✅"
            color="#10b981"
          />
          <StatCard
            title="失败"
            value={stats.failedTrades}
            icon="❌"
            color="#ef4444"
          />
          <StatCard
            title="总 PnL"
            value={`$${stats.totalPnl.toFixed(2)}`}
            icon="💰"
            color={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'}
            isPnl
          />
        </div>

        {/* 交易记录表格 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>交易记录</h2>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              第 {currentPage} / {totalPages} 页
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
              加载中...
            </div>
          ) : trades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
              <p style={{ fontSize: '1.125rem' }}>暂无交易记录</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>启动 Agent 开始自动交易</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>代币</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>操作</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>数量</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>价格</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>价值</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>PnL</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>状态</th>
                      <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => {
                      const statusColor = getStatusColor(trade.status)
                      const actionColor = getActionColor(trade.action)
                      const pnl = trade.pnl || 0
                      const pnlPercent = trade.pnl_percent || 0

                      return (
                        <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '2rem',
                                height: '2rem',
                                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: '#000',
                              }}>
                                {trade.token_symbol[0]}
                              </div>
                              <span style={{ fontWeight: 600 }}>{trade.token_symbol}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: actionColor.bg,
                              color: actionColor.text,
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              {actionColor.label}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#f8fafc' }}>
                            {trade.amount?.toFixed(4) || '0'}
                          </td>
                          <td style={{ padding: '1rem', color: '#f8fafc' }}>
                            ${trade.price?.toFixed(6) || '0'}
                          </td>
                          <td style={{ padding: '1rem', color: '#f8fafc' }}>
                            ${trade.value_usd?.toFixed(2) || '0'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ color: pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: pnlPercent >= 0 ? '#10b981' : '#ef4444' }}>
                                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: statusColor.bg,
                              color: statusColor.text,
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              {statusColor.label}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                            {new Date(trade.created_at).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,136,0.2)',
                      color: currentPage === 1 ? '#6b7280' : '#00ff88',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    ← 上一页
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: currentPage === page ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                          color: currentPage === page ? '#00ff88' : '#9ca3af',
                          border: currentPage === page ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: currentPage === page ? 600 : 400,
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,136,0.2)',
                      color: currentPage === totalPages ? '#6b7280' : '#00ff88',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    下一页 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/**
 * 统计卡片组件
 */
function StatCard({ title, value, icon, color, isPnl = false }: any) {
  const displayValue = typeof value === 'number' && isPnl 
    ? `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`
    : value

  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '1rem',
      border: `1px solid ${color}33`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{
          padding: '0.25rem 0.75rem',
          background: `${color}22`,
          color: color,
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
        }}>
          统计
        </span>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color }}>{displayValue}</div>
    </div>
  )
}
