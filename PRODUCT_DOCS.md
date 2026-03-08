# 📖 AI Agent Hunter - 产品文档

## 目录

1. [产品概述](#产品概述)
2. [快速开始](#快速开始)
3. [功能说明](#功能说明)
4. [API 文档](#api 文档)
5. [部署指南](#部署指南)
6. [常见问题](#常见问题)

---

## 产品概述

**AI Agent Hunter** 是一个基于 AI Agent 的自动链上 Alpha 狩猎平台。

### 核心价值

- 🤖 **AI 自主决策**: 24 小时监控，自动发现并执行交易
- ⚡ **快速执行**: 从发现到买入只需 3 秒
- 🛡️ **风险控制**: 智能止盈止损，保护本金
- 📊 **完整统计**: 实时收益追踪，数据分析

### 目标用户

1. **忙碌的投资者**: 没有时间盯盘，但想捕获 Alpha
2. **跟单用户**: 想跟随聪明钱，但不知道如何识别
3. **量化爱好者**: 想自动化交易策略
4. **KOL 粉丝**: 想提前知道 KOL 买了什么

---

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repo-url>
cd ai-agent-hunter

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 API 密钥
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 连接钱包

1. 点击右上角"连接钱包"
2. 选择 OKX Wallet 或 MetaMask
3. 签名授权
4. 连接成功

### 4. 创建第一个 Agent

1. 点击"创建 Agent"
2. 选择策略模板（推荐：平衡狩猎）
3. 调整参数
4. 点击"创建 Agent"
5. Agent 开始运行

---

## 功能说明

### 1. 首页 Dashboard

**功能**:
- 实时统计数据
- Agent 状态监控
- 今日交易记录

**数据刷新**: 每 30 秒自动刷新

### 2. Agent 管理

**创建 Agent**:
- 选择策略模板
- 自定义参数
- 启动/停止控制

**策略参数**:
- 最小信号强度 (50-100)
- 叙事过滤 (Hot/Trending/Normal)
- 最大仓位 (1-50%)
- 止盈设置 (10-500%)
- 止损设置 (5-50%)
- Gas 上限 (10-200 USD)

### 3. 信号广场

**功能**:
- 实时信号列表
- 信号过滤
- 信号详情查看

**信号类型**:
- 🧠 聪明钱信号
- 📢 KOL 信号
- 🐋 巨鲸信号
- ✨ 多源收敛

### 4. 信号详情

**信息展示**:
- 代币基本信息
- 信号强度评分
- 触发钱包列表
- 价格和市值
- 流动性数据

**AI 分析**:
- 投资建议
- 置信度评分
- 风险评估
- 目标价位

### 5. 狩猎日志

**记录内容**:
- Agent 决策历史
- 交易执行记录
- 收益统计

**过滤器**:
- 全部/盈利/亏损/信息

### 6. 策略市场

**功能**:
- 浏览热门策略
- 查看策略表现
- 一键复制策略

**策略分类**:
- 低风险 (保守)
- 中风险 (平衡)
- 高风险 (激进)

### 7. 钱包管理

**功能**:
- Agent 钱包余额
- 充值/提现
- Gas 费管理
- 交易历史

---

## API 文档

### 基础 URL

```
开发环境：http://localhost:3000/api
生产环境：https://your-domain.com/api
```

### 端点

#### GET /api/agents

获取所有 Agent 状态

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-123",
      "name": "激进狩猎",
      "status": "running",
      "winRate": 78.3,
      "totalPnl": 3456,
      "totalTrades": 23
    }
  ]
}
```

#### POST /api/agents

创建新 Agent

**请求**:
```json
{
  "name": "我的 Agent",
  "params": {
    "minSignalStrength": 85,
    "narrativeFilter": ["hot"],
    "maxPosition": 10,
    "takeProfit": 100,
    "stopLoss": 20,
    "gasLimit": 50,
    "autoExecute": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "agent-123",
    "name": "我的 Agent",
    "status": "running"
  },
  "message": "Agent 创建成功"
}
```

#### GET /api/signals

获取信号列表

**参数**:
- `limit`: 数量限制 (默认 20)

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "tokenSymbol": "TITAN",
      "signalStrength": 92,
      "price": "3.01",
      "priceChange24h": 156.3,
      "marketCap": "$2.17M",
      "liquidity": "$690K"
    }
  ]
}
```

#### GET /api/signals/[id]

获取信号详情

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "tokenSymbol": "TITAN",
    "tokenAddress": "0x...",
    "chainId": "196",
    "signalStrength": 92,
    "triggeredWallets": [...],
    "priceInfo": {...}
  }
}
```

---

## 部署指南

### Vercel 部署

#### 1. 准备

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login
```

#### 2. 部署

```bash
# 预览部署
vercel

# 生产部署
vercel --prod
```

#### 3. 配置环境变量

在 Vercel 项目设置中添加：
- `OKX_API_KEY`
- `OKX_SECRET_KEY`
- `OKX_PASSPHRASE`
- `QWEN_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 4. 配置 Cron Jobs

创建 `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/agent-check",
    "schedule": "*/1 * * * *"
  }]
}
```

---

## 常见问题

### Q: 需要多少资金才能开始？

A: 建议至少 $500 起步，可以分散到 2-3 个 Agent。

### Q: Agent 会亏光我的钱吗？

A: 不会。Agent 有严格的止损设置，默认 20% 止损。

### Q: 需要一直开着电脑吗？

A: 不需要。部署到 Vercel 后，Agent 会在云端 24 小时运行。

### Q: 支持哪些链？

A: 目前支持 X Layer、Ethereum、BSC、Base、Solana。

### Q: 交易手续费多少？

A: 除了链上 Gas 费，平台不收取额外费用。

### Q: 如何提取收益？

A: 在钱包管理页面点击"提现"，输入金额即可。

### Q: Agent 策略可以修改吗？

A: 可以。在 Agent 管理页面点击设置图标即可修改参数。

### Q: 支持多个钱包吗？

A: 支持。可以连接多个钱包，每个钱包可以有多个 Agent。

---

## 技术支持

- **文档**: https://docs.ai-agent-hunter.com
- **Discord**: https://discord.gg/ai-agent-hunter
- **Twitter**: @AIAgentHunter
- **Email**: support@ai-agent-hunter.com

---

<div align="center">

**AI Agent Hunter - 从人找机会，到 Agent 自动狩猎**

</div>
