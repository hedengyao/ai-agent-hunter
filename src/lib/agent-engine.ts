/**
 * AI Agent 决策核心
 * 
 * 决策流程：监控 → 发现 → 分析 → 决策 → 执行 → 追踪
 */

import { getSignals, getSwapQuote, executeSwap, type Signal } from './okx-api'
import { analyzeToken } from './qwen-ai'

// Agent 策略配置
export interface AgentStrategy {
  id: string
  name: string
  minSignalStrength: number
  narrativeFilter: string[]
  maxPosition: number // 最大仓位 (%)
  takeProfit: number // 止盈 (%)
  stopLoss: number // 止损 (%)
  gasLimit: number // Gas 上限 (USD)
  autoExecute: boolean
  status: 'running' | 'stopped'
}

// Agent 决策结果
export interface AgentDecision {
  action: 'BUY' | 'SELL' | 'WATCH' | 'SKIP'
  confidence: number
  reason: string
  signal?: Signal
  analysis?: any
}

// Agent 状态
export interface AgentState {
  id: string
  strategy: AgentStrategy
  status: 'running' | 'stopped' | 'error'
  totalTrades: number
  winRate: number
  totalPnl: number
  lastActivity: string
}

/**
 * Agent 决策引擎
 */
export class AgentEngine {
  private strategy: AgentStrategy
  private state: AgentState

  constructor(strategy: AgentStrategy) {
    this.strategy = strategy
    this.state = {
      id: strategy.id,
      strategy,
      status: 'stopped',
      totalTrades: 0,
      winRate: 0,
      totalPnl: 0,
      lastActivity: new Date().toISOString(),
    }
  }

  /**
   * 启动 Agent
   */
  async start(): Promise<void> {
    this.state.status = 'running'
    console.log(`Agent ${this.strategy.name} started`)
    
    // 开始监控循环
    this.monitorLoop()
  }

  /**
   * 停止 Agent
   */
  stop(): void {
    this.state.status = 'stopped'
    console.log(`Agent ${this.strategy.name} stopped`)
  }

  /**
   * 监控循环
   */
  private async monitorLoop(): Promise<void> {
    if (this.state.status !== 'running') return

    try {
      // 1. 获取信号
      const signals = await getSignals(20)
      
      // 2. 过滤信号
      const filteredSignals = signals.filter(s => 
        s.signalStrength >= this.strategy.minSignalStrength
      )

      // 3. 分析每个信号
      for (const signal of filteredSignals) {
        const decision = await this.makeDecision(signal)
        
        // 4. 执行决策
        if (decision.action === 'BUY' && this.strategy.autoExecute) {
          await this.executeTrade(signal, decision)
        }
      }
    } catch (error) {
      console.error('Agent monitor error:', error)
    }

    // 60 秒后再次检查
    setTimeout(() => this.monitorLoop(), 60000)
  }

  /**
   * 做出决策
   */
  private async makeDecision(signal: Signal): Promise<AgentDecision> {
    // 1. AI 分析
    const analysis = await analyzeToken({
      tokenSymbol: signal.tokenSymbol,
      tokenAddress: signal.tokenAddress,
      chainId: signal.chainId,
      signalData: signal,
    })

    // 2. 计算决策评分
    const score = this.calculateDecisionScore(signal, analysis)

    // 3. 做出决策
    if (score >= 85 && analysis.recommendation === 'strong_buy') {
      return {
        action: 'BUY',
        confidence: score,
        reason: `信号强度${signal.signalStrength} + AI 置信度${analysis.confidence}`,
        signal,
        analysis,
      }
    } else if (score >= 70) {
      return {
        action: 'WATCH',
        confidence: score,
        reason: '信号不错但不够强，继续观察',
        signal,
        analysis,
      }
    } else {
      return {
        action: 'SKIP',
        confidence: score,
        reason: '信号不符合策略',
        signal,
        analysis,
      }
    }
  }

  /**
   * 计算决策评分
   */
  private calculateDecisionScore(signal: Signal, analysis: any): number {
    let score = 0

    // 信号强度 (40 分)
    score += signal.signalStrength * 0.4

    // AI 置信度 (30 分)
    score += analysis.confidence * 0.3

    // 叙事匹配 (15 分)
    if (signal.narrative === 'hot') score += 15
    else if (signal.narrative === 'trending') score += 10
    else score += 5

    // 聪明钱加成 (15 分)
    const smartMoneyCount = signal.triggeredWallets.filter(w => w.type === 'smart_money').length
    score += Math.min(smartMoneyCount * 5, 15)

    return score
  }

  /**
   * 执行交易
   */
  private async executeTrade(signal: Signal, decision: AgentDecision): Promise<void> {
    console.log(`Executing trade for ${signal.tokenSymbol}`)

    try {
      // 1. 获取报价
      const quote = await getSwapQuote(
        signal.chainId,
        'USDC',
        signal.tokenAddress,
        this.calculatePosition().toString(),
        1
      )

      // 2. 检查 Gas
      const gasFeeUsd = parseFloat(quote.gasEstimate.gasFee)
      if (gasFeeUsd > this.strategy.gasLimit) {
        console.log(`Gas too high: ${gasFeeUsd} > ${this.strategy.gasLimit}`)
        return
      }

      // 3. 执行交易
      const result = await executeSwap(
        signal.chainId,
        'USDC',
        signal.tokenAddress,
        this.calculatePosition().toString(),
        '0x...' // Agent 钱包地址
      )

      // 4. 更新状态
      this.state.totalTrades++
      this.state.lastActivity = new Date().toISOString()

      console.log(`Trade executed: ${result.txHash}`)
    } catch (error) {
      console.error('Trade execution error:', error)
    }
  }

  /**
   * 计算仓位
   */
  private calculatePosition(): number {
    // 简化版：固定仓位
    return 100 // 100 USDC
  }

  /**
   * 获取 Agent 状态
   */
  getState(): AgentState {
    return { ...this.state }
  }
}

/**
 * 创建 Agent 实例
 */
export function createAgent(strategy: AgentStrategy): AgentEngine {
  return new AgentEngine(strategy)
}

/**
 * 默认策略模板
 */
export const DEFAULT_STRATEGIES: AgentStrategy[] = [
  {
    id: 'aggressive',
    name: '激进狩猎',
    minSignalStrength: 85,
    narrativeFilter: ['hot'],
    maxPosition: 10,
    takeProfit: 100,
    stopLoss: 20,
    gasLimit: 50,
    autoExecute: true,
    status: 'stopped',
  },
  {
    id: 'conservative',
    name: '保守狩猎',
    minSignalStrength: 90,
    narrativeFilter: ['hot', 'trending'],
    maxPosition: 5,
    takeProfit: 50,
    stopLoss: 10,
    gasLimit: 30,
    autoExecute: true,
    status: 'stopped',
  },
  {
    id: 'balanced',
    name: '平衡狩猎',
    minSignalStrength: 88,
    narrativeFilter: ['hot', 'trending'],
    maxPosition: 7,
    takeProfit: 80,
    stopLoss: 15,
    gasLimit: 40,
    autoExecute: true,
    status: 'stopped',
  },
]
