/**
 * Qwen AI 分析集成 - 真实分析
 */

interface AnalysisRequest {
  tokenSymbol: string
  tokenAddress: string
  chainId: string
  signalData: any
}

interface AnalysisResponse {
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell'
  confidence: number
  analysis: string
  risks: string[]
  targets: string[]
  stopLoss?: string
}

export async function analyzeToken(data: AnalysisRequest): Promise<AnalysisResponse> {
  // 必须配置 Qwen API Key
  const apiKey = process.env.QWEN_API_KEY?.replace(/^"|"$/g, '') // 移除引号
  
  if (!apiKey || apiKey === 'your-qwen-api-key') {
    throw new Error('Qwen API Key 未配置！请在 .env.local 中配置 QWEN_API_KEY')
  }
  
  return await callQwenAPI(data, apiKey)
}

async function callQwenAPI(data: AnalysisRequest, apiKey: string): Promise<AnalysisResponse> {
  const prompt = `你是一个专业的加密货币交易分析师。分析代币 ${data.tokenSymbol} (${data.tokenAddress})：

信号强度：${data.signalData.signalStrength}/100
信号类型：${data.signalData.signalType || 'unknown'}
24h 价格变化：${data.signalData.priceChange24h || 0}%
市值：${data.signalData.marketCap || 'unknown'}
流动性：${data.signalData.liquidity || 'unknown'}
叙事：${data.signalData.narrative || 'unknown'}

请返回严格的 JSON 格式（不要其他文字）：
{
  "recommendation": "strong_buy" 或 "buy" 或 "hold" 或 "sell",
  "confidence": 0-100 的数字,
  "analysis": "简短分析",
  "risks": ["风险 1", "风险 2"],
  "targets": ["目标 1", "目标 2"]
}`

  console.log('🤖 调用 Qwen API:', data.tokenSymbol)
  console.log('📝 API Key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`)

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: '你是一个专业的加密货币交易分析师，只返回 JSON 格式的分析结果。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    console.log('📡 Qwen API 响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Qwen API 错误:', response.status, errorText)
      throw new Error(`Qwen API 错误 (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('📝 Qwen 响应:', JSON.stringify(result, null, 2))
    
    // 解析返回的内容
    const content = result.choices?.[0]?.message?.content || '{}'
    
    try {
      const parsed = JSON.parse(content)
      
      return {
        recommendation: parsed.recommendation || 'hold',
        confidence: parsed.confidence || 50,
        analysis: parsed.analysis || '无分析',
        risks: parsed.risks || [],
        targets: parsed.targets || [],
      }
    } catch (parseError) {
      console.error('JSON 解析失败:', content, parseError)
      throw new Error('AI 返回格式错误，无法解析 JSON')
    }
  } catch (error: any) {
    console.error('Qwen API 调用失败:', error.message)
    throw error
  }
}
