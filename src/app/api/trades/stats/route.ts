import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取交易统计
export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取所有交易
    const { data: trades } = await supabase
      .from('trades')
      .select('status, pnl')

    // 统计数据
    const totalTrades = trades?.length || 0
    const successfulTrades = trades?.filter(t => t.status === 'completed').length || 0
    const failedTrades = trades?.filter(t => t.status === 'failed').length || 0
    const totalPnl = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        totalTrades,
        successfulTrades,
        failedTrades,
        totalPnl,
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
