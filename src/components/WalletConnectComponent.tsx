'use client'

import { useState, useEffect } from 'react'
import { BrowserProvider, formatEther } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'

export default function WalletConnectComponent() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [connecting, setConnecting] = useState(false)
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const ethereum = (window as any).ethereum
    if (typeof window !== 'undefined' && ethereum) {
      try {
        const provider = new BrowserProvider(ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const addr = accounts[0].address
          const bal = await provider.getBalance(addr)
          setAddress(addr)
          setBalance(formatEther(bal))
          setProvider(provider)
        }
      } catch (error) {
        console.error('检查连接失败:', error)
      }
    }
  }

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      toast.error('请先安装 MetaMask 或 OKX Wallet！')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setConnecting(true)
    try {
      const provider = new BrowserProvider(ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const addr = accounts[0].address
      const bal = await provider.getBalance(addr)
      
      setAddress(addr)
      setBalance(formatEther(bal))
      setProvider(provider)
      
      toast.success('钱包连接成功！')
    } catch (error: any) {
      toast.error(error.message || '连接失败')
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setBalance('0')
    setProvider(null)
    toast('钱包已断开')
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <>
      <Toaster position="top-right" />
      
      {address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: 'rgba(0,255,136,0.1)', 
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00ff88' }}>{formatAddress(address)}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            断开
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          style={{
            padding: '0.75rem 1.5rem',
            background: connecting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
            color: connecting ? '#6b7280' : '#000',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: connecting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {connecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </>
  )
}
