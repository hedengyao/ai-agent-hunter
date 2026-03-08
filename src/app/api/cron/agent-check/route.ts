import { NextRequest, NextResponse } from 'next/server'
import { agentManager } from '@/lib/agent-runner'

/**
 * 定时检查 Agent 状态
 * 每分钟执行一次
 */
export async function GET(request: NextRequest) {
  try {
    // 验证 Cron 密钥（生产环境）
    const authHeader = request.headers.get('authorization') || ''
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查所有运行中的 Agent
    const states = agentManager.getAllStates()
    const runningAgents = states.filter(s => s.status === 'running')

    console.log(`🔍 Cron: 检查 ${runningAgents.length} 个运行中的 Agent`)

    // 重启异常的 Agent
    for (const state of runningAgents) {
      const agent = agentManager.getAgent(state.id)
      if (!agent) {
        console.log(`⚠️ Agent ${state.id} 异常，尝试重启`)
        // 这里可以添加重启逻辑
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAgents: states.length,
        runningAgents: runningAgents.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Cron 执行失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
