import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取今日交易（最多 10 条）
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

    // 获取今天的日期范围
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 获取今日交易
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: trades || [],
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
