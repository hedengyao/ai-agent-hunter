'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  // 初始化时检查连接
  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    const savedAddress = localStorage.getItem('wallet_address')
    if (!savedAddress) {
      setIsLoading(false)
      return
    }

    // 检查 MetaMask 是否已安装并授权
    const ethereum = (window as any).ethereum
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
          // 钱包仍然连接
          setAddress(savedAddress)
          const provider = new BrowserProvider(ethereum)
          const bal = await provider.getBalance(savedAddress)
          setBalance(formatEther(bal))
        } else {
          // 钱包已断开，清除保存
          localStorage.removeItem('wallet_address')
        }
      } catch (error) {
        console.error('检查连接失败:', error)
        localStorage.removeItem('wallet_address')
      }
    }
    setIsLoading(false)
  }

  const connect = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      throw new Error('请安装 MetaMask 或 OKX Wallet')
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    const addr = accounts[0]
    const provider = new BrowserProvider(ethereum)
    const balance = await provider.getBalance(addr)

    setAddress(addr)
    setBalance(formatEther(balance))
    localStorage.setItem('wallet_address', addr)

    // 监听账户变化
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
        localStorage.setItem('wallet_address', accounts[0])
      }
    })
  }

  const disconnect = () => {
    setAddress(null)
    setBalance('0')
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
