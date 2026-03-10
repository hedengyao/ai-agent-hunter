import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取日志列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!wallet && !agentId) {
      return NextResponse.json({
        success: false,
        error: '缺少钱包地址或 Agent ID',
      }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
        data: [],
        trades: [],
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取用户 ID
    let userId: string | null = null
    if (wallet) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', wallet.toLowerCase())
        .single()

      if (user) {
        userId = user.id
      }
    }

    // 获取 Agent 日志（如果表存在）
    let logs: any[] = []
    try {
      let query = supabase.from('agent_logs').select('*')

      if (agentId) {
        query = query.eq('agent_id', agentId)
      } else if (userId) {
        const { data: agents } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', userId)

        if (agents && agents.length > 0) {
          const agentIds = agents.map(a => a.id)
          query = query.in('agent_id', agentIds)
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        if (error.code === '42P01') {
          console.log('agent_logs 表不存在，这是正常的')
          logs = []
        } else {
          throw error
        }
      } else {
        logs = data || []
      }
    } catch (error: any) {
      console.log('获取日志失败（表可能不存在）:', error.message)
      logs = []
    }

    // 同时获取交易记录
    let tradesQuery = supabase.from('trades').select('*')

    if (agentId) {
      tradesQuery = tradesQuery.eq('agent_id', agentId)
    } else if (userId) {
      tradesQuery = tradesQuery.eq('user_id', userId)
    }

    const { data: trades, error: tradesError } = await tradesQuery
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tradesError) {
      console.error('获取交易记录失败:', tradesError)
    }

    return NextResponse.json({
      success: true,
      data: logs,
      trades: trades || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('获取日志失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
      trades: [],
    }, { status: 500 })
  }
}

// POST - 创建日志
export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const body = await request.json()
    const { agentId, userId, level, action, message, data } = body

    if (!agentId || !level || !message) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: log, error } = await supabase.from('agent_logs').insert({
      agent_id: agentId,
      user_id: userId,
      level: level || 'info',
      action: action || '',
      message: message,
      data: data || {},
    }).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: log,
    })
  } catch (error: any) {
    console.error('创建日志失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
