'use client'

import { useWallet } from '@/lib/WalletContext'
import toast from 'react-hot-toast'

export default function WalletConnectComponent() {
  const { address, balance, isConnected, connect, disconnect, isLoading } = useWallet()

  const formatAddress = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`

  const handleConnect = async () => {
    try {
      await connect()
      toast.success('连接成功')
    } catch (err: any) {
      toast.error(err.message || '连接失败')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast('已断开')
  }

  return (
    <>
      {isConnected && address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(0,255,136,0.1)',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#00ff88',
              borderRadius: '50%'
            }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00ff88' }}>{formatAddress(address)}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            断开
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            background: isLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: isLoading ? '#6b7280' : '#000',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          {isLoading ? '连接中...' : '连接钱包'}
        </button>
      )}
    </>
  )
}
