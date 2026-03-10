'use client'

import { useWallet, SUPPORTED_CHAINS } from '@/hooks/useWallet'
import toast, { Toaster } from 'react-hot-toast'

export function WalletConnect() {
  const { connect, disconnect, address, connected, connecting, detectWallet, getBalance, chainId, switchChain, balance } = useWallet()

  const handleConnect = async () => {
    const walletType = detectWallet()

    if (!walletType) {
      toast.error('请先安装 OKX Wallet 或 MetaMask')
      window.open('https://www.okx.com/download', '_blank')
      return
    }

    try {
      await connect()
      toast.success('钱包连接成功！')

      // 获取余额
      setTimeout(() => getBalance(), 1000)
    } catch (error: any) {
      toast.error(error.message || '连接失败')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast('已断开连接')
  }

  const handleSwitchChain = async (newChainId: string) => {
    try {
      await switchChain(newChainId)
      const chain = SUPPORTED_CHAINS.find(c => c.chainId === newChainId)
      toast.success(`已切换到 ${chain?.name || '链'}`)
    } catch (error: any) {
      toast.error(error.message || '切换失败')
    }
  }

  // 格式化地址
  const formatAddress = (addr: string | null) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 获取当前链名称
  const getChainName = (id: string | null) => {
    if (!id) return ''
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === id)
    return chain?.name || `Chain ${id}`
  }

  // 获取当前链的代币符号
  const getChainSymbol = (id: string | null) => {
    if (!id) return 'ETH'
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === id)
    return chain?.symbol || 'ETH'
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(18, 18, 26, 0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#000',
            },
          },
        }}
      />

      {connected && address ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {/* 链选择器 */}
          <div style={{ position: 'relative' }}>
            <select
              value={chainId || ''}
              onChange={(e) => handleSwitchChain(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#9ca3af',
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                appearance: 'none',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {SUPPORTED_CHAINS.map(chain => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#9ca3af',
              }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>

          {/* 钱包地址和余额显示 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f8fafc',
            }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: '#00ff88',
                display: 'inline-block',
              }}/>
              {formatAddress(address)}
            </div>

            {/* 余额显示 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#00ff88',
              padding: '0.25rem 0.5rem',
              background: 'rgba(0,255,136,0.1)',
              borderRadius: '0.375rem',
            }}>
              {balance || '0.0000'} {getChainSymbol(chainId)}
            </div>

            {/* 断开按钮 */}
            <button
              onClick={handleDisconnect}
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#ef4444',
                fontWeight: 600,
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.5rem',
                padding: '0.375rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              }}
            >
              断开
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            background: connecting ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            color: connecting ? '#6b7280' : '#f8fafc',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1.5rem',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!connecting) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = connecting ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        >
          {connecting ? (
            <>
              <span style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: '#00ff88',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}/>
              连接中...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              连接钱包
            </>
          )}
        </button>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
