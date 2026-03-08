import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { okxFetch } from '@/lib/okx-api'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET - 获取信号列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // 尝试从 OKX API 获取真实信号
    try {
      const okxSignals: any = await okxFetch('GET', `/api/v6/dex/signals?limit=${limit}`)
      
      if (okxSignals && okxSignals.length > 0) {
        // 保存到数据库
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        for (const signal of okxSignals) {
          try {
            await supabase.from('signals').insert({
              token_symbol: signal.tokenSymbol,
              token_address: signal.tokenAddress,
              chain_id: signal.chainId,
              signal_strength: signal.signalStrength,
              signal_type: signal.signalType,
              price: signal.priceInfo?.price || '0',
              price_change_24h: signal.priceInfo?.priceChange24h || 0,
              market_cap: signal.priceInfo?.marketCap || '0',
              liquidity: signal.priceInfo?.liquidity || '0',
              narrative: signal.narrative,
              triggered_wallets: signal.triggeredWallets || [],
            })
          } catch (error) {
            console.log('保存信号失败:', error)
          }
        }
        
        return NextResponse.json({
          success: true,
          data: okxSignals,
          source: 'OKX API',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (okxError) {
      console.log('OKX API 失败，从数据库获取')
    }

    // 从数据库获取
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'Database',
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
