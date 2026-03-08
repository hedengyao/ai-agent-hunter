#!/bin/bash

# OKX API 最终测试

OKX_API_KEY="34427e21-40ac-48cd-bc97-e9f17eedaaca"
OKX_SECRET_KEY="02C6DF2C79F8E7F81EB895C7A6235C0B"
OKX_PASSPHRASE="Hedengyao2878."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

echo "📡 测试 OKX API - 代币信息"
echo "Timestamp: ${TIMESTAMP}"

# 生成签名
BODY='[{"chainIndex":"196","tokenContractAddress":"0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd"}]'
METHOD="POST"
PATH_URL="/api/v6/dex/market/token/basic-info"
SIGNATURE=$(echo -n "${TIMESTAMP}${METHOD}${PATH_URL}${BODY}" | openssl dgst -sha256 -hmac "${OKX_SECRET_KEY}" -binary | base64)

echo "Signature: ${SIGNATURE}"
echo ""

curl -s -X POST "https://web3.okx.com${PATH_URL}" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  -d "${BODY}" \
  | python3 -m json.tool 2>/dev/null
