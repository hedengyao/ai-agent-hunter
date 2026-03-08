/**
 * 测试 Supabase 数据库连接
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('🔍 测试 Supabase 连接...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? supabaseKey.slice(0, 20) + '...' : '未配置')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // 测试查询 agents 表
    const { data, error } = await supabase.from('agents').select('*').limit(5)
    
    if (error) {
      console.error('❌ 查询失败:', error.message)
      return false
    }
    
    console.log('✅ 连接成功！')
    console.log('📊 当前 Agent 数量:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('📋 最新 Agent:')
      data.forEach((agent: any) => {
        console.log(`  - ${agent.name} (${agent.status})`)
      })
    }
    
    return true
  } catch (error: any) {
    console.error('❌ 连接失败:', error.message)
    return false
  }
}

testConnection()
