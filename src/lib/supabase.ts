/**
 * Supabase 数据库客户端
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 只有在配置了 Supabase 时才创建客户端
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * Agent 相关操作
 */

export async function createAgent(data: {
  name: string
  user_id: string
  config: any
}) {
  if (!supabase) return null
  
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      ...data,
      status: 'stopped',
    })
    .select()
    .single()

  if (error) throw error
  return agent
}

export async function getAgents(userId: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateAgentStatus(id: string, status: 'running' | 'stopped' | 'error') {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('agents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
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

  if (error) throw error
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

  if (error) throw error
  return data
}

export async function getTrades(agentId?: string) {
  if (!supabase) return []
  
  let query = supabase.from('trades').select('*')
  
  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * 用户相关操作
 */

export async function createUser(walletAddress: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserByWallet(walletAddress: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
