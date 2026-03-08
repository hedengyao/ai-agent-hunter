#!/bin/bash

# OKX API 成功测试

OKX_API_KEY="34427e21-40ac-48cd-bc97-e9f17eedaaca"
OKX_SECRET_KEY="02C6DF2C79F8E7F81EB895C7A6235C0B"
OKX_PASSPHRASE="Hedengyao2878."

# ISO8601 格式的时间戳（毫秒精度）
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "📡 测试 OKX API - 代币信息"
echo "Timestamp: ${TIMESTAMP}"

# 生成签名
BODY='[{"chainIndex":"196","tokenContractAddress":"0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd"}]'
METHOD="POST"
PATH_URL="/api/v6/dex/market/token/basic-info"
SIGNATURE=$(echo -n "${TIMESTAMP}${METHOD}${PATH_URL}${BODY}" | openssl dgst -sha256 -hmac "${OKX_SECRET_KEY}" -binary | base64)

echo "Signature: ${SIGNATURE}"
echo ""

RESULT=$(curl -s -X POST "https://web3.okx.com${PATH_URL}" \
  -H "OK-ACCESS-KEY: ${OKX_API_KEY}" \
  -H "OK-ACCESS-SIGN: ${SIGNATURE}" \
  -H "OK-ACCESS-PASSPHRASE: ${OKX_PASSPHRASE}" \
  -H "OK-ACCESS-TIMESTAMP: ${TIMESTAMP}" \
  -H "Content-Type: application/json" \
  -d "${BODY}")

echo "Result:"
echo "${RESULT}" | python3 -m json.tool 2>/dev/null

# 检查是否成功
if echo "${RESULT}" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('code')=='0' else 1)" 2>/dev/null; then
    echo ""
    echo "✅ OKX API 调用成功！"
else
    echo ""
    echo "❌ OKX API 调用失败"
fi
