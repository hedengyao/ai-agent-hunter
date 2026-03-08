import { NextResponse } from 'next/server'
import https from 'https'
import crypto from 'crypto'

const OKX_API_KEY = process.env.OKX_API_KEY || ''
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY || ''
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE || ''

function okxRequest(path: string, method: string = 'GET', body: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    // 生成时间戳（毫秒精度）
    const timestamp = new Date().toISOString().replace(/\.\d+Z$/, '.000Z')
    const bodyStr = body ? JSON.stringify(body) : ''
    
    // 生成签名
    const message = timestamp + method + path + bodyStr
    const signature = crypto
      .createHmac('sha256', OKX_SECRET_KEY)
      .update(message)
      .digest('base64')

    const options = {
      hostname: 'web3.okx.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'OK-ACCESS-KEY': OKX_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-PASSPHRASE': OKX_PASSPHRASE,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.code === '0') {
            resolve(result.data)
          } else {
            reject(new Error(`OKX API Error: ${result.code} - ${result.msg}`))
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`))
        }
      })
    })

    req.on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (bodyStr) {
      req.write(bodyStr)
    }
    req.end()
  })
}

export async function GET() {
  try {
    console.log('🔍 测试 OKX API (https 模块)...')
    
    // 测试：获取代币信息
    const tokens = await okxRequest(
      '/api/v6/dex/market/token/basic-info',
      'POST',
      [{ chainIndex: '196', tokenContractAddress: '0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd' }]
    )
    
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
    console.error('❌ OKX API 测试失败:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: null,
    }, { status: 500 })
  }
}
