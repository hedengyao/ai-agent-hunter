'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

// 模拟日志数据
const MOCK_LOGS = [
  {
    id: '1',
    timestamp: '2026-03-07 10:23:45',
    agent: '激进狩猎',
    action: 'discovered',
    token: 'TITAN',
    signalStrength: 92,
    decision: 'BUY',
    result: '+$120',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2026-03-07 09:15:32',
    agent: '激进狩猎',
    action: 'analyzed',
    token: 'xETH',
    signalStrength: 88,
    decision: 'BUY',
    result: '+$89',
    status: 'success',
  },
  {
    id: '3',
    timestamp: '2026-03-07 08:42:18',
    agent: '平衡狩猎',
    action: 'executed',
    token: 'PEPE',
    signalStrength: 85,
    decision: 'BUY',
    result: '-$15',
    status: 'loss',
  },
  {
    id: '4',
    timestamp: '2026-03-07 08:15:00',
    agent: '保守狩猎',
    action: 'skipped',
    token: 'DOGE2',
    signalStrength: 72,
    decision: 'SKIP',
    result: '-',
    status: 'info',
  },
  {
    id: '5',
    timestamp: '2026-03-07 07:30:22',
    agent: '激进狩猎',
    action: 'stopped',
    token: 'SHIB3',
    signalStrength: 65,
    decision: 'SELL',
    result: '+$45',
    status: 'success',
  },
]

const ACTION_ICONS: Record<string, string> = {
  discovered: '🔍',
  analyzed: '🧠',
  executed: '⚡',
  skipped: '⏭️',
  stopped: '⏹️',
}

const ACTION_LABELS: Record<string, string> = {
  discovered: '发现信号',
  analyzed: 'AI 分析',
  executed: '执行交易',
  skipped: '跳过',
  stopped: '止盈止损',
}

export default function LogsPage() {
  const [filter, setFilter] = useState<'all' | 'success' | 'loss' | 'info'>('all')
  const [logs, setLogs] = useState(MOCK_LOGS)

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.status === filter)

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    loss: logs.filter(l => l.status === 'loss').length,
    totalPnl: logs.reduce((sum, log) => {
      if (log.result.startsWith('+')) return sum + parseFloat(log.result.slice(1))
      if (log.result.startsWith('-')) return sum - parseFloat(log.result.slice(1))
      return sum
    }, 0),
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
          }}>狩猎日志</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Agent 决策与交易记录</p>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>总记录</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>{stats.total}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>成功</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: '0.25rem 0 0 0' }}>{stats.success}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>亏损</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444', margin: '0.25rem 0 0 0' }}>{stats.loss}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>总 PnL</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: stats.totalPnl >= 0 ? '#10b981' : '#ef4444', margin: '0.25rem 0 0 0' }}>
              {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(0)}
            </p>
          </div>
        </div>

        {/* 过滤器 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {(['all', 'success', 'loss', 'info'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === f ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filter === f ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '0.5rem',
                color: filter === f ? '#00ff88' : '#9ca3af',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? '全部' : f === 'success' ? '盈利' : f === 'loss' ? '亏损' : '信息'}
            </button>
          ))}
        </div>

        {/* 日志列表 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          overflow: 'hidden',
        }}>
          {filteredLogs.map((log, i) => (
            <div
              key={log.id}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: i !== filteredLogs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {/* 图标 */}
              <span style={{ fontSize: '1.5rem' }}>{ACTION_ICONS[log.action]}</span>

              {/* 内容 */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{log.token}</span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                  }}>{ACTION_LABELS[log.action]}</span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: log.decision === 'BUY' ? 'rgba(16,185,129,0.2)' : log.decision === 'SELL' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                    color: log.decision === 'BUY' ? '#10b981' : log.decision === 'SELL' ? '#ef4444' : '#9ca3af',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>{log.decision}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span>{log.agent}</span>
                  <span>•</span>
                  <span>信号强度：{log.signalStrength}</span>
                  <span>•</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>

              {/* 结果 */}
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                {log.result !== '-' && (
                  <span style={{
                    fontWeight: 700,
                    color: log.result.startsWith('+') ? '#10b981' : log.result.startsWith('-') ? '#ef4444' : '#9ca3af',
                  }}>
                    {log.result}
                  </span>
                )}
              </div>

              {/* 状态 */}
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: log.status === 'success' ? '#10b981' : log.status === 'loss' ? '#ef4444' : '#6b7280',
              }}/>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
