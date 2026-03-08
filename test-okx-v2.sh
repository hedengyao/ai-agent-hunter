#!/bin/bash

# OKX API 调试脚本 v2
# 基于官方文档

OKX_API_KEY="34427e21-40ac-48cd-bc97-e9f17eedaaca"
OKX_SECRET_KEY="02C6DF2C79F8E7F81EB895C7A6235C0B"
OKX_PASSPHRASE="Hedengyao2878."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

echo "📡 测试 OKX OnchainOS API..."
echo "Base URL: https://web3.okx.com"
echo ""

# 测试 1: 不带签名的公共接口
echo "🔍 测试 1: 公共接口（无认证）"
curl -s -X GET "https://web3.okx.com/api/v6/dex/signals?limit=5" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool 2>/dev/null | head -30

echo ""
echo "🔍 测试 2: 带签名的接口"
# 生成签名
PATH_URL="/api/v6/dex/signals?limit=5"
METHOD="GET"
SIGNATURE=$(echo -n "${TIMESTAMP}${METHOD}${PATH_URL}" | openssl dgst -sha256 -hmac "${OKX_SECRET_KEY}" -binary | base64)

curl -s -X GET "https://web3.okx.com${PATH_URL}" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool 2>/dev/null | head -30

echo ""
echo "🔍 测试 3: 使用 POST 方法"
curl -s -X POST "https://web3.okx.com/api/v6/dex/signals" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  -d '{"limit":5}' \
  | python3 -m json.tool 2>/dev/null | head -30

echo ""
echo "🔍 测试 4: 测试代币信息 API"
curl -s -X POST "https://web3.okx.com/api/v6/dex/market/token/basic-info" \
  -H "Content-Type: application/json" \
  -d '[{"chainIndex":"196","tokenContractAddress":"0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd"}]' \
  | python3 -m json.tool 2>/dev/null | head -30
