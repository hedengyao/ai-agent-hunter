/**
 * OKX OnchainOS API Client
 * 完整集成所有 OKX Skills (7+)
 * 
 * 专为 AI Agent 自动狩猎优化
 */

import crypto from 'crypto'

const BASE_URL = 'https://web3.okx.com'
const OKX_API_KEY = process.env.OKX_API_KEY || 'demo-key'
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY || 'demo-secret'
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE || 'demo-passphrase'

function generateSignature(timestamp: string, method: string, path: string, body = ''): string {
  const message = timestamp + method + path + body
  return crypto
    .createHmac('sha256', OKX_SECRET_KEY)
    .update(message)
    .digest('base64')
}

export async function okxFetch<T>(
  method: string,
  path: string,
  body: any = null,
  retryCount = 0
): Promise<T> {
  const timestamp = new Date().toISOString()
  const bodyStr = body ? JSON.stringify(body) : ''
  const signature = generateSignature(timestamp, method, path, bodyStr)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'OK-ACCESS-KEY': OKX_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-PASSPHRASE': OKX_PASSPHRASE,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'Content-Type': 'application/json',
      },
      body: bodyStr,
    })

    const result = await response.json()
    if (result.code === '50011' && retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      return okxFetch(method, path, body, retryCount + 1)
    }
    if (result.code !== '0') throw new Error(`API Error: ${result.code}`)
    return result.data as T
  } catch (error: any) {
    throw new Error(`OKX API: ${error.message}`)
  }
}

// ==================== okx-signals ====================

export interface Signal {
  signalId: string
  tokenAddress: string
  tokenSymbol: string
  chainId: string
  signalType: 'smart_money' | 'kol' | 'whale' | 'convergence'
  signalStrength: number
  triggeredWallets: Array<{ address: string; type: string; amount: string }>
  priceInfo: { price: string; priceChange24h: number; marketCap: string; liquidity: string }
  narrative?: 'hot' | 'trending' | 'normal'
  createdAt: string
}

export async function getSignals(limit = 20): Promise<Signal[]> {
  return okxFetch('GET', `/api/v6/dex/signals?limit=${limit}`)
}

export async function getSignalDetail(signalId: string): Promise<Signal> {
  return okxFetch('GET', `/api/v6/dex/signals/${signalId}`)
}

// ==================== okx-dex-swap ====================

export interface SwapQuote {
  fromToken: { symbol: string; decimals: string }
  toToken: { symbol: string; decimals: string }
  fromAmount: string
  toAmount: string
  priceImpact: string
  gasEstimate: { gasFee: string }
  routes: Array<{ dexName: string }>
}

export async function getSwapQuote(
  chainIndex: string,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage = 1
): Promise<SwapQuote> {
  const params = new URLSearchParams({
    chainIndex,
    fromTokenAddress: fromToken.toLowerCase(),
    toTokenAddress: toToken.toLowerCase(),
    amount,
    slippage: slippage.toString(),
  })
  return okxFetch('GET', `/api/v6/dex/aggregator/quote?${params}`)
}

export async function executeSwap(
  chainIndex: string,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string
): Promise<{ txHash: string; txData: string }> {
  return okxFetch('POST', '/api/v6/dex/aggregator/execute', {
    chainIndex,
    fromTokenAddress: fromToken.toLowerCase(),
    toTokenAddress: toToken.toLowerCase(),
    amount,
    userAddress,
  })
}

// ==================== okx-payment/x402 ====================

export interface PaymentIntent {
  id: string
  amount: string
  currency: string
  type: 'gas' | 'subscription' | 'signal'
  status: 'pending' | 'completed' | 'failed'
}

export async function createPaymentIntent(
  amount: string,
  currency: string,
  type: string,
  description: string
): Promise<PaymentIntent> {
  return okxFetch('POST', '/api/v6/payment/intent', { amount, currency, type, description })
}

export async function processPayment(
  intentId: string,
  payerAddress: string
): Promise<{ success: boolean; txHash?: string }> {
  return okxFetch('POST', '/api/v6/payment/process', { intentId, payerAddress })
}

// ==================== okx-wallet-portfolio ====================

export async function getWalletBalance(address: string, chainId: string): Promise<{
  balances: Array<{ symbol: string; balance: string; tokenPrice: string }>
  totalValue: string
}> {
  return okxFetch('GET', `/api/v6/dex/balance?address=${address}&chainId=${chainId}`)
}

// ==================== 工具函数 ====================

export function formatAmount(amount: string | number, decimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '$0'
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`
  return `$${num.toFixed(decimals)}`
}
