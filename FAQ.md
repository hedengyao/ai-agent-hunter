# ❓ 常见问题 (FAQ)

## 一般问题

### Q: AI Agent Hunter 是什么？
**A**: AI Agent Hunter 是一个基于 AI Agent 的自动链上 Alpha 狩猎平台。它可以 24 小时监控 500+ 聪明钱钱包，自动发现并执行交易，让你比 KOL 发推早 30 分钟建仓！

### Q: 需要多少资金才能开始？
**A**: 建议至少 $500 起步，可以分散到 2-3 个 Agent。但理论上任何金额都可以使用。

### Q: Agent 会亏光我的钱吗？
**A**: 不会。Agent 有严格的止损设置（默认 20%），并且仓位可控。但请注意，任何交易都有风险。

### Q: 需要一直开着电脑吗？
**A**: 不需要。部署到 Vercel 后，Agent 会在云端 24 小时运行。

---

## 技术问题

### Q: 支持哪些钱包？
**A**: 目前支持 OKX Wallet 和 MetaMask。

### Q: 支持哪些链？
**A**: 目前支持 X Layer、Ethereum、BSC、Base、Solana。

### Q: 如何获取 OKX API 密钥？
**A**: 访问 https://web3.okx.com/onchain-os 创建账号并获取 API 密钥。

### Q: 可以本地运行吗？
**A**: 可以！克隆项目后运行 `npm install` 和 `npm run dev` 即可。

---

## 使用问题

### Q: 如何创建第一个 Agent？
**A**: 
1. 连接钱包
2. 点击"创建 Agent"
3. 选择策略模板（推荐：平衡狩猎）
4. 调整参数
5. 点击"创建 Agent"

### Q: Agent 策略可以修改吗？
**A**: 可以。在 Agent 管理页面点击设置图标即可修改参数。

### Q: 如何提取收益？
**A**: 在钱包管理页面点击"提现"，输入金额即可。

### Q: 支持多个钱包吗？
**A**: 支持。可以连接多个钱包，每个钱包可以有多个 Agent。

---

## 费用问题

### Q: 使用平台收费吗？
**A**: 目前免费！参加黑客松期间完全免费使用。

### Q: 交易手续费多少？
**A**: 除了链上 Gas 费，平台不收取额外费用。

### Q: Agent 订阅费是多少？
**A**: 目前免费。未来可能推出高级功能订阅。

---

## 安全问题

### Q: 资金安全吗？
**A**: 非常安全。平台不托管任何资金，所有交易都在你的钱包中完成。

### Q: API 密钥会泄露吗？
**A**: 不会。API 密钥存储在服务端环境变量中，客户端无法访问。

### Q: 如何保证止盈止损执行？
**A**: Agent 会持续监控价格，触发条件时自动执行。但极端行情下可能有滑点。

---

## 开发问题

### Q: 可以贡献代码吗？
**A**: 当然可以！欢迎 Fork 项目并提交 Pull Request。参考 CONTRIBUTING.md

### Q: 有文档吗？
**A**: 有！参考 README.md、PRODUCT_DOCS.md、TECH_ARCHITECTURE.md 等文档。

### Q: 如何本地测试？
**A**: 
```bash
git clone <repo-url>
cd ai-agent-hunter
npm install
cp .env.local.example .env.local
# 编辑 .env.local 填入 API 密钥
npm run dev
```

---

## 比赛相关

### Q: 这是参加什么比赛的项目？
**A**: OKX OnchainOS AI 黑客松 2026。

### Q: 什么时候截止？
**A**: 2026 年 3 月 11 日 23:59 (UTC+8)。

### Q: 如何投票？
**A**: 比赛页面开放后会有投票链接，欢迎关注！

---

## 其他

### Q: 有社区吗？
**A**: 正在建设中！关注我们的 Twitter 和 Discord。

### Q: 未来有什么计划？
**A**: 
- 移动端 App
- 更多策略模板
- 策略市场
- 多语言支持
- 社区运营

### Q: 如何联系团队？
**A**: 
- Email: support@ai-agent-hunter.com
- Twitter: @AIAgentHunter
- Discord: [链接]
- GitHub: [链接]

---

## 还有问题？

如果以上没有解答你的问题，请：
1. 查看文档：PRODUCT_DOCS.md
2. 查看 GitHub Issues
3. 联系我们：support@ai-agent-hunter.com

---

<div align="center">

**AI Agent Hunter - 从人找机会，到 Agent 自动狩猎**

</div>
