import { NextResponse } from 'next/server'
import { okxFetch } from '@/lib/okx-api'

/**
 * 测试 OKX API 连接
 */
export async function GET() {
  try {
    console.log('🔍 测试 OKX API 连接...')
    console.log('API Key:', process.env.OKX_API_KEY?.slice(0, 8) + '...')
    
    // 测试 1: 获取代币信息
    console.log('💰 测试 1: 获取代币信息...')
    try {
      const tokens = await okxFetch<any[]>('POST', '/api/v6/dex/market/token/basic-info', [
        { chainIndex: '196', tokenContractAddress: '0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd' }
      ])
      console.log('✅ Tokens:', tokens?.length || 0)
      
      return NextResponse.json({
        success: true,
        data: {
          tokens: tokens?.length || 0,
          sample: tokens?.[0] || null,
        },
        message: 'OKX API 连接成功！',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error('❌ Tokens 测试失败:', error.message)
      throw error
    }
  } catch (error: any) {
    console.error('❌ OKX API 测试失败:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: null,
    }, { status: 500 })
  }
}
