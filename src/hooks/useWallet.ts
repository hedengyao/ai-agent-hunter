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
      isSolana?: boolean
      connect?: () => Promise<{ publicKey: { toString: () => string } }>
    }
    solana?: {
      isPhantom?: boolean
      isSolflare?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      connect?: () => Promise<{ publicKey: { toString: () => string } }>
      on?: (event: string, callback: (...args: any[]) => void) => void
      removeListener?: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

// OKX 支持的公链列表
export const SUPPORTED_CHAINS = [
  { chainId: '1', name: 'Ethereum', symbol: 'ETH' },
  { chainId: '196', name: 'X Layer', symbol: 'OKB' },
  { chainId: '501', name: 'Solana', symbol: 'SOL' },
  { chainId: '56', name: 'BNB Chain', symbol: 'BNB' },
  { chainId: '8453', name: 'Base', symbol: 'ETH' },
  { chainId: '42161', name: 'Arbitrum', symbol: 'ETH' },
  { chainId: '137', name: 'Polygon', symbol: 'MATIC' },
  { chainId: '10', name: 'Optimism', symbol: 'ETH' },
  { chainId: '59144', name: 'Linea', symbol: 'ETH' },
  { chainId: '324', name: 'zkSync', symbol: 'ETH' },
  { chainId: '43114', name: 'Avalanche', symbol: 'AVAX' },
]

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
    console.log('账户变化:', accounts)
    
    if (accounts.length === 0) {
      // 用户断开连接，但不清除 localStorage（允许自动重连）
      setWallet(prev => {
        console.log('账户断开，当前链:', prev.chainId)
        return {
          ...prev,
          address: null,
          chainId: null,
          balance: null,
          connected: false,
        }
      })
    } else {
      // 使用函数式更新，检查当前链状态
      setWallet(prev => {
        // 如果当前在 Solana 链，忽略 EVM 账户变化事件
        if (prev.chainId === '501') {
          console.log('当前在 Solana 链，忽略 EVM 账户变化事件')
          return prev
        }
        
        console.log('更新 EVM 账户地址:', accounts[0])
        localStorage.setItem('wallet_address', accounts[0])
        return {
          ...prev,
          address: accounts[0],
          connected: true,
        }
      })
    }
  }, [])

  // 获取当前链的余额（支持切换链时更新）
  const getChainBalance = useCallback(async (address: string, chainId: string) => {
    try {
      const provider = detectWallet() === 'okx' ? window.okxwallet : window.ethereum
      if (!provider) return '0'

      const balance = await provider?.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })

      const ethBalance = parseInt(balance, 16) / 1e18
      return ethBalance.toFixed(4)
    } catch (error) {
      console.error('获取余额失败:', error)
      return '0'
    }
  }, [detectWallet])

  // 链变化处理
  const handleChainChanged = useCallback((chainId: string) => {
    console.log('链切换事件:', chainId)
    
    // 判断是 EVM 链还是 Solana 链
    let decimalChainId: string
    
    if (chainId === '501' || chainId === 'solana' || chainId === 'mainnet-beta') {
      // Solana 链
      decimalChainId = '501'
    } else {
      // EVM 链（十六进制格式）
      try {
        decimalChainId = parseInt(chainId, 16).toString()
      } catch (e) {
        console.error('解析链 ID 失败:', chainId, e)
        decimalChainId = chainId
      }
    }
    
    // 使用函数式更新，检查当前链状态
    setWallet(prev => {
      console.log('链切换：目标链=', decimalChainId, '当前链=', prev.chainId)
      
      // 如果已经在目标链，不更新
      if (prev.chainId === decimalChainId) {
        return prev
      }
      
      // Solana 链不获取 ETH 余额
      if (decimalChainId === '501') {
        console.log('切换到 Solana 链')
        return { ...prev, chainId: decimalChainId, balance: '0' }
      }
      
      // EVM 链切换，延迟获取余额
      setTimeout(() => {
        const savedAddress = localStorage.getItem('wallet_address') || prev.address
        if (savedAddress) {
          getChainBalance(savedAddress, decimalChainId).then(balance => {
            setWallet(p => ({ ...p, balance }))
          })
        }
      }, 300)
      
      return { ...prev, chainId: decimalChainId }
    })
  }, [getChainBalance])

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
    const provider = window.okxwallet || window.ethereum
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
    }
    
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [handleAccountsChanged, handleChainChanged])

  // 切换链 - 支持 EVM 和非 EVM 链（如 Solana）
  const switchChain = async (chainId: string) => {
    const walletType = detectWallet()
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === chainId)

    if (!walletType) {
      throw new Error('请先连接钱包')
    }

    // ==================== Solana 链切换 ====================
    if (chainId === '501') {
      try {
        // 检查是否有 Solana 钱包支持
        const hasSolanaSupport = !!(window.okxwallet || window.solana)

        if (!hasSolanaSupport) {
          throw new Error('当前钱包不支持 Solana 链，请使用 OKX Wallet 或 Phantom')
        }

        // 获取 Solana provider - 优先使用 Phantom/Solflare，其次 OKX Wallet
        const solanaProvider = window.solana || window.okxwallet

        if (!solanaProvider) {
          throw new Error('未找到 Solana 钱包')
        }

        // 使用 connect() 方法连接 Solana 钱包（OKX Wallet 标准）
        const resp = await solanaProvider.connect()

        if (!resp || !resp.publicKey) {
          throw new Error('连接 Solana 钱包失败')
        }

        // 获取 Solana 地址（publicKey 是对象，需要 toString）
        const solanaAddress = resp.publicKey.toString()

        // 更新 UI 状态为 Solana 链
        setWallet(prev => ({
          ...prev,
          chainId: '501',
          address: solanaAddress,
          balance: '0'
        }))

        console.log('Solana 链切换成功，地址:', solanaAddress)
        return
      } catch (error: any) {
        console.error('Solana 切换失败:', error)

        // 如果是用户拒绝，给出友好提示
        if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('rejected')) {
          throw new Error('您拒绝了 Solana 连接请求')
        }

        // 如果是方法不支持，尝试备用方案
        if (error.message?.includes('connect is not a function') || error.message?.includes('Unsupported')) {
          // 尝试使用 request 方法
          try {
            const resp2 = await solanaProvider.request({ method: 'requestAccounts' })
            if (resp2 && resp2.length > 0) {
              setWallet(prev => ({
                ...prev,
                chainId: '501',
                address: resp2[0],
                balance: '0'
              }))
              console.log('Solana 链切换成功（备用方案），地址:', resp2[0])
              return
            }
          } catch (e2: any) {
            console.error('备用方案也失败:', e2)
          }
          throw new Error('当前钱包不支持 Solana 切换，请使用 Phantom 或 Solflare 钱包')
        }

        throw new Error('Solana 链切换失败：' + (error.message || '未知错误'))
      }
    }

    // ==================== EVM 链切换 ====================
    const provider = walletType === 'okx' ? window.okxwallet : window.ethereum
    if (!provider) {
      throw new Error('请先连接 OKX Wallet 或 MetaMask')
    }

    const hexChainId = `0x${parseInt(chainId).toString(16)}`
    const currentChainId = wallet.chainId

    try {
      // 如果已经是目标链，不需要切换
      if (currentChainId === chainId) {
        console.log('已在目标链上，无需切换')
        return
      }

      // 使用 wallet_switchEthereumChain 切换链
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      })

      // 等待链切换事件触发，由 handleChainChanged 更新状态
      console.log('链切换请求已发送，等待确认...')
    } catch (error: any) {
      // 错误码 4902 表示链未添加，需要添加链
      if (error.code === 4902 || error.code === -32603) {
        console.log('链未添加，尝试添加新链')
        throw new Error(`目标链 (${chain?.name}) 尚未添加到钱包，请先在钱包中添加该网络`)
      }

      // 用户取消切换
      if (error.code === 4001) {
        throw new Error('您取消了链切换操作')
      }

      // 其他错误，抛出异常让 UI 处理
      console.error('切换链失败:', error)
      throw new Error('切换链失败：' + (error.message || '未知错误'))
    }
  }

  return {
    ...wallet,
    connect,
    disconnect,
    getBalance,
    getChainBalance,
    detectWallet,
    switchChain,
  }
}
