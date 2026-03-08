/**
 * Qwen AI 分析集成
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
  try {
    if (process.env.QWEN_API_KEY) {
      return await callQwenAPI(data)
    }
    return getMockAnalysis(data)
  } catch (error) {
    console.error('AI analysis error:', error)
    return getMockAnalysis(data)
  }
}

async function callQwenAPI(data: AnalysisRequest): Promise<AnalysisResponse> {
  const prompt = `分析代币 ${data.tokenSymbol}:
信号强度：${data.signalData.signalStrength}
聪明钱：${data.signalData.triggeredWallets?.filter((w:any) => w.type === 'smart_money').length || 0}个
KOL: ${data.signalData.triggeredWallets?.filter((w:any) => w.type === 'kol').length || 0}个
巨鲸：${data.signalData.triggeredWallets?.filter((w:any) => w.type === 'whale').length || 0}个

返回 JSON: {"recommendation":"strong_buy/buy/hold/sell","confidence":0-100,"analysis":"分析","risks":[],"targets":[]}`

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      input: { messages: [{ role: 'user', content: prompt }] },
      parameters: { temperature: 0.7, max_tokens: 500 }
    })
  })

  const result = await response.json()
  return JSON.parse(result.output?.text || '{}')
}

function getMockAnalysis(data: AnalysisRequest): AnalysisResponse {
  const strength = data.signalData.signalStrength
  let recommendation: AnalysisResponse['recommendation'] = 'hold'
  let confidence = 50

  if (strength >= 90) { recommendation = 'strong_buy'; confidence = 90 }
  else if (strength >= 85) { recommendation = 'buy'; confidence = 80 }
  else if (strength >= 80) { recommendation = 'buy'; confidence = 70 }

  return {
    recommendation,
    confidence,
    analysis: `## 分析摘要\n\n信号强度${strength}，聪明钱积极建仓。\n\n## 建议\n\n${recommendation === 'strong_buy' ? '强烈建议买入' : recommendation === 'buy' ? '建议买入' : '观望'}`,
    risks: ['市值较小，波动可能剧烈', '流动性风险'],
    targets: ['短期：+50%', '中期：+100%'],
    stopLoss: '-20%'
  }
}
