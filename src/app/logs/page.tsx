'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function LogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'logs' | 'trades'>('logs')

  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet_address') || ''
    setWallet(savedWallet)
    if (savedWallet) {
      fetchLogs(savedWallet)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchLogs = async (walletAddress: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/logs?wallet=${walletAddress}&limit=100`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data || [])
        setTrades(data.trades || [])
      }
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' }
      case 'warning':
        return { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' }
      case 'success':
        return { bg: 'rgba(16,185,129,0.2)', text: '#10b981' }
      default:
        return { bg: 'rgba(59,130,246,0.2)', text: '#3b82f6' }
    }
  }

  const getActionColor = (action: string) => {
    if (action === 'buy') {
      return { bg: 'rgba(0,212,255,0.2)', text: '#00d4ff', label: '买入' }
    } else if (action === 'sell') {
      return { bg: 'rgba(255,0,255,0.2)', text: '#ff00ff', label: '卖出' }
    }
    return { bg: 'rgba(139,92,246,0.2)', text: '#8b5cf6', label: action }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)', color: '#f8fafc' }}>
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
              <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Agent Hunter</span>
            </a>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>← 返回主页</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 2rem 0', background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📜 狩猎日志
        </h1>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              background: activeTab === 'logs' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'logs' ? '#00d4ff' : '#9ca3af',
              border: `1px solid ${activeTab === 'logs' ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.3s ease',
            }}
          >
            📝 Agent 日志
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            style={{
              background: activeTab === 'trades' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'trades' ? '#10b981' : '#9ca3af',
              border: `1px solid ${activeTab === 'trades' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.3s ease',
            }}
          >
            💰 交易记录
          </button>
        </div>

        {/* 内容区域 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
              <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              加载中...
            </div>
          ) : activeTab === 'logs' ? (
            logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                <p style={{ fontSize: '1.125rem' }}>暂时没有 Agent 日志</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>启动 Agent 后会自动记录日志</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${getLevelColor(log.level).bg.replace('0.2', '0.1')}`,
                      borderRadius: '0.75rem',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: getLevelColor(log.level).bg,
                          color: getLevelColor(log.level).text,
                        }}>
                          {log.level.toUpperCase()}
                        </span>
                        {log.action && (
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: getActionColor(log.action).bg,
                            color: getActionColor(log.action).text,
                          }}>
                            {getActionColor(log.action).label}
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {formatTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#f8fafc', margin: 0 }}>
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            trades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                <p style={{ fontSize: '1.125rem' }}>暂时没有交易记录</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Agent 发现信号后会自动交易</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>代币</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>操作</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>金额</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>PnL</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>时间</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{trade.token_symbol}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: getActionColor(trade.action).bg,
                            color: getActionColor(trade.action).text,
                          }}>
                            {getActionColor(trade.action).label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#9ca3af' }}>${(trade.value_usd || 0).toFixed(2)}</td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: (trade.pnl || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', color: '#9ca3af' }}>{formatTime(trade.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: trade.status === 'completed' ? 'rgba(16,185,129,0.2)' : trade.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                            color: trade.status === 'completed' ? '#10b981' : trade.status === 'failed' ? '#ef4444' : '#f59e0b',
                          }}>
                            {trade.status === 'completed' ? '✅ 完成' : trade.status === 'failed' ? '❌ 失败' : '⏳ 进行中'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
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
