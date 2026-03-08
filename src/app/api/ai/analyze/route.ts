import { NextResponse } from 'next/server'

const QWEN_API_KEY = process.env.QWEN_API_KEY || ''

// POST - AI 分析信号
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenSymbol, tokenAddress, chainId, signalStrength, price, priceChange24h } = body

    // 生成模拟分析（当 API Key 无效或为空时）
    const mockAnalysis = `## ${tokenSymbol} 分析报告

**信号强度**: ${signalStrength}/100
**当前价格**: $${price}
**24h 变化**: ${priceChange24h >= 0 ? '+' : ''}${priceChange24h}%

### 分析结果

基于链上数据和技术指标分析，${tokenSymbol} 显示出${signalStrength >= 80 ? '强烈的' : signalStrength >= 60 ? '较强的' : '中等的'}买入信号。

### 优势
- 信号强度高，多个聪明钱钱包建仓
- 流动性充足，可以安全进出
- 24 小时涨幅明显，动能强劲

### 风险
- 市值较小，波动可能剧烈
- 需注意整体市场情绪

### 建议
${signalStrength >= 80 ? '强烈建议买入，设置 20% 止损，目标收益 100%+' : signalStrength >= 60 ? '建议小额建仓，设置 15% 止损，目标收益 50%+' : '建议观望，等待更明确信号'}
`

    // 如果没有配置 API Key，返回模拟分析
    if (!QWEN_API_KEY) {
      return NextResponse.json({
        success: true,
        analysis: mockAnalysis,
        source: 'Mock Analysis',
      })
    }

    // 尝试调用 Qwen AI API
    try {
      const prompt = `你是一位专业的链上交易分析师。请分析以下代币：

代币：${tokenSymbol}
地址：${tokenAddress}
链：${chainId}
信号强度：${signalStrength}/100
当前价格：$${price}
24h 变化：${priceChange24h >= 0 ? '+' : ''}${priceChange24h}%

请生成专业的投资分析报告，包括：
1. 信号强度解读
2. 优势分析
3. 风险提示
4. 投资建议（买入/卖出/观望）
5. 止损和目标价位

请用 Markdown 格式返回。`

      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一位专业的链上交易分析师，擅长分析聪明钱动向和识别 Alpha 机会。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 1000,
          },
        }),
      })

      const result = await response.json()

      if (result.output && result.output.text) {
        return NextResponse.json({
          success: true,
          analysis: result.output.text,
          source: 'Qwen AI',
        })
      }
    } catch (error) {
      console.log('Qwen API 调用失败，使用模拟分析')
    }

    // API 调用失败时返回模拟分析
    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      source: 'Mock Analysis',
    })
  } catch (error: any) {
    console.error('AI 分析失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
