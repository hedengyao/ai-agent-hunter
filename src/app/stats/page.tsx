'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stats?period=${period}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af' }}>加载统计数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>📊 收益统计</h1>

        {/* 时间选择器 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {['7d', '30d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.5rem 1rem',
                background: period === p ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 'rgba(255,255,255,0.1)',
                color: period === p ? '#000' : '#f8fafc',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {p === '7d' ? '最近 7 天' : p === '30d' ? '最近 30 天' : '全部'}
            </button>
          ))}
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard
            title="总收益"
            value={`${stats?.totalPnl >= 0 ? '+' : ''}$${stats?.totalPnl?.toFixed(2) || '0'}`}
            change={`${stats?.totalPnlPercent?.toFixed(2) || '0'}%`}
            positive={stats?.totalPnl >= 0}
            icon="💰"
          />
          <StatCard
            title="胜率"
            value={`${stats?.winRate || '0'}%`}
            change={`${stats?.winningTrades || 0}胜 ${stats?.losingTrades || 0}负`}
            positive={(stats?.winRate || 0) > 50}
            icon="🎯"
          />
          <StatCard
            title="交易次数"
            value={stats?.totalTrades || 0}
            change={`${stats?.openPositions || 0} 持仓中`}
            positive={true}
            icon="📈"
          />
          <StatCard
            title="未实现盈亏"
            value={`${stats?.unrealizedPnl >= 0 ? '+' : ''}$${stats?.unrealizedPnl?.toFixed(2) || '0'}`}
            change="持仓盈亏"
            positive={stats?.unrealizedPnl >= 0}
            icon="📊"
          />
        </div>

        {/* 详细统计 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#9ca3af' }}>交易分析</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>平均收益</span>
                <span style={{ color: stats?.avgPnl >= 0 ? '#00ff88' : '#ef4444' }}>
                  ${stats?.avgPnl?.toFixed(2) || '0'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>最大盈利</span>
                <span style={{ color: '#00ff88' }}>+${stats?.maxWin?.toFixed(2) || '0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>最大亏损</span>
                <span style={{ color: '#ef4444' }}>-${Math.abs(stats?.maxLoss || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#9ca3af' }}>盈亏比</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ 
                    width: `${stats?.winRate || 0}%`, 
                    background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{ 
                    width: `${100 - (stats?.winRate || 0)}%`, 
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }} />
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {stats?.winRate || 0}%
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#00ff88' }}>盈利 {stats?.winningTrades || 0}</span>
              <span style={{ color: '#ef4444' }}>亏损 {stats?.losingTrades || 0}</span>
            </div>
          </div>
        </div>

        {/* 每日收益图表 */}
        {stats?.dailyStats && stats.dailyStats.length > 0 && (
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#9ca3af' }}>每日收益趋势</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.dailyStats.length}, 1fr)`, gap: '0.5rem', alignItems: 'flex-end', height: '200px' }}>
              {stats.dailyStats.map((day: any, index: number) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${Math.min(Math.abs(day.pnl) * 2, 150)}px`,
                    background: day.pnl >= 0 
                      ? 'linear-gradient(180deg, #00ff88, #00d4ff)' 
                      : 'linear-gradient(180deg, #ef4444, #dc2626)',
                    borderRadius: '0.25rem 0.25rem 0 0',
                    transition: 'height 0.3s ease',
                  }} />
                  <span style={{ fontSize: '0.625rem', color: '#9ca3af', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * 统计卡片组件
 */
function StatCard({ title, value, change, positive, icon }: any) {
  return (
    <div style={{ 
      padding: '1.5rem', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '1rem',
      border: `1px solid ${positive ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          background: positive ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)',
          color: positive ? '#00ff88' : '#ef4444',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
        }}>
          {change}
        </span>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: positive ? '#00ff88' : '#ef4444' }}>
        {value}
      </div>
    </div>
  )
}
