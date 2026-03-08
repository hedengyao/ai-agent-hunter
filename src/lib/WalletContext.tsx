'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { BrowserProvider, formatEther } from 'ethers'

interface WalletContextType {
  address: string | null
  balance: string
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  // 监听钱包事件的处理函数（使用 useCallback 避免重复创建）
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // 用户断开连接，但不清除 localStorage（允许自动重连）
      setAddress(null)
      setBalance('0')
    } else {
      const newAddress = accounts[0]
      setAddress(newAddress)
      localStorage.setItem('wallet_address', newAddress)
      // 更新余额
      const ethereum = (window as any).ethereum
      if (ethereum) {
        const provider = new BrowserProvider(ethereum)
        provider.getBalance(newAddress).then(bal => setBalance(formatEther(bal)))
      }
    }
  }, [])

  const handleChainChanged = useCallback((chainId: string) => {
    console.log('链切换:', chainId)
    // 链切换时刷新页面以确保状态同步
    window.location.reload()
  }, [])

  // 初始化时检查连接
  useEffect(() => {
    checkExistingConnection()
  }, [])

  // 页面加载时注册事件监听器
  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (ethereum) {
      // 添加事件监听
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)

      // 清理函数：组件卸载时移除监听
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [handleAccountsChanged, handleChainChanged])

  const checkExistingConnection = async () => {
    const savedAddress = localStorage.getItem('wallet_address')
    if (!savedAddress) {
      setIsLoading(false)
      return
    }

    // 检查 MetaMask 是否已安装
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      setIsLoading(false)
      return
    }

    try {
      // 先尝试静默获取已授权账户
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      
      if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        // 钱包仍然连接，加载余额
        setAddress(savedAddress)
        const provider = new BrowserProvider(ethereum)
        const bal = await provider.getBalance(savedAddress)
        setBalance(formatEther(bal))
      } else if (accounts.length === 0) {
        // 账户未授权，但用户之前连接过 - 尝试自动重连（不弹窗）
        // 保持 localStorage 中的地址，等待用户主动连接
        console.log('检测到钱包已安装但未授权，等待用户连接')
      } else {
        // 地址不匹配，更新为当前账户
        const newAddress = accounts[0]
        setAddress(newAddress)
        localStorage.setItem('wallet_address', newAddress)
        const provider = new BrowserProvider(ethereum)
        const bal = await provider.getBalance(newAddress)
        setBalance(formatEther(bal))
      }
    } catch (error: any) {
      // 用户拒绝或钱包被锁定，保留 localStorage 以便下次自动重连
      console.log('钱包未解锁或用户拒绝:', error.message)
    }
    
    setIsLoading(false)
  }

  const connect = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      throw new Error('请安装 MetaMask 或 OKX Wallet')
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      const provider = new BrowserProvider(ethereum)
      const balance = await provider.getBalance(addr)

      setAddress(addr)
      setBalance(formatEther(balance))
      localStorage.setItem('wallet_address', addr)
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error('您拒绝了连接请求')
      }
      throw err
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance('0')
    // 用户主动断开时才清除 localStorage
    localStorage.removeItem('wallet_address')
  }

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      isConnected: !!address,
      connect,
      disconnect,
      isLoading,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
