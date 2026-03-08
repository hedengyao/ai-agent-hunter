/**
 * 钱包连接 Hook
 * 支持 OKX Wallet 和 MetaMask
 */

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
    okxwallet?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isOkxWallet?: boolean
    }
  }
}

export interface WalletState {
  address: string | null
  chainId: string | null
  balance: string | null
  connected: boolean
  connecting: boolean
  error: string | null
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: null,
    connected: false,
    connecting: false,
    error: null,
  })

  // 检测钱包
  const detectWallet = () => {
    if (window.okxwallet?.isOkxWallet) return 'okx'
    if (window.ethereum?.isMetaMask) return 'metamask'
    if (window.ethereum) return 'metamask'
    return null
  }

  // 连接钱包
  const connect = async () => {
    setWallet(prev => ({ ...prev, connecting: true, error: null }))

    try {
      const walletType = detectWallet()
      
      if (!walletType) {
        throw new Error('请先安装 OKX Wallet 或 MetaMask')
      }

      const provider = walletType === 'okx' ? window.okxwallet : window.ethereum
      const accounts = await provider?.request({
        method: 'eth_requestAccounts'
      })

      if (accounts && accounts.length > 0) {
        const chainId = await provider?.request({
          method: 'eth_chainId'
        })

        setWallet({
          address: accounts[0],
          chainId: chainId || null,
          balance: null, // 后续获取
          connected: true,
          connecting: false,
          error: null,
        })

        // 监听账户变化
        provider?.on('accountsChanged', handleAccountsChanged)
        provider?.on('chainChanged', handleChainChanged)
      }
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        connecting: false,
        error: error.message || '连接失败',
      }))
    }
  }

  // 断开连接
  const disconnect = () => {
    setWallet({
      address: null,
      chainId: null,
      balance: null,
      connected: false,
      connecting: false,
      error: null,
    })
  }

  // 账户变化处理
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else if (accounts[0] !== wallet.address) {
      setWallet(prev => ({ ...prev, address: accounts[0] }))
    }
  }

  // 链变化处理
  const handleChainChanged = (chainId: string) => {
    setWallet(prev => ({ ...prev, chainId }))
    window.location.reload()
  }

  // 获取余额
  const getBalance = async () => {
    if (!wallet.address) return
    
    try {
      const provider = detectWallet() === 'okx' ? window.okxwallet : window.ethereum
      const balance = await provider?.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest']
      })
      
      // 转换余额（Wei 到 ETH）
      const ethBalance = parseInt(balance, 16) / 1e18
      setWallet(prev => ({ ...prev, balance: ethBalance.toFixed(4) }))
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }

  // 组件卸载时清理监听
  useEffect(() => {
    return () => {
      const provider = window.okxwallet || window.ethereum
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return {
    ...wallet,
    connect,
    disconnect,
    getBalance,
    detectWallet,
  }
}
