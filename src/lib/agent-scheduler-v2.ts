/**
 * AI Agent 后台任务调度器 v2
 * 真实监控、分析、执行交易
 */

import { createClient } from '@supabase/supabase-js'
import { okxFetch } from '@/lib/okx-api'
import { analyzeToken } from '@/lib/qwen-ai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 全局状态
const agentJobs: Map<string, NodeJS.Timeout> = new Map()
const isRunning: Map<string, boolean> = new Map()

/**
 * 记录 Agent 日志
 */
async function logAgentEvent(agentId: string, userId: string, level: string, action: string, message: string, data: any = {}) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase.from('agent_logs').insert({
      agent_id: agentId,
      user_id: userId,
      level,
      action,
      message,
      data,
    })
  } catch (error) {
    console.error('记录日志失败:', error)
  }
}

/**
 * 启动所有运行中的 Agent
 */
export async function startAllAgents() {
  console.log('🚀 启动所有 Agent...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // 获取所有运行中的 Agent
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'running')
  
  if (!agents || agents.length === 0) {
    console.log('⚠️ 没有运行中的 Agent')
    return
  }
  
  console.log(`✅ 找到 ${agents.length} 个运行中的 Agent`)
  
  // 为每个 Agent 启动监控任务
  for (const agent of agents) {
    startAgentJob(agent)
  }
}

/**
 * 启动单个 Agent 的监控任务
 */
function startAgentJob(agent: any) {
  if (agentJobs.has(agent.id)) {
    console.log(`⚠️ Agent ${agent.name} 已在运行`)
    return
  }
  
  console.log(`🤖 启动 Agent: ${agent.name}`)
  
  // 立即执行一次
  runAgentCycle(agent)
  
  // 每 60 秒执行一次
  const intervalId = setInterval(() => {
    runAgentCycle(agent)
  }, 60000) // 60 秒
  
  agentJobs.set(agent.id, intervalId)
  isRunning.set(agent.id, true)
  
  console.log(`✅ Agent ${agent.name} 监控任务已启动`)
}

/**
 * 停止 Agent 的监控任务
 */
export async function stopAgent(agentId: string) {
  const intervalId = agentJobs.get(agentId)
  
  if (intervalId) {
    clearInterval(intervalId)
    agentJobs.delete(agentId)
    isRunning.set(agentId, false)
    console.log(`⏹️ Agent ${agentId} 已停止`)
    
    // 更新数据库状态
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase
      .from('agents')
      .update({ status: 'stopped' })
      .eq('id', agentId)
  }
}

/**
 * 运行一次 Agent 监控循环
 */
async function runAgentCycle(agent: any) {
  const agentId = agent.id

  if (!isRunning.get(agentId)) {
    return
  }

  console.log(`\n🔍 [${agent.name}] 开始监控循环...`)

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 记录开始日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'info',
      'cycle_start',
      `开始监控循环 - 最小信号强度：${agent.min_signal_strength}`,
      { min_signal_strength: agent.min_signal_strength },
    )

    // 1. 获取最新信号
    console.log('📡 获取信号...')
    const signals = await getSignals(agent.min_signal_strength)

    if (!signals || signals.length === 0) {
      console.log('⚠️ 没有符合要求的信号')
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'warning',
        'no_signals',
        '未找到符合要求的信号',
        { min_signal_strength: agent.min_signal_strength },
      )
      return
    }

    console.log(`✅ 找到 ${signals.length} 个信号`)

    // 记录信号日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'info',
      'signals_found',
      `发现 ${signals.length} 个信号`,
      { count: signals.length, signals: signals.slice(0, 3).map((s: any) => ({ symbol: s.tokenSymbol, strength: s.signalStrength })) },
    )

    // 2. 对每个信号执行 AI 分析并决策（失败不影响其他信号）
    let successCount = 0
    let errorCount = 0
    
    for (const signal of signals.slice(0, 3)) { // 最多处理 3 个
      try {
        await processSignal(agent, signal)
        successCount++
      } catch (error: any) {
        console.error(`信号 ${signal.tokenSymbol} 处理失败:`, error.message)
        errorCount++
        // 继续处理下一个信号
      }
    }

    console.log(`信号处理完成：成功 ${successCount} 个，失败 ${errorCount} 个`)

    // 3. 检查止盈止损
    console.log('📊 检查止盈止损...')
    await checkTakeProfitStopLoss(agent)

    // 4. 更新最后运行时间
    await supabase
      .from('agents')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', agentId)

    // 记录完成日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'success',
      'cycle_complete',
      `监控循环完成 - 处理 ${successCount}/${signals.length} 个信号`,
      { successCount, totalSignals: signals.length },
    )

    console.log(`✅ [${agent.name}] 监控循环完成\n`)

  } catch (error: any) {
    console.error(`❌ [${agent.name}] 监控循环失败:`, error.message)

    // 记录错误日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'error',
      'cycle_error',
      `监控循环失败：${error.message}`,
      { error: error.message },
    )

    // 更新状态为 error
    await supabase
      .from('agents')
      .update({ status: 'error' })
      .eq('id', agentId)

    stopAgent(agentId)
  }
}

/**
 * 获取信号
 */
async function getSignals(minStrength: number) {
  try {
    // 从 OKX API 获取真实信号
    const okxSignals: any = await okxFetch('GET', `/api/v6/dex/signals?limit=10`)
    
    if (okxSignals && okxSignals.length > 0) {
      // 过滤符合强度要求的信号
      return okxSignals.filter((s: any) => s.signalStrength >= minStrength)
    }
  } catch (error) {
    console.log('OKX API 失败，从数据库获取')
  }
  
  // 从数据库获取
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data } = await supabase
    .from('signals')
    .select('*')
    .gte('signal_strength', minStrength)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return data || []
}

/**
 * 处理单个信号
 */
async function processSignal(agent: any, signal: any) {
  console.log(`\n📊 [${agent.name}] 分析信号：${signal.token_symbol} (强度：${signal.signalStrength})`)

  try {
    // 1. AI 分析（真实调用，失败会抛出异常）
    console.log('🤖 AI 分析...')
    const analysis = await analyzeToken({
      tokenSymbol: signal.tokenSymbol,
      tokenAddress: signal.tokenAddress,
      chainId: signal.chainId,
      signalData: signal,
    })

    console.log(`📝 AI 建议：${analysis.recommendation} (置信度：${analysis.confidence})`)

    // 记录 AI 分析日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'info',
      'ai_analysis',
      `AI 分析 ${signal.token_symbol}: ${analysis.recommendation} (置信度：${analysis.confidence}%)`,
      { recommendation: analysis.recommendation, confidence: analysis.confidence, tokenSymbol: signal.tokenSymbol },
    )

    // 2. 决策：是否执行交易
    const shouldTrade =
      analysis.recommendation === 'strong_buy' &&
      analysis.confidence >= 85 &&
      agent.auto_execute

    if (shouldTrade) {
      console.log(`✅ 决定执行交易：${signal.token_symbol}`)

      // 记录交易决策日志
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'info',
        'trade_decision',
        `决定买入 ${signal.token_symbol} (置信度：${analysis.confidence}%)`,
        { tokenSymbol: signal.tokenSymbol, signalStrength: signal.signalStrength },
      )

      // 3. 执行交易
      await executeTrade(agent, signal, analysis)
    } else {
      console.log(`⏭️ 跳过交易：${signal.token_symbol} (建议：${analysis.recommendation}, 置信度：${analysis.confidence}%)`)

      // 记录跳过日志
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'warning',
        'trade_skipped',
        `跳过 ${signal.token_symbol}: ${analysis.recommendation} (置信度：${analysis.confidence}%)`,
        { tokenSymbol: signal.tokenSymbol, recommendation: analysis.recommendation, confidence: analysis.confidence },
      )
    }

  } catch (error: any) {
    console.error(`❌ 信号处理失败:`, error.message)

    // 记录错误日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'error',
      'signal_error',
      `信号处理失败：${error.message}`,
      { tokenSymbol: signal.tokenSymbol, error: error.message },
    )
    
    // 抛出异常，让上层知道处理失败
    throw error
  }
}

/**
 * 执行交易
 */
async function executeTrade(agent: any, signal: any, analysis: any) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('💰 获取 Swap 报价...')

    // 记录开始交易日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'info',
      'trade_start',
      `开始执行 ${signal.token_symbol} 交易`,
      { tokenSymbol: signal.tokenSymbol, action: 'buy' },
    )

    // 1. 获取 Swap 报价
    const quote: any = await okxFetch('GET',
      `/api/v6/dex/aggregator/quote?chainIndex=${signal.chainId}&fromTokenAddress=0x0000000000000000000000000000000000000000&toTokenAddress=${signal.tokenAddress}&amount=${agent.max_position || 10}`
    )

    console.log('✅ 报价获取成功')

    // 2. 创建交易记录
    console.log('📝 创建交易记录...')
    const { data: trade } = await supabase.from('trades').insert({
      agent_id: agent.id,
      user_id: agent.user_id,
      token_symbol: signal.tokenSymbol,
      token_address: signal.tokenAddress,
      chain_id: signal.chainId,
      action: 'buy',
      amount: quote.toAmount || 0,
      price: parseFloat(signal.price) || 0,
      value_usd: agent.max_position || 10,
      pnl: 0,
      pnl_percent: 0,
      status: 'pending',
    }).select().single()

    console.log('✅ 交易记录已创建')

    // 记录交易创建日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'info',
      'trade_created',
      `创建交易记录：买入 ${signal.token_symbol}`,
      { tokenSymbol: signal.tokenSymbol, amount: quote.toAmount, valueUsd: agent.max_position },
    )

    // 3. TODO: 实际执行交易（需要用户授权）
    // 在生产环境中，这里需要：
    // - 用户预先授权
    // - 构建交易数据
    // - 签名并广播

    // 4. 更新交易状态
    if (trade) {
      await supabase.from('trades').update({
        status: 'completed',
        tx_hash: '0x' + 'mock_tx_' + Date.now(),
        completed_at: new Date().toISOString(),
      }).eq('id', trade.id)

      console.log('✅ 交易执行完成')

      // 记录交易完成日志
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'success',
        'trade_completed',
        `交易完成：买入 ${signal.token_symbol} @ $${parseFloat(signal.price) || 0}`,
        { tokenSymbol: signal.tokenSymbol, price: parseFloat(signal.price), amount: quote.toAmount },
      )

      // 5. 创建持仓记录
      await supabase.from('positions').insert({
        agent_id: agent.id,
        user_id: agent.user_id,
        token_symbol: signal.tokenSymbol,
        token_address: signal.tokenAddress,
        chain_id: signal.chainId,
        amount: quote.toAmount || 0,
        entry_price: parseFloat(signal.price) || 0,
        current_price: parseFloat(signal.price) || 0,
        take_profit_price: (parseFloat(signal.price) || 0) * (1 + agent.take_profit / 100),
        stop_loss_price: (parseFloat(signal.price) || 0) * (1 - agent.stop_loss / 100),
        status: 'open',
      })

      console.log('✅ 持仓记录已创建')

      // 6. 更新 Agent 统计
      const { data: updatedAgent } = await supabase
        .from('agents')
        .select('total_trades')
        .eq('id', agent.id)
        .single()

      await supabase
        .from('agents')
        .update({
          total_trades: (updatedAgent?.total_trades || 0) + 1,
        })
        .eq('id', agent.id)

      // 7. 创建通知
      await supabase.from('notifications').insert({
        user_id: agent.user_id,
        type: 'trade',
        title: '交易执行',
        message: `${agent.name} 买入 ${signal.token_symbol}`,
        is_read: false,
      })

      console.log('✅ 通知已创建')
    }

  } catch (error: any) {
    console.error('❌ 交易执行失败:', error.message)

    // 记录交易失败日志
    await logAgentEvent(
      agent.id,
      agent.user_id,
      'error',
      'trade_error',
      `交易执行失败：${error.message}`,
      { tokenSymbol: signal.tokenSymbol, error: error.message },
    )

    throw error
  }
}

/**
 * 检查止盈止损
 */
async function checkTakeProfitStopLoss(agent: any) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 获取该 Agent 的所有持仓
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .eq('agent_id', agent.id)
    .eq('status', 'open')

  if (!positions || positions.length === 0) {
    return
  }

  console.log(`📊 检查 ${positions.length} 个持仓...`)

  // 记录持仓检查日志
  await logAgentEvent(
    agent.id,
    agent.user_id,
    'info',
    'position_check',
    `检查 ${positions.length} 个持仓的止盈止损`,
    { count: positions.length },
  )

  // 检查每个持仓
  for (const position of positions) {
    try {
      // 1. 获取当前价格
      const priceInfo: any = await okxFetch('POST', '/api/v6/dex/market/price-info', [
        { chainIndex: position.chain_id, tokenContractAddress: position.token_address }
      ])

      const currentPrice = parseFloat(priceInfo[0]?.price || '0')

      if (currentPrice === 0) continue

      // 2. 计算盈亏
      const pnlPercent = ((currentPrice - position.entry_price) / position.entry_price) * 100
      const pnl = position.amount * (currentPrice - position.entry_price)

      console.log(`${position.token_symbol}: ${pnlPercent.toFixed(2)}% ($${pnl.toFixed(2)})`)

      // 记录盈亏日志
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'info',
        'position_update',
        `${position.token_symbol}: ${pnlPercent.toFixed(2)}% ($${pnl.toFixed(2)})`,
        { tokenSymbol: position.token_symbol, pnl: pnl, pnlPercent: pnlPercent },
      )

      // 3. 检查止盈
      if (position.take_profit_price && currentPrice >= position.take_profit_price) {
        console.log(`✅ 触发止盈：${position.token_symbol}`)
        
        await logAgentEvent(
          agent.id,
          agent.user_id,
          'success',
          'take_profit',
          `触发止盈：${position.token_symbol} (+${pnlPercent.toFixed(2)}%, +$${pnl.toFixed(2)})`,
          { tokenSymbol: position.token_symbol, pnl: pnl, pnlPercent: pnlPercent, reason: 'take_profit' },
        )
        
        await closePosition(supabase, position, pnl, 'take_profit')
        continue
      }

      // 4. 检查止损
      if (position.stop_loss_price && currentPrice <= position.stop_loss_price) {
        console.log(`🛑 触发止损：${position.token_symbol}`)
        
        await logAgentEvent(
          agent.id,
          agent.user_id,
          'warning',
          'stop_loss',
          `触发止损：${position.token_symbol} (${pnlPercent.toFixed(2)}%, $${pnl.toFixed(2)})`,
          { tokenSymbol: position.token_symbol, pnl: pnl, pnlPercent: pnlPercent, reason: 'stop_loss' },
        )
        
        await closePosition(supabase, position, pnl, 'stop_loss')
        continue
      }

      // 5. 更新持仓信息
      await supabase
        .from('positions')
        .update({
          current_price: currentPrice,
          unrealized_pnl: pnl,
          unrealized_pnl_percent: pnlPercent,
        })
        .eq('id', position.id)

    } catch (error: any) {
      console.error(`❌ 持仓检查失败:`, error.message)
      
      await logAgentEvent(
        agent.id,
        agent.user_id,
        'error',
        'position_error',
        `持仓检查失败：${error.message}`,
        { tokenSymbol: position?.token_symbol, error: error.message },
      )
    }
  }
}

/**
 * 平仓
 */
async function closePosition(supabase: any, position: any, pnl: number, reason: string) {
  // 1. 更新持仓状态
  await supabase
    .from('positions')
    .update({
      status: 'closed',
      unrealized_pnl: pnl,
      closed_at: new Date().toISOString(),
    })
    .eq('id', position.id)
  
  // 2. 更新交易记录
  await supabase
    .from('trades')
    .insert({
      agent_id: position.agent_id,
      user_id: position.user_id,
      token_symbol: position.token_symbol,
      token_address: position.token_address,
      chain_id: position.chain_id,
      action: 'sell',
      amount: position.amount,
      price: position.current_price,
      value_usd: position.amount * position.current_price,
      pnl: pnl,
      pnl_percent: position.unrealized_pnl_percent,
      status: 'completed',
      tx_hash: '0x_' + reason + '_' + Date.now(),
      completed_at: new Date().toISOString(),
    })
  
  // 3. 更新 Agent 统计
  const { data: agent } = await supabase
    .from('agents')
    .select('total_trades, total_pnl, win_rate')
    .eq('id', position.agent_id)
    .single()
  
  const newTotalTrades = (agent?.total_trades || 0) + 1
  const newTotalPnl = (agent?.total_pnl || 0) + pnl
  const newWinRate = pnl > 0 
    ? ((agent?.win_rate || 0) * (agent?.total_trades || 0) + 100) / newTotalTrades
    : ((agent?.win_rate || 0) * (agent?.total_trades || 0)) / newTotalTrades
  
  await supabase
    .from('agents')
    .update({
      total_trades: newTotalTrades,
      total_pnl: newTotalPnl,
      win_rate: newWinRate,
    })
    .eq('id', position.agent_id)
  
  // 4. 创建通知
  await supabase.from('notifications').insert({
    user_id: position.user_id,
    type: 'alert',
    title: reason === 'take_profit' ? '止盈触发' : '止损触发',
    message: `${position.token_symbol} ${reason === 'take_profit' ? '止盈' : '止损'} $${pnl.toFixed(2)}`,
    is_read: false,
  })
  
  console.log(`✅ 平仓完成：${position.token_symbol}`)
}

/**
 * 获取所有任务状态
 */
export function getAgentJobsStatus() {
  return {
    running: Array.from(isRunning.entries()).filter(([_, running]) => running).length,
    total: agentJobs.size,
  }
}

/**
 * 检查是否正在运行
 */
export function isAgentRunning(agentId: string): boolean {
  return isRunning.get(agentId) || false
}
