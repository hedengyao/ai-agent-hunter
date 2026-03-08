import { NextResponse } from 'next/server'

/**
 * 测试 Qwen AI API 连接
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt } = body

    console.log('🤖 测试 Qwen AI API...')
    console.log('API Key:', process.env.QWEN_API_KEY?.slice(0, 8) + '...')

    if (!process.env.QWEN_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Qwen API Key 未配置',
      }, { status: 500 })
    }

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一位专业的链上交易分析师。',
            },
            {
              role: 'user',
              content: prompt || '分析代币 TITAN 的投资价值，信号强度 92 分，24h 涨幅 156%',
            },
          ],
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 500,
        },
      }),
    })

    console.log('📊 Qwen API Response status:', response.status)

    const result = await response.json()
    console.log('📊 Qwen API Response:', result)

    if (result.output && result.output.text) {
      return NextResponse.json({
        success: true,
        data: {
          analysis: result.output.text,
          model: 'qwen-plus',
        },
        message: 'Qwen AI 连接成功！',
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error(result.message || 'Qwen API 返回空结果')
    }
  } catch (error: any) {
    console.error('❌ Qwen AI 测试失败:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
