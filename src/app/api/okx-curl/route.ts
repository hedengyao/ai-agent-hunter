import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

/**
 * 使用 curl 通过代理调用 OKX API
 * 这是最可靠的方式，因为 curl 自动使用系统代理
 */

const OKX_API_KEY = process.env.OKX_API_KEY || ''
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY || ''
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE || ''

export async function GET() {
  try {
    console.log('🔍 使用 curl 调用 OKX API...')
    
    // 生成时间戳
    const timestamp = new Date().toISOString().replace(/\.\d+Z$/, '.000Z')
    const path = '/api/v6/dex/market/token/basic-info'
    const method = 'POST'
    const body = '[{"chainIndex":"196","tokenContractAddress":"0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd"}]'
    
    // 生成签名（使用 Node.js crypto）
    const crypto = require('crypto')
    const message = timestamp + method + path + body
    const signature = crypto
      .createHmac('sha256', OKX_SECRET_KEY)
      .update(message)
      .digest('base64')

    // 构建 curl 命令
    const curlCommand = `curl -s -X ${method} "https://web3.okx.com${path}" \\
      -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \\
      -H "OK-ACCESS-SIGN: ${signature}" \\
      -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \\
      -H "OK-ACCESS-TIMESTAMP: ${timestamp}" \\
      -H "Content-Type: application/json" \\
      -d '${body}'`

    console.log('📡 执行 curl 命令...')
    
    // 执行 curl 命令
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 15000 })
    
    console.log('📊 结果:', result.substring(0, 100))
    
    const data = JSON.parse(result)
    
    if (data.code === '0') {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: 'OKX API 调用成功！',
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `${data.code} - ${data.msg}`,
        data: null,
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ OKX API 调用失败:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: null,
    }, { status: 500 })
  }
}
