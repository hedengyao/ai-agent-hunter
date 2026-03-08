/**
 * Agent 运行器
 * 在后台运行，监控信号并自动执行交易
 */

import { getSignals } from './signals'
import { analyzeToken } from './qwen-ai'
import { getSwapQuote } from './okx-api'

export interface AgentConfig {
  id: string
  name: string
  minSignalStrength: number
  narrativeFilter: string[]
  maxPosition: number
  takeProfit: number
  stopLoss: number
  gasLimit: number
  autoExecute: boolean
}

export interface AgentState {
  id: string
  status: 'running' | 'stopped' | 'error'
  totalTrades: number
  winRate: number
  totalPnl: number
  lastActivity: string
  currentPositions: Array<{
    token: string
    amount: number
    entryPrice: number
    currentPrice: number
    pnl: number
  }>
}

export class AgentRunner {
  private config: AgentConfig
  private state: AgentState
  private interval: NodeJS.Timeout | null = null
  private checkInterval: number = 60000 // 60 秒检查一次

  constructor(config: AgentConfig) {
    this.config = config
    this.state = {
      id: config.id,
      status: 'stopped',
      totalTrades: 0,
      winRate: 0,
      totalPnl: 0,
      lastActivity: new Date().toISOString(),
      currentPositions: [],
    }
  }

  /**
   * 启动 Agent
   */
  async start(): Promise<void> {
    if (this.state.status === 'running') {
      console.log(`Agent ${this.config.name} 已在运行中`)
      return
    }

    this.state.status = 'running'
    console.log(`🚀 Agent ${this.config.name} 启动`)

    // 开始监控循环
    this.runLoop()
    this.interval = setInterval(() => this.runLoop(), this.checkInterval)
  }

  /**
   * 停止 Agent
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.state.status = 'stopped'
    console.log(`⏹️ Agent ${this.config.name} 已停止`)
  }

  /**
   * 运行循环
   */
  private async runLoop(): Promise<void> {
    if (this.state.status !== 'running') return

    try {
      console.log(`🔍 Agent ${this.config.name} 正在检查信号...`)

      // 1. 获取信号
      const signals = await getSignals(20)
      console.log(`📊 获取到 ${signals.length} 个信号`)

      // 2. 过滤信号
      const filteredSignals = signals.filter(signal => {
        // 信号强度过滤
        if (signal.signalStrength < this.config.minSignalStrength) {
          return false
        }

        // 叙事过滤
        if (signal.narrative && !this.config.narrativeFilter.includes(signal.narrative)) {
          return false
        }

        return true
      })

      console.log(`✅ 过滤后剩余 ${filteredSignals.length} 个信号`)

      // 3. 分析每个信号
      for (const signal of filteredSignals) {
        await this.processSignal(signal)
      }

      // 4. 检查现有仓位
      await this.checkPositions()

      this.state.lastActivity = new Date().toISOString()
    } catch (error) {
      console.error(`❌ Agent ${this.config.name} 错误:`, error)
      this.state.status = 'error'
    }
  }

  /**
   * 处理信号
   */
  private async processSignal(signal: any): Promise<void> {
    console.log(`🧠 分析信号：${signal.tokenSymbol}`)

    // AI 分析
    const analysis = await analyzeToken({
      tokenSymbol: signal.tokenSymbol,
      tokenAddress: signal.tokenAddress,
      chainId: signal.chainId,
      signalData: signal,
    })

    console.log(`📈 AI 分析结果：${analysis.recommendation}, 置信度：${analysis.confidence}`)

    // 决策
    if (analysis.recommendation === 'strong_buy' && analysis.confidence >= 85) {
      console.log(`✅ 决策：BUY ${signal.tokenSymbol}`)
      
      if (this.config.autoExecute) {
        await this.executeTrade(signal)
      } else {
        console.log(`⚠️ 自动执行已禁用，跳过交易`)
      }
    } else {
      console.log(`⏭️ 决策：SKIP ${signal.tokenSymbol}`)
    }
  }

  /**
   * 执行交易
   */
  private async executeTrade(signal: any): Promise<void> {
    try {
      console.log(`⚡ 执行交易：${signal.tokenSymbol}`)

      // 1. 计算仓位
      const positionSize = this.calculatePosition(signal)
      console.log(`💰 仓位大小：$${positionSize}`)

      // 2. 获取报价
      const quote = await getSwapQuote(
        signal.chainId,
        'USDC',
        signal.tokenAddress,
        positionSize.toString(),
        1 // 1% 滑点
      )

      console.log(`📊 报价：${quote.fromAmount} USDC → ${quote.toAmount} ${signal.tokenSymbol}`)

      // 3. 检查 Gas
      const gasFeeUsd = parseFloat(quote.gasEstimate?.gasFee || '0')
      if (gasFeeUsd > this.config.gasLimit) {
        console.log(`⚠️ Gas 过高：$${gasFeeUsd} > $${this.config.gasLimit}，跳过`)
        return
      }

      // 4. TODO: 执行交易
      // 这里需要集成真实的交易执行
      console.log(`✅ 交易执行成功 (模拟)`)
      
      // 5. 更新状态
      this.state.totalTrades++
      
      // 6. 添加到仓位
      this.state.currentPositions.push({
        token: signal.tokenSymbol,
        amount: parseFloat(quote.toAmount),
        entryPrice: parseFloat(signal.price),
        currentPrice: parseFloat(signal.price),
        pnl: 0,
      })

      console.log(`📦 新仓位：${signal.tokenSymbol}`)
    } catch (error) {
      console.error(`❌ 交易执行失败:`, error)
    }
  }

  /**
   * 计算仓位
   */
  private calculatePosition(signal: any): number {
    // 基础仓位
    let position = this.config.maxPosition * 10 // 转换为 USD

    // 根据信号强度调整
    if (signal.signalStrength >= 95) {
      position *= 1.5 // 极强信号，加仓 50%
    } else if (signal.signalStrength >= 90) {
      position *= 1.2 // 强信号，加仓 20%
    }

    // 根据风险调整
    if (signal.riskScore < 60) {
      position *= 0.5 // 高风险，减仓 50%
    }

    return Math.min(position, this.config.maxPosition * 15) // 最大不超过 15 倍
  }

  /**
   * 检查现有仓位
   */
  private async checkPositions(): Promise<void> {
    for (const position of this.state.currentPositions) {
      // 计算 PnL
      const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100
      position.pnl = pnlPercent

      console.log(`📊 仓位 ${position.token}: PnL = ${pnlPercent.toFixed(2)}%`)

      // 检查止盈
      if (pnlPercent >= this.config.takeProfit) {
        console.log(`🎯 止盈触发：${position.token} (+${pnlPercent.toFixed(2)}%)`)
        await this.closePosition(position)
      }

      // 检查止损
      if (pnlPercent <= -this.config.stopLoss) {
        console.log(`🛑 止损触发：${position.token} (${pnlPercent.toFixed(2)}%)`)
        await this.closePosition(position)
      }
    }
  }

  /**
   * 平仓
   */
  private async closePosition(position: any): Promise<void> {
    try {
      console.log(`💰 平仓：${position.token}`)
      
      // TODO: 执行卖出交易
      
      // 更新 PnL
      const pnl = position.amount * (position.currentPrice - position.entryPrice)
      this.state.totalPnl += pnl

      // 从仓位中移除
      this.state.currentPositions = this.state.currentPositions.filter(
        p => p.token !== position.token
      )

      console.log(`✅ 平仓完成，PnL: $${pnl.toFixed(2)}`)
    } catch (error) {
      console.error(`❌ 平仓失败:`, error)
    }
  }

  /**
   * 获取状态
   */
  getState(): AgentState {
    return { ...this.state }
  }

  /**
   * 获取配置
   */
  getConfig(): AgentConfig {
    return { ...this.config }
  }
}

/**
 * Agent 管理器
 * 管理多个 Agent 实例
 */
export class AgentManager {
  private agents: Map<string, AgentRunner> = new Map()

  /**
   * 创建 Agent
   */
  createAgent(config: AgentConfig): AgentRunner {
    const agent = new AgentRunner(config)
    this.agents.set(config.id, agent)
    return agent
  }

  /**
   * 获取 Agent
   */
  getAgent(id: string): AgentRunner | undefined {
    return this.agents.get(id)
  }

  /**
   * 启动所有 Agent
   */
  async startAll(): Promise<void> {
    const agentsArray = Array.from(this.agents.values())
    for (const agent of agentsArray) {
      await agent.start()
    }
  }

  /**
   * 停止所有 Agent
   */
  stopAll(): void {
    const agentsArray = Array.from(this.agents.values())
    for (const agent of agentsArray) {
      agent.stop()
    }
  }

  /**
   * 获取所有状态
   */
  getAllStates(): AgentState[] {
    return Array.from(this.agents.values()).map(agent => agent.getState())
  }
}

// 全局 Agent 管理器
export const agentManager = new AgentManager()
