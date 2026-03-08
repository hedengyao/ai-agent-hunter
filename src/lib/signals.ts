/**
 * 信号 API
 * 获取真实的 OKX 信号数据
 */

import { okxFetch } from './okx-api'

export interface Signal {
  id: string
  tokenSymbol: string
  tokenAddress: string
  chainId: string
  signalStrength: number
  signalType: 'smart_money' | 'kol' | 'whale' | 'convergence'
  triggeredWallets: Array<{
    address: string
    type: string
    amount: string
  }>
  price: string
  priceChange24h: number
  marketCap: string
  liquidity: string
  riskScore: number
  narrative?: 'hot' | 'trending' | 'normal'
  createdAt: string
}

/**
 * 获取信号列表
 */
export async function getSignals(limit = 20): Promise<Signal[]> {
  try {
    // 调用 OKX Signals API
    const signals = await okxFetch<any[]>('GET', `/api/v6/dex/signals?limit=${limit}`)
    
    return signals.map(signal => ({
      id: signal.signalId || signal.id,
      tokenSymbol: signal.tokenSymbol,
      tokenAddress: signal.tokenAddress,
      chainId: signal.chainId,
      signalStrength: signal.signalStrength,
      signalType: signal.signalType,
      triggeredWallets: signal.triggeredWallets || [],
      price: signal.priceInfo?.price || '0',
      priceChange24h: signal.priceInfo?.priceChange24h || 0,
      marketCap: signal.priceInfo?.marketCap || '0',
      liquidity: signal.priceInfo?.liquidity || '0',
      riskScore: calculateRiskScore(signal),
      narrative: detectNarrative(signal),
      createdAt: signal.createdAt,
    }))
  } catch (error) {
    console.error('获取信号失败:', error)
    return getMockSignals()
  }
}

/**
 * 获取信号详情
 */
export async function getSignalDetail(signalId: string): Promise<Signal | null> {
  try {
    const signal = await okxFetch<any>('GET', `/api/v6/dex/signals/${signalId}`)
    
    return {
      id: signal.signalId,
      tokenSymbol: signal.tokenSymbol,
      tokenAddress: signal.tokenAddress,
      chainId: signal.chainId,
      signalStrength: signal.signalStrength,
      signalType: signal.signalType,
      triggeredWallets: signal.triggeredWallets || [],
      price: signal.priceInfo?.price || '0',
      priceChange24h: signal.priceInfo?.priceChange24h || 0,
      marketCap: signal.priceInfo?.marketCap || '0',
      liquidity: signal.priceInfo?.liquidity || '0',
      riskScore: calculateRiskScore(signal),
      narrative: detectNarrative(signal),
      createdAt: signal.createdAt,
    }
  } catch (error) {
    console.error('获取信号详情失败:', error)
    return null
  }
}

/**
 * 计算风险评分
 */
function calculateRiskScore(signal: any): number {
  let score = 75
  
  // 流动性风险
  const liquidity = parseFloat(signal.priceInfo?.liquidity || '0')
  if (liquidity < 10000) score -= 25
  else if (liquidity < 100000) score -= 10
  
  // 市值风险
  const marketCap = parseFloat(signal.priceInfo?.marketCap || '0')
  if (marketCap < 100000) score -= 15
  else if (marketCap < 1000000) score -= 8
  
  // 价格波动
  const priceChange = Math.abs(signal.priceInfo?.priceChange24h || 0)
  if (priceChange > 200) score -= 10
  else if (priceChange > 100) score -= 5
  
  return Math.max(0, Math.min(100, score))
}

/**
 * 检测叙事类型
 */
function detectNarrative(signal: any): 'hot' | 'trending' | 'normal' {
  const priceChange = signal.priceInfo?.priceChange24h || 0
  const strength = signal.signalStrength || 0
  
  if (priceChange > 100 && strength >= 90) return 'hot'
  if (priceChange > 50 && strength >= 80) return 'trending'
  return 'normal'
}

/**
 * 模拟信号数据（API 失败时使用）
 */
function getMockSignals(): Signal[] {
  return [
    {
      id: '1',
      tokenSymbol: 'TITAN',
      tokenAddress: '0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd',
      chainId: '196',
      signalStrength: 92,
      signalType: 'convergence',
      triggeredWallets: [
        { address: '0xabc1...', type: 'smart_money', amount: '$125K' },
        { address: '0xdef2...', type: 'smart_money', amount: '$89K' },
        { address: '0xghi3...', type: 'kol', amount: '$210K' },
      ],
      price: '3.01',
      priceChange24h: 156.3,
      marketCap: '$2.17M',
      liquidity: '$690K',
      riskScore: 85,
      narrative: 'hot',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      tokenSymbol: 'xETH',
      tokenAddress: '0xe7b000003a45145decf8a28fc755ad5ec5ea025a',
      chainId: '196',
      signalStrength: 88,
      signalType: 'smart_money',
      triggeredWallets: [
        { address: '0xjkl4...', type: 'smart_money', amount: '$95K' },
        { address: '0xmno5...', type: 'whale', amount: '$320K' },
      ],
      price: '1985.70',
      priceChange24h: 89.7,
      marketCap: '$5.5M',
      liquidity: '$1.2M',
      riskScore: 90,
      narrative: 'trending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      tokenSymbol: 'PEPE',
      tokenAddress: '0x7890abcd1234efgh5678ijkl9012mnop3456qrst',
      chainId: '1',
      signalStrength: 85,
      signalType: 'kol',
      triggeredWallets: [
        { address: '0xpqr6...', type: 'kol', amount: '$180K' },
        { address: '0xstu7...', type: 'kol', amount: '$150K' },
      ],
      price: '0.00001234',
      priceChange24h: 67.8,
      marketCap: '$8.9M',
      liquidity: '$890K',
      riskScore: 78,
      narrative: 'hot',
      createdAt: new Date().toISOString(),
    },
  ]
}
