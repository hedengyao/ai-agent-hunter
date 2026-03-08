/**
 * Supabase 数据库客户端
 * 用于存储 Agent 配置、交易历史等数据
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 只有在配置了 Supabase 时才创建客户端
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * 数据库类型定义
 */
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          user_id: string
          config: any
          status: 'running' | 'stopped'
          win_rate: number
          total_pnl: number
          total_trades: number
          created_at: string
          updated_at: string
        }
      }
      trades: {
        Row: {
          id: string
          agent_id: string
          token_symbol: string
          token_address: string
          action: 'buy' | 'sell'
          amount: number
          price: number
          pnl?: number
          status: 'pending' | 'completed' | 'failed'
          tx_hash?: string
          created_at: string
        }
      }
      signals: {
        Row: {
          id: string
          token_symbol: string
          token_address: string
          chain_id: string
          signal_strength: number
          signal_type: string
          price: string
          price_change_24h: number
          market_cap: string
          liquidity: string
          created_at: string
        }
      }
    }
  }
}

/**
 * Agent 相关操作
 */

export async function createAgent(data: {
  name: string
  user_id: string
  config: any
}) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      ...data,
      status: 'stopped',
      win_rate: 0,
      total_pnl: 0,
      total_trades: 0,
    })
    .select()
    .single()

  if (error) throw error
  return agent
}

export async function getAgents(userId?: string) {
  if (!supabase) return []
  
  let query = supabase.from('agents').select('*')
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function updateAgentStatus(id: string, status: 'running' | 'stopped') {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('agents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data
}

export async function updateAgentConfig(id: string, config: any) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('agents')
    .update({ config, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data
}

/**
 * 交易相关操作
 */

export async function createTrade(data: {
  agent_id: string
  token_symbol: string
  token_address: string
  action: 'buy' | 'sell'
  amount: number
  price: number
}) {
  if (!supabase) return null
  
  const { data: trade, error } = await supabase
    .from('trades')
    .insert({
      ...data,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return null
  return trade
}

export async function updateTrade(id: string, updates: {
  status?: 'pending' | 'completed' | 'failed'
  pnl?: number
  tx_hash?: string
}) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data
}

export async function getTrades(agentId?: string) {
  if (!supabase) return []
  
  let query = supabase.from('trades').select('*')
  
  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

/**
 * 信号相关操作
 */

export async function saveSignal(data: {
  token_symbol: string
  token_address: string
  chain_id: string
  signal_strength: number
  signal_type: string
  price: string
  price_change_24h: number
  market_cap: string
  liquidity: string
}) {
  if (!supabase) return null
  
  const { data: signal, error } = await supabase
    .from('signals')
    .insert(data)
    .select()
    .single()

  if (error) return null
  return signal
}

export async function getSignals(limit = 20) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}
