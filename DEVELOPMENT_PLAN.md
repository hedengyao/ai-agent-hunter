# 🚀 AI Agent Hunter - 完整开发计划

**目标**: 做成一个真正可用的产品，参加 OKX AI 黑客松拿奖！

---

## 📊 当前状态

### ✅ 已完成 (20%)
- [x] 项目初始化
- [x] OKX API 集成框架
- [x] AI Agent 核心逻辑
- [x] UI 界面（首页 Dashboard）
- [x] 赛博朋克风格设计

### ❌ 未完成 (80%)
- [ ] 钱包连接功能
- [ ] Agent 实际运行
- [ ] 真实信号获取
- [ ] 自动交易执行
- [ ] x402 支付集成
- [ ] 其他页面（Agents、Strategies、Logs、Wallet）

---

## 🎯 核心功能清单

### 1. 钱包连接 (优先级：🔴 最高)
- [ ] 集成 OKX Wallet
- [ ] 支持 MetaMask
- [ ] 钱包状态管理
- [ ] 余额查询显示

**技术实现**:
```typescript
// src/hooks/useWallet.ts
import { useConnectWallet } from '@okx/web3'

export function useWallet() {
  const { connect, disconnect, address, balance } = useConnectWallet()
  return { connect, disconnect, address, balance }
}
```

### 2. Agent 配置页面 (优先级：🔴 最高)
- [ ] 创建新 Agent 表单
- [ ] 策略参数设置
- [ ] 启动/停止 Agent
- [ ] Agent 状态实时更新

**页面**: `/agents`
**功能**:
- 选择策略模板（激进/平衡/保守）
- 自定义参数（信号强度、仓位、止盈止损）
- 启动/停止按钮
- 实时运行状态

### 3. 真实信号获取 (优先级：🔴 最高)
- [ ] 调用 OKX Signals API
- [ ] 实时信号推送
- [ ] 信号过滤
- [ ] 信号详情展示

**API**:
```typescript
// src/lib/okx-api.ts
export async function getSignals() {
  return okxFetch('GET', '/api/v6/dex/signals?limit=20')
}
```

### 4. 自动交易执行 (优先级：🟡 高)
- [ ] Swap 报价获取
- [ ] 交易签名
- [ ] 交易广播
- [ ] 交易状态追踪

**流程**:
```
发现信号 → AI 分析 → 决策评分 → 获取报价 → 签名交易 → 广播 → 追踪
```

### 5. x402 支付集成 (优先级：🟡 高)
- [ ] Agent 钱包充值
- [ ] 自动支付 Gas
- [ ] 支付记录展示
- [ ] 订阅管理

### 6. 狩猎日志 (优先级：🟢 中)
- [ ] Agent 决策记录
- [ ] 交易历史
- [ ] 收益统计
- [ ] 问题分析

**页面**: `/logs`

### 7. 策略市场 (优先级：🟢 中)
- [ ] 热门策略展示
- [ ] 策略回测数据
- [ ] 一键复制策略
- [ ] KOL 策略推荐

**页面**: `/strategies`

### 8. 钱包管理 (优先级：🟢 中)
- [ ] Agent 钱包余额
- [ ] 充值/提现
- [ ] Gas 费管理
- [ ] 交易历史

**页面**: `/wallet`

---

## 📅 开发时间表

### Day 1 (今天) - 钱包 + 基础功能
- [ ] 安装 OKX Wallet SDK
- [ ] 实现钱包连接
- [ ] 钱包状态管理
- [ ] 余额显示

### Day 2 - Agent 配置页面
- [ ] 创建 `/agents` 页面
- [ ] Agent 创建表单
- [ ] 策略参数设置
- [ ] 启动/停止功能

### Day 3 - 真实信号集成
- [ ] OKX Signals API 调用
- [ ] 信号列表展示
- [ ] 信号详情页面
- [ ] 实时刷新

### Day 4 - 自动交易
- [ ] Swap 报价 API
- [ ] 交易签名
- [ ] 交易执行
- [ ] 状态追踪

### Day 5 - x402 支付
- [ ] 支付意图创建
- [ ] Gas 自动支付
- [ ] 支付记录

### Day 6 (3 月 10 日) - 完善功能
- [ ] 狩猎日志页面
- [ ] 策略市场页面
- [ ] 钱包管理页面
- [ ] 全面测试

### Day 7 (3 月 11 日) - 部署提交
- [ ] Vercel 部署
- [ ] 演示视频录制
- [ ] 文档完善
- [ ] 作品提交

---

## 🔧 技术栈升级

### 需要安装的依赖

```bash
# 钱包连接
npm install @okx/web3 @tanstack/react-query

# 状态管理（升级）
npm install zustand@latest

# 表单处理
npm install react-hook-form zod @hookform/resolvers

# 通知
npm install react-hot-toast

# 图表
npm install @nivo/line @nivo/pie
```

---

## 💡 核心功能实现方案

### 1. 钱包连接

```typescript
// src/components/WalletConnect.tsx
'use client'

import { useState } from 'react'

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null)
  
  const connect = async () => {
    // 检测 OKX Wallet
    if (window.okxwallet) {
      const accounts = await window.okxwallet.request({
        method: 'eth_requestAccounts'
      })
      setAddress(accounts[0])
    }
  }
  
  return (
    <button onClick={connect}>
      {address ? `${address.slice(0,6)}...${address.slice(-4)}` : '连接钱包'}
    </button>
  )
}
```

### 2. Agent 运行

```typescript
// src/lib/agent-runner.ts
export class AgentRunner {
  private strategy: Strategy
  private interval: NodeJS.Timeout
  
  async start() {
    // 每 60 秒检查一次信号
    this.interval = setInterval(async () => {
      const signals = await getSignals()
      const filtered = this.filterSignals(signals)
      
      for (const signal of filtered) {
        const decision = await this.analyze(signal)
        if (decision.action === 'BUY') {
          await this.execute(signal)
        }
      }
    }, 60000)
  }
  
  async stop() {
    clearInterval(this.interval)
  }
}
```

### 3. 交易执行

```typescript
// src/lib/trade-executor.ts
export async function executeTrade(
  chainId: string,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string
) {
  // 1. 获取报价
  const quote = await getSwapQuote(chainId, fromToken, toToken, amount)
  
  // 2. 构建交易
  const txData = await buildSwapTransaction(quote, userAddress)
  
  // 3. 用户签名
  const signature = await window.ethereum.request({
    method: 'eth_signTransaction',
    params: [txData]
  })
  
  // 4. 广播交易
  const txHash = await broadcastTransaction(signature)
  
  return { txHash, status: 'pending' }
}
```

---

## 🏆 参赛亮点

### 1. 真正的 AI Agent
- ✅ 自主决策，不是简单跟单
- ✅ 24 小时不间断监控
- ✅ Qwen 3.5 深度分析

### 2. x402 完美场景
- ✅ Agent 自动支付 Gas
- ✅ 自动支付信号订阅费
- ✅ 用户只需充值一次

### 3. 完整功能
- ✅ 钱包连接
- ✅ Agent 配置
- ✅ 自动交易
- ✅ 收益追踪

### 4. 专业 UI
- ✅ 赛博朋克风格
- ✅ 响应式设计
- ✅ 实时数据更新

---

## 📋 提交材料清单

### 必需
- [ ] GitHub 仓库
- [ ] Vercel 在线演示
- [ ] 演示视频 (3-5 分钟)
- [ ] README.md
- [ ] 产品设计文档

### 加分
- [ ] 真实交易记录
- [ ] 收益数据截图
- [ ] 用户测试反馈
- [ ] 技术架构图

---

## 🎬 演示视频脚本

### 5 分钟演示流程

**0:00-0:30 开场**
> "AI Agent Hunter - 从人找机会，到 Agent 自动狩猎"
> 展示：首页 Dashboard

**0:30-1:00 连接钱包**
> "首先连接 OKX Wallet"
> 演示：点击连接 → 签名 → 显示余额

**1:00-2:00 创建 Agent**
> "创建一个'激进狩猎'Agent"
> 演示：选择策略 → 设置参数 → 启动 Agent

**2:00-3:00 Agent 运行**
> "Agent 发现信号！强度 92"
> "Qwen 分析：置信度 90%，建议 strong_buy"
> "自动执行买入..."
> 演示：实时信号 → AI 分析 → 自动交易

**3:00-3:30 x402 支付**
> "Agent 自动支付 Gas 费用"
> "用户无需额外操作"
> 演示：支付记录展示

**3:30-4:30 收益展示**
> "今日狩猎：5 次交易"
> "总收益：+$567"
> "胜率：80%"
> 演示：收益统计 + 交易历史

**4:30-5:00 总结**
> "完整集成 OKX 全部 Skills"
> "从人找机会，到 Agent 自动狩猎"
> 展示：技术架构 + OKX Skills

---

## 💪 现在开始执行！

**第一步**: 安装钱包连接依赖
**第二步**: 实现钱包连接功能
**第三步**: 创建 Agent 配置页面
**第四步**: 集成真实信号 API
**第五步**: 实现自动交易

**目标**: 🏆 OKX AI 黑客松 第一名！

---

<div align="center">

**🚀 AI Agent Hunter - 自动狩猎平台**

*从人找机会，到 Agent 自动狩猎*

**Last Updated**: 2026-03-07

</div>
