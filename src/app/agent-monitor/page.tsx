'use client'

import { useState, useEffect } from 'react'

export default function AgentMonitorPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [tasks, setTasks] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/agent-monitor')
      const data = await res.json()
      if (data.success) {
        setIsRunning(data.data.isRunning)
        setTasks(data.data.tasks)
      }
    } catch (error) {
      console.error('获取状态失败:', error)
    }
  }

  const startMonitoring = async () => {
    setLoading(true)
    try {
      await fetch('/api/agent-monitor', { method: 'POST' })
      await fetchStatus()
    } catch (error) {
      console.error('启动失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const stopMonitoring = async () => {
    setLoading(true)
    try {
      await fetch('/api/agent-monitor', { method: 'DELETE' })
      await fetchStatus()
    } catch (error) {
      console.error('停止失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // 5 秒刷新一次
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🤖 Agent 监控中心</h1>

      {/* 控制区域 */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>监控状态</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                background: isRunning ? '#00ff88' : '#ef4444', 
                borderRadius: '50%',
                animation: isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontSize: '1.125rem', color: isRunning ? '#00ff88' : '#ef4444' }}>
                {isRunning ? '运行中' : '已停止'}
              </span>
            </div>
            <button
              onClick={isRunning ? stopMonitoring : startMonitoring}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? 'rgba(255,255,255,0.1)' : isRunning ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                color: loading ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {loading ? '操作中...' : isRunning ? '停止监控' : '启动监控'}
            </button>
          </div>
        </div>

        <p style={{ color: '#9ca3af' }}>
          监控系统每 60 秒自动检查一次信号，执行交易决策和止盈止损检查。
        </p>
      </div>

      {/* 任务列表 */}
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Agent 任务状态</h2>
        
        {Object.keys(tasks).length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
            暂无运行中的任务
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(tasks).map(([agentId, task]: [string, any]) => (
              <div key={agentId} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '0.5rem',
                border: `1px solid ${task.isRunning ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Agent: {agentId}</div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      上次运行：{task.lastRun ? new Date(task.lastRun).toLocaleString('zh-CN') : '从未'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      下次运行：{task.nextRun ? new Date(task.nextRun).toLocaleString('zh-CN') : '待安排'}
                    </div>
                  </div>
                  <div>
                    {task.isRunning ? (
                      <span style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(0,255,136,0.2)',
                        color: '#00ff88',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}>运行中</span>
                    ) : (
                      <span style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#9ca3af',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}>空闲</span>
                    )}
                  </div>
                </div>
                {task.error && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    错误：{task.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
