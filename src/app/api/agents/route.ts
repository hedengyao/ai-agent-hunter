import { NextResponse } from 'next/server'
import { agentManager, type AgentConfig } from '@/lib/agent-runner'
import { createAgent, getAgents as getAgentsFromDB, updateAgentStatus } from '@/lib/supabase'

// 存储 Agent 配置 (内存缓存)
const agentConfigs = new Map<string, AgentConfig>()

// GET - 获取所有 Agent 状态
export async function GET() {
  try {
    // 优先从数据库获取
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const dbAgents = await getAgentsFromDB('demo-user')
        const states = agentManager.getAllStates()
        
        return NextResponse.json({
          success: true,
          data: dbAgents.map(dbAgent => {
            const state = states.find(s => s.id === dbAgent.id)
            return {
              ...state,
              config: {
                name: dbAgent.name,
                ...dbAgent.config,
              },
            }
          }),
        })
      } catch (dbError) {
        console.log('数据库不可用，使用内存数据')
      }
    }
    
    // 降级到内存数据
    const states = agentManager.getAllStates()
    const configs = Array.from(agentConfigs.values())
    
    return NextResponse.json({
      success: true,
      data: states.map(state => ({
        ...state,
        config: configs.find(c => c.id === state.id),
      })),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

// POST - 创建新 Agent
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, params } = body

    const config: AgentConfig = {
      id: `agent-${Date.now()}`,
      name: name || '新 Agent',
      minSignalStrength: params?.minSignalStrength || 85,
      narrativeFilter: params?.narrativeFilter || ['hot'],
      maxPosition: params?.maxPosition || 10,
      takeProfit: params?.takeProfit || 100,
      stopLoss: params?.stopLoss || 20,
      gasLimit: params?.gasLimit || 50,
      autoExecute: params?.autoExecute ?? true,
    }

    // 尝试存储到数据库
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        await createAgent({
          name: config.name,
          user_id: 'demo-user',
          config: {
            minSignalStrength: config.minSignalStrength,
            narrativeFilter: config.narrativeFilter,
            maxPosition: config.maxPosition,
            takeProfit: config.takeProfit,
            stopLoss: config.stopLoss,
            gasLimit: config.gasLimit,
            autoExecute: config.autoExecute,
          },
        })
      } catch (dbError) {
        console.log('数据库存储失败，使用内存存储')
      }
    }

    // 创建并启动 Agent
    const agent = agentManager.createAgent(config)
    agentConfigs.set(config.id, config)
    
    if (config.autoExecute) {
      await agent.start()
    }

    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        status: config.autoExecute ? 'running' : 'stopped',
      },
      message: 'Agent 创建成功',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
