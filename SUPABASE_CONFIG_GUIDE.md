# 📦 Supabase 数据库配置指南

**目标**: 让 AI Agent Hunter 使用真实数据库

---

## 步骤 1: 创建 Supabase 项目

### 1.1 访问 Supabase
1. 打开浏览器访问：**https://supabase.com**
2. 点击 **"Start your project"** 或 **"Sign In"**
3. 使用 GitHub 账号登录（推荐）或邮箱注册

### 1.2 创建项目
填写项目信息：
- **Name**: `ai-agent-hunter`
- **Database Password**: 
  - 生成一个强密码（建议用密码管理器）
  - ⚠️ **重要**: 保存好密码！
- **Region**: 选择最近的区域
  - 亚洲推荐：**Singapore (Singapore)** 或 **Tokyo (Japan)**
- **Pricing Plan**: Free (免费套餐足够用)

点击 **"Create new project"**

等待 2-3 分钟，项目创建完成。

---

## 步骤 2: 运行数据库 Schema

### 2.1 进入 SQL Editor
1. 在 Supabase Dashboard 左侧菜单，点击 **"SQL Editor"**
2. 点击 **"New query"**

### 2.2 复制 Schema
1. 打开项目中的 `supabase-schema.sql` 文件
2. 复制全部内容

### 2.3 执行 Schema
1. 粘贴到 SQL Editor
2. 点击 **"Run"** 或按 `Ctrl+Enter` / `Cmd+Enter`
3. 等待执行完成（约 5-10 秒）

### 2.4 验证结果
执行成功后，你应该看到：
- ✅ 6 个表创建成功
- ✅ 索引创建成功
- ✅ 触发器创建成功
- ✅ 视图创建成功

---

## 步骤 3: 获取 API 密钥

### 3.1 进入设置页面
1. 点击左侧菜单底部 **"Settings"** (齿轮图标)
2. 点击 **"API"**

### 3.2 复制密钥
找到以下两个值：

1. **Project URL**
   - 格式：`https://xxxxx.supabase.co`
   - 点击复制按钮

2. **anon/public key**
   - 格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (长字符串)
   - 点击 **"Reveal"** 显示
   - 点击复制按钮

---

## 步骤 4: 配置环境变量

### 4.1 创建/编辑 .env.local
在项目根目录打开或创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://你的项目.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的 anon key"

# OKX API 配置
OKX_API_KEY="34427e21-40ac-48cd-bc97-e9f17eedaaca"
OKX_SECRET_KEY="02C6DF2C79F8E7F81EB895C7A6235C0B"
OKX_PASSPHRASE="Hedengyao2878."
```

### 4.2 替换占位符
将以下值替换为你刚才复制的：
- `https://你的项目.supabase.co` → 你的 Project URL
- `你的 anon key` → 你的 anon/public key

### 4.3 保存文件
保存 `.env.local` 文件

---

## 步骤 5: 重启开发服务器

### 5.1 停止当前服务器
在终端按 `Ctrl+C` 停止当前运行的服务器

### 5.2 重新启动
```bash
npm run dev
```

### 5.3 验证配置
访问 http://localhost:3000/test-all-api
- 点击 **"测试 Signals API"**
- 如果看到成功响应，说明配置正确

---

## 步骤 6: 验证数据库连接

### 6.1 访问监控中心
访问：http://localhost:3000/agent-monitor

### 6.2 创建测试 Agent
1. 访问：http://localhost:3000/agents/edit
2. 填写 Agent 名称（如：测试 Agent）
3. 配置参数
4. 点击 **"创建 Agent"**
5. 成功提示后，跳转到 Agent 列表

### 6.3 验证数据
回到 Supabase Dashboard：
1. 点击左侧 **"Table Editor"**
2. 点击 **"agents"** 表
3. 应该能看到刚才创建的 Agent

---

## 常见问题解决

### Q1: 提示 "Supabase not configured"
**原因**: 环境变量未正确配置

**解决**:
1. 检查 `.env.local` 是否存在
2. 检查 URL 和 Key 是否正确
3. 重启开发服务器
4. 清除浏览器缓存

### Q2: 提示 "RLS policy violation"
**原因**: 行级安全策略阻止了访问

**解决** (开发阶段临时方案):
```sql
-- 在 SQL Editor 执行以下命令
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

### Q3: Schema 执行失败
**原因**: 可能是权限问题或语法错误

**解决**:
1. 检查是否完整复制了 `supabase-schema.sql`
2. 确保使用的是项目所有者账号
3. 分段执行（先执行 CREATE TABLE，再执行其他）

### Q4: 如何清空所有数据？
**解决**:
```sql
-- 在 SQL Editor 执行
TRUNCATE users, agents, trades, signals, positions, notifications RESTART IDENTITY CASCADE;
```

---

## 验证清单

完成配置后，检查以下项目：

- [ ] Supabase 项目创建成功
- [ ] 6 个数据库表创建成功
- [ ] API 密钥已复制
- [ ] `.env.local` 配置正确
- [ ] 开发服务器已重启
- [ ] 能访问测试页面
- [ ] 能创建 Agent
- [ ] 数据能保存到数据库

---

## 下一步

数据库配置完成后：

1. ✅ Agent 可以保存到数据库
2. ✅ 交易记录会持久化
3. ✅ 支持真实的多用户系统
4. ✅ 可以开始录制演示视频
5. ✅ 可以准备提交比赛

---

## 需要帮助？

如果遇到问题：
1. 检查 Supabase Dashboard 的日志
2. 查看浏览器控制台错误
3. 检查 `.env.local` 配置
4. 重启开发服务器

---

**最后更新**: 2026-03-08  
**状态**: 🟡 待配置
