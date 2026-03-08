/**
 * Supabase 数据库客户端 v2
 * 完整的数据库操作封装
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 创建客户端
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ========================================
// 类型定义
// ========================================

export interface User {
  id: string
  wallet_address: string
  created_at: string
  updated_at: string
  last_login_at?: string
  total_pnl: number
  total_trades: number
}

export interface Agent {
  id: string
  user_id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  min_signal_strength: number
  narrative_filter: string[]
  max_position: number
  take_profit: number
  stop_loss: number
  gas_limit: number
  auto_execute: boolean
  win_rate: number
  total_pnl: number
  total_trades: number
  created_at: string
  updated_at: string
  last_run_at?: string
}

export interface Trade {
  id: string
  agent_id: string
  user_id: string
  token_symbol: string
  token_address: string
  chain_id: string
  action: 'buy' | 'sell'
  amount: number
  price: number
  value_usd: number
  pnl: number
  pnl_percent: number
  status: 'pending' | 'completed' | 'failed'
  tx_hash?: string
  created_at: string
  completed_at?: string
}

export interface Signal {
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
  narrative?: string
  triggered_wallets: any[]
  created_at: string
}

export interface Position {
  id: string
  agent_id: string
  user_id: string
  token_symbol: string
  token_address: string
  chain_id: string
  amount: number
  entry_price: number
  current_price: number
  take_profit_price?: number
  stop_loss_price?: number
  unrealized_pnl: number
  unrealized_pnl_percent: number
  status: 'open' | 'closed' | 'stopped'
  created_at: string
  updated_at: string
  closed_at?: string
}

// ========================================
// User 操作
// ========================================

export async function createUser(walletAddress: string): Promise<User | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error) return null
  return data
}

export async function updateUserStats(userId: string, pnl: number, trades: number) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .update({ 
      total_pnl: pnl,
      total_trades: trades,
      last_login_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) return null
  return data
}

// ========================================
// Agent 操作
// ========================================

export async function createAgent(agent: Partial<Agent>): Promise<Agent | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('agents')
    .insert(agent)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAgents(userId?: string): Promise<Agent[]> {
  if (!supabase) return []
  
  let query = supabase.from('agents').select('*').order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query

  if (error) return []
  return data || []
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (error) return null
  return data
}

export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()

  if (error) return null
  return data
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)

  return !error
}

export async function updateAgentStatus(agentId: string, status: 'running' | 'stopped' | 'error'): Promise<Agent | null> {
  return updateAgent(agentId, { 
    status,
    last_run_at: status === 'running' ? new Date().toISOString() : undefined,
  })
}

// ========================================
// Trade 操作
// ========================================

export async function createTrade(trade: Partial<Trade>): Promise<Trade | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('trades')
    .insert(trade)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTrades(agentId?: string, userId?: string): Promise<Trade[]> {
  if (!supabase) return []
  
  let query = supabase.from('trades').select('*').order('created_at', { ascending: false })
  
  if (agentId) {
    query = query.eq('agent_id', agentId)
  }
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.limit(100)

  if (error) return []
  return data || []
}

export async function updateTrade(tradeId: string, updates: Partial<Trade>): Promise<Trade | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .select()
    .single()

  if (error) return null
  return data
}

// ========================================
// Signal 操作
// ========================================

export async function saveSignal(signal: Partial<Signal>): Promise<Signal | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('signals')
    .insert(signal)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSignals(limit = 20): Promise<Signal[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

// ========================================
// Position 操作
// ========================================

export async function createPosition(position: Partial<Position>): Promise<Position | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('positions')
    .insert(position)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPositions(userId?: string, status = 'open'): Promise<Position[]> {
  if (!supabase) return []
  
  let query = supabase.from('positions').select('*').eq('status', status)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query

  if (error) return []
  return data || []
}

export async function updatePosition(positionId: string, updates: Partial<Position>): Promise<Position | null> {
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

export async function closePosition(positionId: string, pnl: number): Promise<Position | null> {
  return updatePosition(positionId, {
    status: 'closed',
    unrealized_pnl: pnl,
    closed_at: new Date().toISOString(),
  })
}

// ========================================
// Notification 操作
// ========================================

export async function createNotification(userId: string, type: string, title: string, message: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, message })
    .select()
    .single()

  if (error) return null
  return data
}

export async function getNotifications(userId: string, limit = 50) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

export async function markNotificationAsRead(notificationId: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) return null
  return data
}
