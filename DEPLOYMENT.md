# AI Agent Hunter - 生产环境部署指南

## 📋 部署前检查清单

### 1. 环境变量配置

确保以下环境变量已正确配置：

```bash
# OKX API 配置（在 https://web3.okx.com/onchain-os 获取）
OKX_API_KEY=your-okx-api-key
OKX_SECRET_KEY=your-okx-secret-key
OKX_PASSPHRASE=your-okx-passphrase

# Qwen AI 配置（在 https://dashscope.console.aliyun.com/ 获取）
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase 数据库配置（在 https://supabase.com 创建项目）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 调度器配置（秒）
SCHEDULER_INTERVAL_MS=60000
PNL_CHECK_INTERVAL_MS=300000
```

### 2. 数据库准备

在 Supabase SQL Editor 中执行以下 SQL：

```bash
# 1. 基础表结构
cat supabase-schema.sql | psql -h <host> -U postgres -d postgres

# 2. Agent 日志表
cat supabase-agent-logs.sql | psql -h <host> -U postgres -d postgres
```

### 3. 测试 API Key 有效性

```bash
# 测试 OKX API
curl -X GET https://web3.okx.com/api/v6/dex/signals?limit=1 \
  -H "OK-ACCESS-KEY: your-okx-api-key" \
  -H "OK-ACCESS-SIGN: your-signature" \
  -H "OK-ACCESS-PASSPHRASE: your-passphrase"

# 测试 Qwen API
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"Hello"}]}'
```

## 🚀 部署方式

### 方式一：Vercel 部署（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署

```bash
# 本地测试构建
npm run build

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

#### 4. 配置环境变量

在 Vercel 控制台 → Settings → Environment Variables 中添加所有环境变量。

#### 5. 配置定时任务

Vercel 支持 Cron 触发，但需要升级到 Pro 计划。

### 方式二：Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 依赖安装
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

#### 2. 构建并运行

```bash
# 构建镜像
docker build -t ai-agent-hunter .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e OKX_API_KEY=your-key \
  -e OKX_SECRET_KEY=your-secret \
  -e OKX_PASSPHRASE=your-passphrase \
  -e QWEN_API_KEY=sk-xxx \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  --name ai-agent-hunter \
  ai-agent-hunter
```

### 方式三：Linux 服务器部署

#### 1. 安装依赖

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

#### 2. 克隆项目

```bash
git clone <your-repo-url>
cd ai-agent-hunter
npm install
```

#### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入实际配置
```

#### 4. 构建

```bash
npm run build
```

#### 5. 启动服务

```bash
# 使用 PM2 管理
pm2 start npm --name "ai-agent-hunter" -- start

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 6. 配置 Nginx（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Agent 调度器配置

### 生产环境调度器

由于 Next.js 不适合运行后台任务，建议使用以下方式：

#### 方案 A：独立的 Node.js 进程

创建 `scripts/agent-scheduler.js`：

```javascript
const { startAllAgents } = require('../dist/lib/agent-scheduler-v2');

async function main() {
  console.log('🚀 启动 Agent 调度器...');
  await startAllAgents();
  
  // 保持进程运行
  setInterval(() => {
    console.log('✅ 调度器运行中...');
  }, 60000);
}

main().catch(console.error);
```

使用 PM2 启动：

```bash
pm2 start scripts/agent-scheduler.js --name "agent-scheduler"
```

#### 方案 B：Cron 任务

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每分钟执行一次）
* * * * * curl -X POST https://your-domain.com/api/agent-monitor
```

#### 方案 C：Vercel Cron Jobs（需要 Pro 计划）

在 `vercel.json` 中配置：

```json
{
  "crons": [{
    "path": "/api/agent-monitor",
    "schedule": "*/1 * * * *"
  }]
}
```

## 📊 监控和日志

### 1. 查看 Agent 状态

```bash
curl https://your-domain.com/api/agent-monitor
```

### 2. 查看日志

访问 `https://your-domain.com/logs` 查看实时日志。

### 3. 查看数据库

```bash
# 连接 Supabase
psql -h <host> -U postgres -d postgres

# 查看最近的 Agent 日志
SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT 10;

# 查看最近的交易
SELECT * FROM trades ORDER BY created_at DESC LIMIT 10;
```

## ⚠️ 常见问题

### 1. Qwen API 401 错误

- 检查 API Key 是否正确
- 确认已在百炼控制台开通服务
- 检查账户余额

### 2. OKX API 失败

- 检查 API Key 权限
- 确认 IP 白名单配置
- 检查签名生成逻辑

### 3. Agent 不运行

- 检查 Agent 状态是否为 `running`
- 查看日志是否有错误
- 确认调度器进程在运行

### 4. 数据库连接失败

- 检查 Supabase URL 和 Key
- 确认 RLS 策略配置
- 检查网络连接

## 🎯 生产环境优化建议

1. **启用缓存** - 使用 Redis 缓存 OKX API 响应
2. **错误重试** - 实现指数退避重试机制
3. **告警通知** - 配置错误告警（邮件/短信/Telegram）
4. **性能监控** - 集成 Sentry 或类似服务
5. **数据库索引** - 优化查询性能
6. **CDN** - 使用 CDN 加速静态资源
7. **HTTPS** - 强制使用 HTTPS
8. **备份** - 定期备份数据库

## 📝 部署检查清单

- [ ] 环境变量已配置
- [ ] 数据库表已创建
- [ ] API Key 已测试
- [ ] 构建成功
- [ ] 服务已启动
- [ ] Agent 调度器已启动
- [ ] 日志可正常查看
- [ ] 监控告警已配置
- [ ] 备份策略已制定

## 🎉 部署完成！

访问你的域名，开始使用 AI Agent Hunter！
