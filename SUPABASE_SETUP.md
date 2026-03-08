# 📦 Supabase 数据库设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 登录/注册 GitHub 账号
4. 填写项目信息：
   - **Name**: ai-agent-hunter
   - **Database Password**: (保存好密码)
   - **Region**: 选择最近的区域

## 步骤 2: 运行 SQL Schema

1. 进入项目 Dashboard
2. 点击左侧 "SQL Editor"
3. 点击 "New query"
4. 复制 `supabase-schema.sql` 的全部内容
5. 粘贴到 SQL Editor
6. 点击 "Run" 执行

## 步骤 3: 获取 API 密钥

1. 点击左侧 "Settings" → "API"
2. 复制以下两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (长字符串)

## 步骤 4: 配置环境变量

在项目根目录创建或编辑 `.env.local`:

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://你的项目.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的 anon key"

# OKX API 配置
OKX_API_KEY="你的 OKX API Key"
OKX_SECRET_KEY="你的 OKX Secret Key"
OKX_PASSPHRASE="你的 OKX Passphrase"
```

## 步骤 5: 测试连接

1. 重启开发服务器：`npm run dev`
2. 访问 http://localhost:3000
3. 检查控制台是否有数据库连接错误

## 步骤 6: 验证数据

1. 回到 Supabase Dashboard
2. 点击左侧 "Table Editor"
3. 应该能看到以下表：
   - users
   - agents
   - trades
   - signals
   - positions
   - notifications

## 常见问题

### Q: 提示 "Supabase not configured"
**A**: 检查 `.env.local` 是否正确配置，确保重启了服务器

### Q: RLS 策略阻止了写入
**A**: 开发阶段可以临时禁用 RLS：
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
-- 对其他表也执行相同操作
```

### Q: 如何清空所有数据？
**A**: 在 SQL Editor 执行：
```sql
TRUNCATE users, agents, trades, signals, positions, notifications RESTART IDENTITY CASCADE;
```

## 下一步

数据库设置完成后：
1. ✅ 创建 Agent 会保存到数据库
2. ✅ 交易记录会持久化
3. ✅ 用户可以查看历史数据
4. ✅ 支持真实的多用户系统

---

**最后更新**: 2026-03-08  
**状态**: 🟡 待配置
