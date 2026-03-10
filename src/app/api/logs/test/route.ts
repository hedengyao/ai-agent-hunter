import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// POST - 创建测试日志
export async function POST() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取测试用户
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', '0xcd9399a2ad325071f4596f8adcfc95427c0087a1')
      .single()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '测试用户不存在',
      })
    }

    // 获取测试 Agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'running')
      .single()

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: '没有运行中的 Agent',
      })
    }

    // 尝试创建日志
    try {
      const { data: log, error } = await supabase.from('agent_logs').insert({
        agent_id: agent.id,
        user_id: user.id,
        level: 'info',
        action: 'test',
        message: '这是一条测试日志 - ' + new Date().toLocaleString(),
        data: { test: true },
      }).select().single()

      if (error) {
        if (error.code === '42P01') {
          return NextResponse.json({
            success: false,
            error: 'agent_logs 表不存在！请先在 Supabase 执行 supabase-agent-logs.sql 创建表',
            hint: '请在 Supabase SQL Editor 中执行建表 SQL',
          })
        }
        throw error
      }

      return NextResponse.json({
        success: true,
        data: log,
        message: '测试日志创建成功！现在可以刷新日志页面查看。',
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `创建日志失败：${error.message}`,
        hint: '请确保已在 Supabase 执行 supabase-agent-logs.sql 创建表',
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

// GET - 检查表是否存在
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { error } = await supabase.from('agent_logs').select('id').limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          exists: false,
          message: 'agent_logs 表不存在！请执行以下步骤：\n1. 打开 Supabase SQL Editor\n2. 粘贴并执行 supabase-agent-logs.sql 的内容\n3. 刷新页面',
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      exists: true,
      message: 'agent_logs 表存在，可以正常使用',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
