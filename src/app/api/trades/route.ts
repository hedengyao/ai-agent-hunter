import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取交易列表（分页）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 未配置',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取交易记录
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // 计算总页数
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })

    const totalPages = count ? Math.ceil(count / limit) : 1

    return NextResponse.json({
      success: true,
      data: trades || [],
      page,
      totalPages,
      total: count || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
