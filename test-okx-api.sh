#!/bin/bash

# OKX API 调试脚本

OKX_API_KEY="34427e21-40ac-48cd-bc97-e9f17eedaaca"
OKX_SECRET_KEY="02C6DF2C79F8E7F81EB895C7A6235C0B"
OKX_PASSPHRASE="Hedengyao2878."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
METHOD="GET"
PATH_URL="/api/v6/dex/signals?limit=5"

# 生成签名
SIGNATURE=$(echo -n "${TIMESTAMP}${METHOD}${PATH_URL}" | openssl dgst -sha256 -hmac "${OKX_SECRET_KEY}" -binary | base64)

echo "📡 测试 OKX API..."
echo "Timestamp: ${TIMESTAMP}"
echo "Signature: ${SIGNATURE}"
echo ""

# 测试 1: web3.okx.com
echo "🔍 测试 1: https://web3.okx.com"
curl -s -X GET "https://web3.okx.com${PATH_URL}" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool 2>/dev/null | head -20

echo ""
echo "🔍 测试 2: https://www.okx.com"
# 测试 2: www.okx.com
curl -s -X GET "https://www.okx.com${PATH_URL}" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  | python3 -m json.tool 2>/dev/null | head -20

echo ""
echo "🔍 测试 3: OKX 公共 API（无认证）"
curl -s -X GET "https://www.okx.com/api/v5/public/time" | python3 -m json.tool 2>/dev/null
