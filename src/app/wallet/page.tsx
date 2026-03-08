'use client'

import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useWallet } from '@/hooks/useWallet'

export default function WalletPage() {
  const { address, balance, connected, connect } = useWallet()
  const [agentBalance, setAgentBalance] = useState(1250.50)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [depositing, setDepositing] = useState(false)

  const transactions = [
    { id: '1', type: 'deposit', amount: 500, token: 'USDC', time: '2026-03-07 10:00', status: 'completed' },
    { id: '2', type: 'gas', amount: 12.5, token: 'ETH', time: '2026-03-07 09:30', status: 'completed' },
    { id: '3', type: 'trade', amount: 100, token: 'USDC', time: '2026-03-07 08:45', status: 'completed' },
    { id: '4', type: 'withdraw', amount: 200, token: 'USDC', time: '2026-03-06 15:20', status: 'completed' },
  ]

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('请输入有效金额')
      return
    }

    setDepositing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAgentBalance(prev => prev + parseFloat(depositAmount))
    setDepositing(false)
    setDepositAmount('')
    toast.success(`充值 ${depositAmount} USDC 成功！`)
  }

  const handleWithdraw = async () => {
    if (!connected) {
      toast.error('请先连接钱包')
      return
    }

    setWithdrawing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('提现已处理，请稍后查看钱包')
    setWithdrawing(false)
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
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>钱包管理</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Agent 资金与 Gas 管理</p>
        </div>

        {/* 钱包概览 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Agent 钱包余额</p>
              <p style={{ fontSize: '3rem', fontWeight: 700, margin: '0.5rem 0 0 0', background: 'linear-gradient(135deg, #00ff88, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ${agentBalance.toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>连接状态</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  background: connected ? '#00ff88' : '#6b7280',
                  animation: connected ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}/>
                <span style={{ fontSize: '0.875rem', color: connected ? '#00ff88' : '#6b7280' }}>
                  {connected ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
          </div>

          {!connected && (
            <button
              onClick={connect}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              连接钱包
            </button>
          )}

          {/* 充值/提现 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>
                充值金额 (USDC)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                  style={{
                    padding: '1rem 1.5rem',
                    background: depositing || !depositAmount ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    color: depositing || !depositAmount ? '#6b7280' : '#000',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: depositing || !depositAmount ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {depositing ? '充值中...' : '充值'}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}>
                提现金额 (USDC)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !connected}
                  style={{
                    padding: '1rem 1.5rem',
                    background: withdrawing || !connected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                    color: withdrawing || !connected ? '#6b7280' : '#f8fafc',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.75rem',
                    cursor: withdrawing || !connected ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {withdrawing ? '提现中...' : '提现'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 交易历史 */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>交易历史</h2>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}>
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: i !== transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: tx.type === 'deposit' ? 'rgba(16,185,129,0.2)' : tx.type === 'withdraw' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}>
                    {tx.type === 'deposit' ? '↓' : tx.type === 'withdraw' ? '↑' : '⇄'}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0 }}>{tx.type === 'deposit' ? '充值' : tx.type === 'withdraw' ? '提现' : tx.type === 'gas' ? 'Gas 费' : '交易'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{tx.time}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, margin: 0, color: tx.type === 'deposit' || tx.type === 'trade' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'deposit' || tx.type === 'withdraw' ? '+' : '-'}{tx.amount} {tx.token}
                  </p>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(16,185,129,0.2)',
                    color: '#10b981',
                    borderRadius: '0.25rem',
                  }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
