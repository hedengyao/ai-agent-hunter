import { NextResponse } from 'next/server'
import { getSignalDetail as fetchDetail } from '@/lib/signals'

// GET - 获取信号详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const signal = await fetchDetail(params.id)
    
    if (!signal) {
      return NextResponse.json({
        success: false,
        error: 'Signal not found',
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: signal,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
