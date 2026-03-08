import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import crypto from 'crypto'

const OKX_API_KEY = process.env.OKX_API_KEY || ''
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY || ''
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE || ''

/**
 * 使用 curl 调用 OKX API
 */
function callOKXAPI(path: string, method: string = 'GET', body: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/\.\d+Z$/, '.000Z')
    const bodyStr = body ? JSON.stringify(body) : ''
    
    const message = timestamp + method + path + bodyStr
    const signature = crypto
      .createHmac('sha256', OKX_SECRET_KEY)
      .update(message)
      .digest('base64')

    let curlCommand = `curl -s -X ${method} "https://web3.okx.com${path}" \\
      -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \\
      -H "OK-ACCESS-SIGN: ${signature}" \\
      -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \\
      -H "OK-ACCESS-TIMESTAMP: ${timestamp}" \\
      -H "Content-Type: application/json"`
    
    if (bodyStr) {
      curlCommand += ` -d '${bodyStr}'`
    }

    try {
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 15000 })
      const data = JSON.parse(result)
      
      if (data.code === '0') {
        resolve(data.data)
      } else {
        reject(new Error(`${data.code} - ${data.msg}`))
      }
    } catch (error: any) {
      reject(new Error(error.message))
    }
  })
}

// POST - 获取 Swap 报价
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chainId, fromToken, toToken, amount, slippage = 1 } = body

    if (!chainId || !fromToken || !toToken || !amount) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
      }, { status: 400 })
    }

    // 获取 Swap 报价
    const params = new URLSearchParams({
      chainIndex: chainId,
      fromTokenAddress: fromToken.toLowerCase(),
      toTokenAddress: toToken.toLowerCase(),
      amount,
      slippage: slippage.toString(),
    })
    
    const quote = await callOKXAPI(`/api/v6/dex/aggregator/quote?${params}`, 'GET')
    
    return NextResponse.json({
      success: true,
      data: quote,
      message: '获取报价成功',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Swap 报价失败:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: null,
    }, { status: 500 })
  }
}
