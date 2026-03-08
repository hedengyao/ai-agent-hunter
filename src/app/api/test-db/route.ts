import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  try {
    console.log('🔍 测试数据库连接...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey ? supabaseKey.slice(0, 20) + '...' : '未配置')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 测试查询
    const { data: agents, error } = await supabase.from('agents').select('*')
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        url: supabaseUrl,
        keyConfigured: !!supabaseKey,
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: agents?.length || 0,
      data: agents,
      url: supabaseUrl,
      keyConfigured: !!supabaseKey,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      url: supabaseUrl,
      keyConfigured: !!supabaseKey,
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 测试插入
    const { data, error } = await supabase.from('agents').insert({
      name: '测试 Agent ' + Date.now(),
      user_id: 'test-user',
      status: 'stopped',
      min_signal_strength: 85,
    }).select()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
