import { NextResponse } from 'next/server'
import { getSignals as fetchSignals, getSignalDetail as fetchDetail } from '@/lib/signals'

// GET - 获取信号列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const signals = await fetchSignals(limit)
    
    return NextResponse.json({
      success: true,
      data: signals,
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
