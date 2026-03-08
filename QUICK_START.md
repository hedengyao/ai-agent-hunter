# 🚀 AI Agent Hunter - 快速启动指南

> 5 分钟快速上手，开始你的链上 Alpha 狩猎之旅！

---

## ⚡ 快速开始 (5 分钟)

### 1. 克隆项目 (1 分钟)

```bash
git clone https://github.com/[yourusername]/ai-agent-hunter.git
cd ai-agent-hunter
```

### 2. 安装依赖 (2 分钟)

```bash
npm install
```

### 3. 配置环境变量 (1 分钟)

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`:

```env
# OKX API (在 https://web3.okx.com/onchain-os 获取)
OKX_API_KEY="your-api-key"
OKX_SECRET_KEY="your-secret-key"
OKX_PASSPHRASE="your-passphrase"

# Qwen AI (可选，在 https://dashscope.console.aliyun.com/ 获取)
QWEN_API_KEY="your-qwen-key"

# Supabase (可选，在 https://supabase.com 获取)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. 启动项目 (1 分钟)

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🎯 第一次使用

### 1. 连接钱包

1. 点击右上角"连接钱包"
2. 选择 OKX Wallet 或 MetaMask
3. 签名授权
4. 连接成功

### 2. 创建第一个 Agent

1. 点击"创建 Agent"
2. 选择"平衡狩猎"策略
3. 调整参数 (可选)
4. 点击"创建 Agent"
5. Agent 开始运行

### 3. 查看信号

1. 点击"信号广场"
2. 浏览实时信号
3. 点击信号查看详情
4. 查看 AI 分析报告

### 4. 查看收益

1. 点击"狩猎日志"
2. 查看交易记录
3. 查看统计数据
4. 查看收益图表

---

## 📖 核心功能

### 🤖 AI Agent

**是什么**: 24 小时自动狩猎的 AI 机器人

**能做什么**:
- 监控 500+ 聪明钱钱包
- 自动发现 Alpha 信号
- AI 分析信号质量
- 自动执行交易
- 自动止盈止损

**如何创建**:
1. 进入"创建 Agent"页面
2. 选择策略模板
3. 调整参数
4. 启动 Agent

### 📊 信号系统

**信号来源**:
- 🧠 聪明钱钱包
- 📢 KOL 钱包
- 🐋 巨鲸钱包
- ✨ 多源收敛

**信号强度**:
- 90-100: 极强信号
- 80-89: 强信号
- 70-79: 中等信号
- <70: 弱信号

### 🧠 AI 分析

**分析内容**:
- 信号强度评估
- 风险评估
- 投资建议
- 目标价位
- 止损建议

**AI 模型**: Qwen 3.5 Plus

---

## 🔧 高级配置

### 自定义策略参数

```typescript
{
  minSignalStrength: 85,    // 最小信号强度
  narrativeFilter: ['hot'], // 叙事过滤
  maxPosition: 10,          // 最大仓位 (%)
  takeProfit: 100,          // 止盈 (%)
  stopLoss: 20,             // 止损 (%)
  gasLimit: 50,             // Gas 上限 (USD)
  autoExecute: true,        // 自动执行
}
```

### 策略模板

**激进狩猎**:
- 信号强度：≥85
- 仓位：15%
- 止盈：150%
- 止损：25%
- 风险：高

**平衡狩猎**:
- 信号强度：≥88
- 仓位：10%
- 止盈：100%
- 止损：15%
- 风险：中

**保守狩猎**:
- 信号强度：≥90
- 仓位：5%
- 止盈：50%
- 止损：10%
- 风险：低

---

## 🚀 部署到生产环境

### 部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

### 配置环境变量

在 Vercel 控制台添加：
- OKX_API_KEY
- OKX_SECRET_KEY
- OKX_PASSPHRASE
- QWEN_API_KEY (可选)
- NEXT_PUBLIC_SUPABASE_URL (可选)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (可选)

### 访问部署

```
https://your-domain.vercel.app
```

---

## 📚 更多文档

- **产品文档**: PRODUCT_DOCS.md
- **技术架构**: TECH_ARCHITECTURE.md
- **部署指南**: deploy.sh
- **参赛指南**: HACKATHON_SUBMISSION.md
- **视频指南**: VIDEO_GUIDE.md

---

## 🆘 常见问题

### Q: 需要多少资金才能开始？

A: 建议至少 $500 起步，可以分散到 2-3 个 Agent。

### Q: Agent 会亏光我的钱吗？

A: 不会。Agent 有严格的止损设置，默认 20% 止损。

### Q: 需要一直开着电脑吗？

A: 不需要。部署到 Vercel 后，Agent 会在云端 24 小时运行。

### Q: 支持哪些链？

A: 目前支持 X Layer、Ethereum、BSC、Base、Solana。

### Q: 如何提取收益？

A: 在钱包管理页面点击"提现"，输入金额即可。

---

## 🔗 链接

- **GitHub**: https://github.com/[yourusername]/ai-agent-hunter
- **Vercel**: https://your-domain.vercel.app
- **OKX**: https://web3.okx.com/onchain-os
- **Discord**: [你的 Discord]
- **Twitter**: [你的 Twitter]

---

<div align="center">

**🚀 AI Agent Hunter - 从人找机会，到 Agent 自动狩猎**

**开始你的 Alpha 狩猎之旅！**

</div>
