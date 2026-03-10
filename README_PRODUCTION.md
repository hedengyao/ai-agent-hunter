# 🚀 AI Agent Hunter - 生产环境快速开始

## ✅ 部署完成检查

恭喜！你已经完成了以下配置：

- [x] Qwen API Key 配置成功 (`sk-87092f61fbf84bdf9c9fcace9a484882`)
- [x] OKX API Key 配置成功
- [x] Supabase 数据库连接成功
- [x] Agent 调度器已创建
- [x] Docker 部署配置完成
- [x] PM2 进程管理配置完成

## 📦 部署方式选择

### 方式一：PM2 部署（推荐 - 最简单）

适合：Linux 服务器、自有主机

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 安装项目依赖
npm install

# 3. 构建项目
npm run build

# 4. 启动服务（Web + 调度器）
npm run prod

# 5. 查看运行状态
pm2 status

# 6. 查看日志
pm2 logs

# 7. 停止服务
npm run prod:stop

# 8. 重启服务
npm run prod:restart
```

### 方式二：Docker 部署（最灵活）

适合：容器化部署、Kubernetes、任何支持 Docker 的平台

```bash
# 1. 构建镜像
npm run docker:build

# 2. 运行容器
npm run docker:run

# 3. 查看日志
docker logs -f ai-agent-hunter

# 4. 停止容器
docker stop ai-agent-hunter
```

### 方式三：Vercel 部署（最省心）

适合：快速部署、无需运维

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

然后在 Vercel 控制台配置环境变量。

## 🔧 配置检查

### 1. 环境变量

确保 `.env.local` 文件包含以下配置：

```bash
# OKX API
OKX_API_KEY=72effb65-ce65-4998-a08d-1336dd34812a
OKX_SECRET_KEY=C26E4ADE4B551E6D08DFDCE6E21EA161
OKX_PASSPHRASE=Hedengyao2878.

# Qwen AI ✅ 已验证有效
QWEN_API_KEY=sk-87092f61fbf84bdf9c9fcace9a484882

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kahgyvdkupywpkjffewv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_A7A4ubFX8W0sLZZH5QzBow_n-E8_cz0

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 数据库表

确保已在 Supabase 执行以下 SQL：

```bash
# 基础表
supabase-schema.sql

# Agent 日志表
supabase-agent-logs.sql
```

### 3. 测试 API

```bash
# 测试 Qwen API
curl https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-87092f61fbf84bdf9c9fcace9a484882" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"Hello"}]}'

# 应该返回：{"choices":[{"message":{"content":"Hello!..."}}]}
```

## 🎯 启动 Agent

### 本地开发环境

```bash
# 1. 启动 Next.js 开发服务器
npm run dev

# 2. 在另一个终端启动调度器
npm run scheduler

# 3. 访问 http://localhost:3000
```

### 生产环境

```bash
# 1. 启动所有服务（Web + 调度器）
npm run prod

# 2. 启动 Agent（通过 Web 界面或 API）
curl -X PATCH http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"agentId":"<your-agent-id>","status":"running"}'

# 3. 查看日志
pm2 logs

# 4. 访问 http://your-domain.com
```

## 📊 监控和运维

### 查看服务状态

```bash
# PM2 状态
pm2 status

# 查看日志
pm2 logs ai-agent-hunter
pm2 logs agent-scheduler

# 查看资源使用
pm2 monit
```

### 查看 Agent 日志

访问 `http://your-domain.com/logs` 查看实时 Agent 日志。

### 数据库查询

```sql
-- 最近的 Agent 活动
SELECT * FROM agent_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 最近的交易
SELECT * FROM trades 
ORDER BY created_at DESC 
LIMIT 20;

-- Agent 统计
SELECT name, status, total_trades, total_pnl 
FROM agents;
```

## ⚠️ 常见问题

### 1. Agent 不运行

```bash
# 检查 Agent 状态
curl http://localhost:3000/api/agent-monitor

# 手动启动
curl -X POST http://localhost:3000/api/agent-monitor

# 查看调度器日志
pm2 logs agent-scheduler
```

### 2. AI 分析失败

```bash
# 测试 Qwen API
curl https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-87092f61fbf84bdf9c9fcace9a484882" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"test"}]}'
```

### 3. 数据库连接失败

- 检查 Supabase 项目状态
- 验证 API Key 是否正确
- 检查网络连接

## 🎉 完成！

你的 AI Agent Hunter 已经可以投入生产使用了！

**下一步：**
1. 配置域名和 HTTPS
2. 设置监控告警
3. 定期备份数据库
4. 观察 Agent 运行情况
5. 优化策略参数

**访问：** http://localhost:3000 （或你的生产域名）

**查看日志：** http://localhost:3000/logs

祝狩猎顺利！🚀
