'use client'

import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const savedWallet = localStorage.getItem('wallet_address')
        
        if (!savedWallet) {
          // 未连接钱包
          setAgents([])
          setLoading(false)
          return
        }

        // 获取该钱包的 Agent
        const res = await fetch(`/api/user?wallet=${savedWallet}`)
        const data = await res.json()
        
        if (data.success) {
          setAgents(data.data.agents || [])
        }
      } catch (error) {
        console.error('获取 Agent 失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const toggleAgent = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running'
    
    try {
      // 乐观更新
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ))
      
      // 调用 API
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          status: newStatus,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message || '操作成功')
      } else {
        toast.error(data.error || '操作失败')
        // 回滚
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { ...agent, status: currentStatus } : agent
        ))
      }
    } catch (error: any) {
      toast.error('操作失败')
      console.error(error)
    }
  }

  const editAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) {
      const encodedData = encodeURIComponent(JSON.stringify(agent))
      window.location.href = `/agents/edit?data=${encodedData}`
    }
  }

  const runningCount = agents.filter(a => a.status === 'running').length
  const stoppedCount = agents.filter(a => a.status === 'stopped').length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af' }}>加载 Agent 列表...</p>
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
              <span style={{ fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Agent Hunter</span>
            </a>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>← 返回主页</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            我的 Agent
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
            共 {agents.length} 个 Agent · {runningCount} 个运行中 · {stoppedCount} 个已停止
          </p>
        </div>

        {/* Agent 列表 */}
        {agents.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      background: agent.status === 'running' ? '#00ff88' : '#6b7280',
                      display: 'inline-block',
                      boxShadow: agent.status === 'running' ? '0 0 10px #00ff88' : 'none',
                      animation: agent.status === 'running' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }}/>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{agent.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                        状态：{agent.status === 'running' ? '🟢 运行中' : '⚪ 已停止'}
                        {agent.last_run_at && ` · 最后运行：${new Date(agent.last_run_at).toLocaleString('zh-CN')}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>胜率</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981' }}>{(agent.win_rate ?? 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>收益</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: (agent.total_pnl ?? 0) >= 0 ? '#00ff88' : '#ef4444' }}>
                          {(agent.total_pnl ?? 0) >= 0 ? '+' : ''}${(agent.total_pnl ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>交易</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>{agent.total_trades || 0}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => editAgent(agent.id)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          padding: '0.5rem',
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
                          padding: '0.5rem 1rem',
                          fontWeight: 600,
                          color: agent.status === 'running' ? '#ef4444' : '#10b981',
                        }}
                        title={agent.status === 'running' ? '停止 Agent' : '启动 Agent'}
                      >
                        {agent.status === 'running' ? '⏹️ 停止' : '▶️ 启动'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            minHeight: '400px',
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
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: 'scale(1.1)'; }
        }
      `}</style>
    </div>
  )
}
