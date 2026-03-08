/**
 * 钱包连接 Hook
 * 支持 OKX Wallet 和 MetaMask
 * 带持久化连接功能
 */

import { useState, useEffect, useCallback } from 'react'

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
    connecting: true, // 初始为 true，等待检查完成
    error: null,
  })

  // 检测钱包
  const detectWallet = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (window.okxwallet?.isOkxWallet) return 'okx'
    if (window.ethereum?.isMetaMask) return 'metamask'
    if (window.ethereum) return 'metamask'
    return null
  }, [])

  // 账户变化处理
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // 用户断开连接，但不清除 localStorage（允许自动重连）
      setWallet(prev => ({
        ...prev,
        address: null,
        chainId: null,
        balance: null,
        connected: false,
      }))
    } else {
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
        connected: true,
      }))
      localStorage.setItem('wallet_address', accounts[0])
    }
  }, [])

  // 链变化处理
  const handleChainChanged = useCallback((chainId: string) => {
    console.log('链切换:', chainId)
    window.location.reload()
  }, [])

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
          balance: null,
          connected: true,
          connecting: false,
          error: null,
        })

        // 保存到 localStorage
        localStorage.setItem('wallet_address', accounts[0])

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
    // 用户主动断开时才清除 localStorage
    localStorage.removeItem('wallet_address')
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

  // 初始化时检查已有连接
  useEffect(() => {
    async function checkExistingConnection() {
      const savedAddress = localStorage.getItem('wallet_address')
      const walletType = detectWallet()

      // 没有保存的地址或没有钱包，停止
      if (!savedAddress || !walletType) {
        setWallet(prev => ({ ...prev, connecting: false }))
        return
      }

      const provider = walletType === 'okx' ? window.okxwallet : window.ethereum
      if (!provider) {
        setWallet(prev => ({ ...prev, connecting: false }))
        return
      }

      try {
        // 静默检查是否已授权
        const accounts = await provider.request({ method: 'eth_accounts' })
        
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
          // 钱包仍然连接
          const chainId = await provider.request({ method: 'eth_chainId' })
          setWallet({
            address: accounts[0],
            chainId: chainId || null,
            balance: null,
            connected: true,
            connecting: false,
            error: null,
          })

          // 注册监听器
          provider.on('accountsChanged', handleAccountsChanged)
          provider.on('chainChanged', handleChainChanged)
        } else if (accounts.length === 0) {
          // 钱包未解锁，保留 localStorage 等待用户连接
          console.log('钱包已安装但未解锁，等待用户连接')
          setWallet(prev => ({ ...prev, connecting: false }))
        } else {
          // 地址不匹配，更新
          localStorage.setItem('wallet_address', accounts[0])
          const chainId = await provider.request({ method: 'eth_chainId' })
          setWallet({
            address: accounts[0],
            chainId: chainId || null,
            balance: null,
            connected: true,
            connecting: false,
            error: null,
          })
        }
      } catch (error: any) {
        // 钱包被锁定或错误，保留 localStorage
        console.log('检查连接失败:', error.message)
        setWallet(prev => ({ ...prev, connecting: false }))
      }
    }

    checkExistingConnection()
  }, [detectWallet, handleAccountsChanged, handleChainChanged])

  // 组件卸载时清理监听
  useEffect(() => {
    return () => {
      const provider = window.okxwallet || window.ethereum
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [handleAccountsChanged, handleChainChanged])

  return {
    ...wallet,
    connect,
    disconnect,
    getBalance,
    detectWallet,
  }
}
