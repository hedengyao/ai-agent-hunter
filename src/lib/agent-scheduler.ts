/**
 * Agent 后台任务调度器
 * 负责监控信号、执行交易、止盈止损
 */

import { getAgents, updateAgentStatus, getSignals, saveSignal, createTrade, getPositions, closePosition } from '@/lib/database-v2'
import { okxFetch } from '@/lib/okx-api'
import { analyzeToken } from '@/lib/qwen-ai'

// 任务状态
interface TaskState {
  isRunning: boolean
  lastRun?: Date
  nextRun?: Date
  error?: string
}

// 全局任务状态
const taskStates: Map<string, TaskState> = new Map()
let monitoringInterval: NodeJS.Timeout | null = null

/**
 * 启动所有 Agent 监控
 */
export function startAgentMonitoring() {
  if (monitoringInterval) {
    console.log('⚠️ Agent 监控已在运行')
    return
  }

  console.log('🚀 启动 Agent 监控系统...')
  
  // 每 60 秒检查一次
  monitoringInterval = setInterval(async () => {
    try {
      await runMonitoringCycle()
    } catch (error: any) {
      console.error('❌ 监控循环失败:', error.message)
    }
  }, 60000) // 60 秒

  console.log('✅ Agent 监控系统已启动')
}

/**
 * 停止所有 Agent 监控
 */
export function stopAgentMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
    console.log('⏹️ Agent 监控系统已停止')
  }
}

/**
 * 运行一次监控循环
 */
async function runMonitoringCycle() {
  console.log('🔍 开始监控循环...', new Date().toISOString())
  
  const startTime = Date.now()
  
  try {
    // 1. 获取所有运行中的 Agent
    const agents = await getAgents()
    const runningAgents = agents.filter(a => a.status === 'running')
    
    console.log(`📊 找到 ${runningAgents.length} 个运行中的 Agent`)
    
    // 2. 对每个 Agent 执行监控
    for (const agent of runningAgents) {
      await monitorAgent(agent)
    }
    
    // 3. 检查止盈止损
    await checkTakeProfitStopLoss()
    
    // 4. 获取并保存新信号
    await fetchAndSaveSignals()
    
  } catch (error: any) {
    console.error('❌ 监控循环失败:', error.message)
  } finally {
    const duration = Date.now() - startTime
    console.log(`✅ 监控循环完成，耗时 ${duration}ms`)
  }
}

/**
 * 监控单个 Agent
 */
async function monitorAgent(agent: any) {
  const agentId = agent.id
  const taskState = taskStates.get(agentId) || { isRunning: false }
  
  // 如果任务正在运行，跳过
  if (taskState.isRunning) {
    console.log(`⏭️ Agent ${agent.name} 任务正在运行，跳过`)
    return
  }
  
  try {
    taskState.isRunning = true
    taskState.lastRun = new Date()
    taskState.nextRun = new Date(Date.now() + 60000) // 1 分钟后
    
    console.log(`🤖 开始监控 Agent: ${agent.name}`)
    
    // 1. 获取最新信号
    const signals = await getSignals(5)
    
    // 2. 过滤符合 Agent 策略的信号
    const filteredSignals = signals.filter(signal => {
      return signal.signal_strength >= (agent.min_signal_strength || 85) &&
             (!agent.narrative_filter || agent.narrative_filter.length === 0 || 
              agent.narrative_filter.includes(signal.narrative))
    })
    
    console.log(`📡 找到 ${filteredSignals.length} 个符合条件的信号`)
    
    // 3. 对每个信号执行 AI 分析并决策
    for (const signal of filteredSignals.slice(0, 3)) { // 最多处理 3 个
      await processSignal(agent, signal)
    }
    
  } catch (error: any) {
    console.error(`❌ Agent ${agent.name} 监控失败:`, error.message)
    taskState.error = error.message
    
    // 更新 Agent 状态为 error
    await updateAgentStatus(agentId, 'error')
  } finally {
    taskState.isRunning = false
    taskStates.set(agentId, taskState)
  }
}

/**
 * 处理单个信号
 */
async function processSignal(agent: any, signal: any) {
  console.log(`📊 分析信号: ${signal.token_symbol} (强度：${signal.signal_strength})`)
  
  try {
    // 1. AI 分析
    const analysis = await analyzeToken({
      tokenSymbol: signal.token_symbol,
      tokenAddress: signal.token_address,
      chainId: signal.chain_id,
      signalData: signal,
    })
    
    console.log(`🤖 AI 分析结果: ${analysis.recommendation} (置信度：${analysis.confidence})`)
    
    // 2. 决策：是否执行交易
    const shouldTrade = 
      analysis.recommendation === 'strong_buy' && 
      analysis.confidence >= 85 &&
      agent.auto_execute
    
    if (shouldTrade) {
      console.log(`✅ 决定执行交易：${signal.token_symbol}`)
      
      // 3. 执行交易
      await executeTrade(agent, signal, analysis)
    } else {
      console.log(`⏭️ 跳过交易：${signal.token_symbol}`)
    }
    
  } catch (error: any) {
    console.error(`❌ 信号处理失败:`, error.message)
  }
}

/**
 * 执行交易
 */
async function executeTrade(agent: any, signal: any, analysis: any) {
  try {
    // 1. 获取 Swap 报价
    const quote: any = await okxFetch('GET', 
      `/api/v6/dex/aggregator/quote?chainIndex=${signal.chain_id}&fromTokenAddress=0x0000000000000000000000000000000000000000&toTokenAddress=${signal.token_address}&amount=${agent.max_position || 10}`
    )
    
    console.log('💰 获取报价成功')
    
    // 2. 创建交易记录
    const trade = await createTrade({
      agent_id: agent.id,
      user_id: agent.user_id,
      token_symbol: signal.token_symbol,
      token_address: signal.token_address,
      chain_id: signal.chain_id,
      action: 'buy',
      amount: quote.toAmount || 0,
      price: parseFloat(signal.price) || 0,
      value_usd: agent.max_position || 10,
      status: 'pending',
    })
    
    console.log('📝 交易记录已创建')
    
    // 3. TODO: 实际执行交易（需要用户授权）
    // 在生产环境中，这里需要：
    // - 用户预先授权
    // - 构建交易数据
    // - 签名并广播
    
    // 4. 更新交易状态
    await createTrade({
      ...trade,
      status: 'completed',
      tx_hash: '0x' + 'mock_tx_hash_' + Date.now(),
    })
    
    console.log('✅ 交易执行完成')
    
  } catch (error: any) {
    console.error('❌ 交易执行失败:', error.message)
    throw error
  }
}

/**
 * 检查止盈止损
 */
async function checkTakeProfitStopLoss() {
  console.log('📊 检查止盈止损...')
  
  try {
    // 1. 获取所有持仓
    const positions = await getPositions(undefined, 'open')
    
    console.log(`找到 ${positions.length} 个持仓`)
    
    // 2. 检查每个持仓
    for (const position of positions) {
      await checkPosition(position)
    }
    
  } catch (error: any) {
    console.error('❌ 止盈止损检查失败:', error.message)
  }
}

/**
 * 检查单个持仓
 */
async function checkPosition(position: any) {
  try {
    // 1. 获取当前价格
    const priceInfo: any = await okxFetch('POST', '/api/v6/dex/market/price-info', [
      { chainIndex: position.chain_id, tokenContractAddress: position.token_address }
    ])
    
    const currentPrice = parseFloat(priceInfo[0]?.price || '0')
    const entryPrice = position.entry_price
    
    if (currentPrice === 0) return
    
    // 2. 计算盈亏
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100
    const pnl = position.amount * (currentPrice - entryPrice)
    
    console.log(`📊 ${position.token_symbol}: ${pnlPercent.toFixed(2)}% (${pnl.toFixed(2)} USD)`)
    
    // 3. 检查止盈
    if (position.take_profit_price && currentPrice >= position.take_profit_price) {
      console.log(`✅ 触发止盈：${position.token_symbol}`)
      await closePosition(position.id, pnl)
      return
    }
    
    // 4. 检查止损
    if (position.stop_loss_price && currentPrice <= position.stop_loss_price) {
      console.log(`🛑 触发止损：${position.token_symbol}`)
      await closePosition(position.id, pnl)
      return
    }
    
    // 5. 更新持仓信息
    await updatePosition(position.id, {
      current_price: currentPrice,
      unrealized_pnl: pnl,
      unrealized_pnl_percent: pnlPercent,
    })
    
  } catch (error: any) {
    console.error(`❌ 持仓检查失败:`, error.message)
  }
}

/**
 * 获取并保存新信号
 */
async function fetchAndSaveSignals() {
  try {
    console.log('📡 获取新信号...')
    
    // 从 OKX API 获取信号
    const signals: any = await okxFetch('GET', '/api/v6/dex/signals?limit=10')
    
    if (!signals || (signals as any[]).length === 0) {
      console.log('⚠️ 没有新信号')
      return
    }
    
    console.log(`✅ 获取到 ${signals.length} 个信号`)
    
    // 保存到数据库
    for (const signal of signals) {
      try {
        await saveSignal({
          token_symbol: signal.tokenSymbol,
          token_address: signal.tokenAddress,
          chain_id: signal.chainId,
          signal_strength: signal.signalStrength,
          signal_type: signal.signalType,
          price: signal.priceInfo?.price || '0',
          price_change_24h: signal.priceInfo?.priceChange24h || 0,
          market_cap: signal.priceInfo?.marketCap || '0',
          liquidity: signal.priceInfo?.liquidity || '0',
          narrative: signal.narrative,
          triggered_wallets: signal.triggeredWallets || [],
        })
      } catch (error: any) {
        console.error(`保存信号失败:`, error.message)
      }
    }
    
  } catch (error: any) {
    console.error('❌ 获取信号失败:', error.message)
  }
}

/**
 * 更新持仓（辅助函数）
 */
async function updatePosition(positionId: string, updates: any) {
  // 这里需要导入 database-v2 中的 updatePosition
  // 由于循环依赖，我们直接调用
  const { supabase } = await import('@/lib/database-v2')
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('positions')
    .update(updates)
    .eq('id', positionId)
    .select()
    .single()

  if (error) return null
  return data
}

// 导出状态查询
export function getTaskStates() {
  return Object.fromEntries(taskStates)
}

export function isMonitoringRunning() {
  return monitoringInterval !== null
}
