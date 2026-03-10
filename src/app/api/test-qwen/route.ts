import { NextResponse } from 'next/server'

// GET - 测试 Qwen API Key
export async function GET() {
  const apiKey = process.env.QWEN_API_KEY
  
  console.log('🔍 测试 Qwen API Key')
  console.log('📝 API Key:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : '未配置')
  
  try {
    // 测试 API Key 是否有效
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      })
    })
    
    console.log('📡 响应状态:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        message: 'API Key 无效'
      })
    }
    
    const result = await response.json()
    console.log('✅ 响应成功:', result)
    
    return NextResponse.json({
      success: true,
      message: 'API Key 有效！',
      response: result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
