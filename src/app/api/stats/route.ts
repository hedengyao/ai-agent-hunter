import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取收益统计
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const period = searchParams.get('period') || '7d'

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 计算时间范围
    let days = 7
    if (period === '30d') days = 30
    if (period === 'all') days = 365
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取交易记录
    let tradesQuery = supabase.from('trades').select('*').gte('created_at', startDate.toISOString())
    
    if (agentId) {
      tradesQuery = tradesQuery.eq('agent_id', agentId)
    }
    
    if (userId) {
      tradesQuery = tradesQuery.eq('user_id', userId)
    }

    const { data: trades, error: tradesError } = await tradesQuery

    if (tradesError) {
      throw tradesError
    }

    // 获取持仓
    let positionsQuery = supabase.from('positions').select('*').eq('status', 'open')
    
    if (userId) {
      positionsQuery = positionsQuery.eq('user_id', userId)
    }

    const { data: positions } = await positionsQuery

    // 计算统计数据
    const completedTrades = trades?.filter(t => t.status === 'completed') || []
    
    const totalPnl = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winningTrades = completedTrades.filter(t => (t.pnl || 0) > 0).length
    const winRate = completedTrades.length > 0 ? (winningTrades / completedTrades.length) * 100 : 0
    const avgPnl = completedTrades.length > 0 ? totalPnl / completedTrades.length : 0
    const maxWin = Math.max(0, ...completedTrades.map(t => t.pnl || 0))
    const maxLoss = Math.min(0, ...completedTrades.map(t => t.pnl || 0))
    const unrealizedPnl = (positions || []).reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0)

    // 按日统计
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTrades = completedTrades.filter(t => 
        t.created_at && t.created_at.startsWith(dateStr)
      )
      
      const pnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
      
      dailyStats.push({
        date: dateStr,
        pnl,
        trades: dayTrades.length,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPnl,
        totalPnlPercent: totalPnl > 0 ? (totalPnl / (totalPnl - avgPnl * completedTrades.length)) * 100 : 0,
        winRate: winRate.toFixed(2),
        avgPnl,
        maxWin,
        maxLoss,
        unrealizedPnl,
        totalTrades: completedTrades.length,
        openPositions: (positions || []).length,
        winningTrades,
        losingTrades: completedTrades.length - winningTrades,
        dailyStats,
        period,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
