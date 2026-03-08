/**
 * 创建测试数据
 * 用于测试所有功能
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kahgyvdkupywpkjffewv.supabase.co'
const supabaseKey = 'sb_publishable_A7A4ubFX8W0sLZZH5QzBow_n-E8_cz0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('🚀 开始创建测试数据...')

  // 1. 创建用户（如果不存在）
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')
    .single()

  let userId = existingUser?.id

  if (!userId) {
    const { data: user } = await supabase
      .from('users')
      .insert({
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      })
      .select()
      .single()

    userId = user?.id
    console.log('✅ 用户创建成功:', userId)
  } else {
    console.log('✅ 用户已存在:', userId)
  }

  // 2. 创建多个 Agent
  const agents = [
    { name: '激进狩猎', min_signal_strength: 85, max_position: 15, take_profit: 150, stop_loss: 25 },
    { name: '平衡狩猎', min_signal_strength: 88, max_position: 10, take_profit: 100, stop_loss: 20 },
    { name: '保守狩猎', min_signal_strength: 90, max_position: 5, take_profit: 50, stop_loss: 10 },
  ]

  for (const agent of agents) {
    const { data } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: agent.name,
        status: 'stopped',
        min_signal_strength: agent.min_signal_strength,
        max_position: agent.max_position,
        take_profit: agent.take_profit,
        stop_loss: agent.stop_loss,
        auto_execute: true,
      })
      .select()
      .single()

    console.log('✅ Agent 创建成功:', data?.name)
  }

  // 3. 创建测试信号
  const signals = [
    { token_symbol: 'TITAN', signal_strength: 92, price: '3.01', price_change_24h: 156.3, narrative: 'hot' },
    { token_symbol: 'xETH', signal_strength: 88, price: '1985.70', price_change_24h: 89.7, narrative: 'trending' },
    { token_symbol: 'PEPE', signal_strength: 85, price: '0.00001234', price_change_24h: 67.8, narrative: 'hot' },
  ]

  for (const signal of signals) {
    await supabase.from('signals').insert({
      token_symbol: signal.token_symbol,
      token_address: '0x' + Math.random().toString(16).substr(2, 40),
      chain_id: '196',
      signal_strength: signal.signal_strength,
      signal_type: 'smart_money',
      price: signal.price,
      price_change_24h: signal.price_change_24h,
      market_cap: '$1M',
      liquidity: '$100K',
      narrative: signal.narrative,
    })

    console.log('✅ 信号创建成功:', signal.token_symbol)
  }

  // 4. 创建测试交易
  const trades = [
    { token_symbol: 'TITAN', action: 'buy', pnl: 120, status: 'completed' },
    { token_symbol: 'xETH', action: 'buy', pnl: 89, status: 'completed' },
    { token_symbol: 'PEPE', action: 'sell', pnl: -15, status: 'completed' },
  ]

  for (const trade of trades) {
    await supabase.from('trades').insert({
      agent_id: (await supabase.from('agents').select('id').limit(1).single()).data?.id,
      user_id: userId,
      token_symbol: trade.token_symbol,
      token_address: '0x' + Math.random().toString(16).substr(2, 40),
      chain_id: '196',
      action: trade.action,
      amount: 10,
      price: 1,
      value_usd: 100,
      pnl: trade.pnl,
      status: trade.status,
    })

    console.log('✅ 交易创建成功:', trade.token_symbol)
  }

  // 5. 创建测试通知
  const notifications = [
    { type: 'signal', title: '新信号', message: '发现高強度信号 TITAN' },
    { type: 'trade', title: '交易完成', message: 'TITAN 买入成功' },
    { type: 'alert', title: '止盈触发', message: 'xETH 达到止盈价格' },
  ]

  for (const notif of notifications) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      is_read: false,
    })

    console.log('✅ 通知创建成功:', notif.title)
  }

  console.log('\n🎉 测试数据创建完成！')
  console.log('\n📊 数据汇总:')
  console.log('- 用户: 1')
  console.log('- Agent: 3')
  console.log('- 信号：3')
  console.log('- 交易：3')
  console.log('- 通知：3')
}

createTestData().catch(console.error)
