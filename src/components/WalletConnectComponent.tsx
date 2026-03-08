'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BrowserProvider, formatEther } from 'ethers'
import toast from 'react-hot-toast'

export default function WalletConnectComponent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [connecting, setConnecting] = useState(false)

  // 从 URL 参数获取钱包地址
  useEffect(() => {
    const wallet = searchParams.get('wallet')
    if (wallet) {
      setAddress(wallet)
      localStorage.setItem('wallet_address', wallet)
      updateBalance(wallet)
    } else {
      // 没有 URL 参数，从 localStorage 读取
      const saved = localStorage.getItem('wallet_address')
      if (saved) {
        setAddress(saved)
        updateBalance(saved)
      }
    }
  }, [searchParams])

  const updateBalance = async (addr: string) => {
    try {
      const ethereum = (window as any).ethereum
      if (ethereum) {
        const provider = new BrowserProvider(ethereum)
        const bal = await provider.getBalance(addr)
        setBalance(formatEther(bal))
      }
    } catch (e) {
      console.error('更新余额失败:', e)
    }
  }

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      toast.error('请安装 MetaMask 或 OKX Wallet')
      return
    }

    setConnecting(true)
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      const provider = new BrowserProvider(ethereum)
      const bal = await provider.getBalance(addr)

      // 更新 URL 参数（这样刷新后还在）
      const url = new URL(window.location.href)
      url.searchParams.set('wallet', addr)
      router.push(url.toString())
      
      localStorage.setItem('wallet_address', addr)
      toast.success('连接成功')
    } catch (err: any) {
      toast.error(err.message || '连接失败')
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setBalance('0')
    localStorage.removeItem('wallet_address')
    
    // 清除 URL 参数
    const url = new URL(window.location.href)
    url.searchParams.delete('wallet')
    router.push(url.toString())
    
    toast('已断开')
  }

  const formatAddress = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`

  return (
    <>
      {address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00ff88' }}>{formatAddress(address)}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
          </div>
          <button onClick={disconnectWallet} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>断开</button>
        </div>
      ) : (
        <button onClick={connectWallet} disabled={connecting} style={{ padding: '0.75rem 1.5rem', background: connecting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00ff88, #00d4ff)', color: connecting ? '#6b7280' : '#000', border: 'none', borderRadius: '0.75rem', cursor: connecting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          {connecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </>
  )
}
