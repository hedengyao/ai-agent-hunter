import { NextResponse } from 'next/server'
import { startAllAgents, stopAgent, getAgentJobsStatus, isAgentRunning } from '@/lib/agent-scheduler-v2'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取监控状态
export async function GET() {
  try {
    const status = getAgentJobsStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        isRunning: status.running > 0,
        runningCount: status.running,
        totalCount: status.total,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

// POST - 启动监控
export async function POST() {
  try {
    await startAllAgents()
    
    return NextResponse.json({
      success: true,
      message: 'Agent 监控已启动',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

// DELETE - 停止所有监控
export async function DELETE() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 获取所有运行中的 Agent
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .eq('status', 'running')
    
    // 停止每个 Agent
    if (agents) {
      for (const agent of agents) {
        await stopAgent(agent.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '所有 Agent 监控已停止',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
