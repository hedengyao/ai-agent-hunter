import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startAgentJob, stopAgent } from '@/lib/agent-scheduler-v2'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取所有 Agent
export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
        data: [],
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false })

    if (error) {
      console.error('获取 Agent 失败:', error.message)
      return NextResponse.json({
        success: false,
        error: error.message,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'Database',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
    }, { status: 500 })
  }
}

// POST - 创建新 Agent
export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const body = await request.json()
    const { name, config, autoStart, walletAddress } = body

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Agent 名称不能为空',
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 根据钱包地址获取用户 ID
    let userId = 'ad95b1cc-dbb0-4d85-b132-404d27e28a08' // 默认测试用户 ID
    
    if (walletAddress) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()
      
      if (user) {
        userId = user.id
      } else {
        // 用户不存在，先创建用户
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress.toLowerCase(),
            total_pnl: 0,
            total_trades: 0,
          })
          .select('id')
          .single()
        
        if (!userError && newUser) {
          userId = newUser.id
        }
      }
    }

    // 创建 Agent
    const { data, error } = await supabase.from('agents').insert({
      name: name,
      user_id: userId,
      status: autoStart ? 'running' : 'stopped',
      min_signal_strength: config?.minSignalStrength || 85,
      max_position: config?.maxPosition || 10,
      take_profit: config?.takeProfit || 100,
      stop_loss: config?.stopLoss || 20,
      gas_limit: config?.gasLimit || 50,
      auto_execute: config?.autoExecute !== false,
      win_rate: 0,
      total_pnl: 0,
      total_trades: 0,
    }).select()

    if (error) {
      console.error('创建 Agent 失败:', error.message)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    // 如果自动启动，启动监控任务
    if (autoStart && data && data[0]) {
      // TODO: 启动 Agent 监控
      console.log('🚀 自动启动 Agent:', data[0].name)
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Agent 创建成功',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

// PATCH - 更新 Agent 状态（启动/停止）
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { agentId, status, action } = body

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID 不能为空',
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (status) {
      // 更新状态
      const { data, error } = await supabase
        .from('agents')
        .update({ status })
        .eq('id', agentId)
        .select()

      if (error) {
        return NextResponse.json({
          success: false,
          error: error.message,
        })
      }

      // 如果启动，启动监控任务
      if (status === 'running') {
        console.log('🚀 启动 Agent:', agentId)
        // TODO: 启动监控
      } else if (status === 'stopped') {
        console.log('⏹️ 停止 Agent:', agentId)
        await stopAgent(agentId)
      }

      return NextResponse.json({
        success: true,
        data: data[0],
        message: `Agent 已${status === 'running' ? '启动' : '停止'}`,
      })
    }

    return NextResponse.json({
      success: false,
      error: '缺少 status 参数',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
