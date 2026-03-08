-- AI Agent Hunter - Supabase Database Schema
-- 创建时间：2026-03-08

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  total_pnl DECIMAL(20, 8) DEFAULT 0,
  total_trades INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_created ON users(created_at);

-- ========================================
-- 2. Agent 配置表
-- ========================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error')),
  
  -- 策略配置
  min_signal_strength INTEGER DEFAULT 85,
  narrative_filter TEXT[] DEFAULT ARRAY['hot', 'trending'],
  max_position DECIMAL(10, 2) DEFAULT 10.00,
  take_profit DECIMAL(10, 2) DEFAULT 100.00,
  stop_loss DECIMAL(10, 2) DEFAULT 20.00,
  gas_limit DECIMAL(10, 2) DEFAULT 50.00,
  auto_execute BOOLEAN DEFAULT true,
  
  -- 统计数据
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  total_pnl DECIMAL(20, 8) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created ON agents(created_at);

-- ========================================
-- 3. 交易记录表
-- ========================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 交易信息
  token_symbol VARCHAR(20) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  chain_id VARCHAR(10) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('buy', 'sell')),
  
  -- 交易详情
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  value_usd DECIMAL(20, 2) NOT NULL,
  
  -- 交易结果
  pnl DECIMAL(20, 8) DEFAULT 0,
  pnl_percent DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  tx_hash VARCHAR(66),
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX idx_trades_agent ON trades(agent_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created ON trades(created_at);
CREATE INDEX idx_trades_token ON trades(token_symbol);

-- ========================================
-- 4. 信号记录表
-- ========================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 信号信息
  token_symbol VARCHAR(20) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  chain_id VARCHAR(10) NOT NULL,
  signal_strength INTEGER NOT NULL,
  signal_type VARCHAR(20) NOT NULL,
  
  -- 价格信息
  price VARCHAR(50) NOT NULL,
  price_change_24h DECIMAL(10, 2) DEFAULT 0,
  market_cap VARCHAR(50),
  liquidity VARCHAR(50),
  narrative VARCHAR(20),
  
  -- 触发钱包
  triggered_wallets JSONB DEFAULT '[]'::jsonb,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_signals_strength ON signals(signal_strength);
CREATE INDEX idx_signals_type ON signals(signal_type);
CREATE INDEX idx_signals_created ON signals(created_at);
CREATE INDEX idx_signals_token ON signals(token_symbol);

-- ========================================
-- 5. 持仓表
-- ========================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 持仓信息
  token_symbol VARCHAR(20) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  chain_id VARCHAR(10) NOT NULL,
  
  -- 持仓详情
  amount DECIMAL(20, 8) NOT NULL,
  entry_price DECIMAL(20, 8) NOT NULL,
  current_price DECIMAL(20, 8) DEFAULT 0,
  
  -- 止盈止损
  take_profit_price DECIMAL(20, 8),
  stop_loss_price DECIMAL(20, 8),
  
  -- 盈亏
  unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
  unrealized_pnl_percent DECIMAL(10, 2) DEFAULT 0,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'stopped')),
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX idx_positions_agent ON positions(agent_id);
CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_token ON positions(token_symbol);

-- ========================================
-- 6. 通知表
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 通知信息
  type VARCHAR(20) NOT NULL CHECK (type IN ('trade', 'signal', 'alert', 'system')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- 状态
  is_read BOOLEAN DEFAULT false,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ========================================
-- 触发器 - 自动更新 updated_at
-- ========================================

-- users 表
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- agents 表
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- positions 表
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 视图 - 常用查询
-- ========================================

-- Agent 统计视图
CREATE OR REPLACE VIEW agent_stats AS
SELECT 
  a.id,
  a.name,
  a.status,
  a.win_rate,
  a.total_pnl,
  a.total_trades,
  COUNT(t.id) as recent_trades,
  SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades
FROM agents a
LEFT JOIN trades t ON a.id = t.agent_id AND t.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id, a.name, a.status, a.win_rate, a.total_pnl, a.total_trades;

-- 用户收益视图
CREATE OR REPLACE VIEW user_pnl AS
SELECT 
  u.id,
  u.wallet_address,
  u.total_pnl,
  u.total_trades,
  COALESCE(SUM(t.pnl), 0) as realized_pnl,
  COALESCE(SUM(p.unrealized_pnl), 0) as unrealized_pnl
FROM users u
LEFT JOIN trades t ON u.id = t.user_id
LEFT JOIN positions p ON u.id = p.user_id AND p.status = 'open'
GROUP BY u.id, u.wallet_address, u.total_pnl, u.total_trades;

-- ========================================
-- RLS (Row Level Security) - 行级安全策略
-- ========================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- users 策略
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- agents 策略
CREATE POLICY "Users can manage own agents" ON agents
  FOR ALL USING (auth.uid()::text = user_id::text);

-- trades 策略
CREATE POLICY "Users can view own trades" ON trades
  FOR ALL USING (auth.uid()::text = user_id::text);

-- positions 策略
CREATE POLICY "Users can manage own positions" ON positions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- notifications 策略
CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

-- signals 策略（公开读取）
CREATE POLICY "Anyone can view signals" ON signals
  FOR SELECT USING (true);

-- ========================================
-- 示例数据（可选）
-- ========================================

-- 插入示例用户
-- INSERT INTO users (wallet_address) VALUES 
--   ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1');

-- 插入示例 Agent
-- INSERT INTO agents (user_id, name, status, min_signal_strength, max_position, take_profit, stop_loss)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', '激进狩猎', 'running', 85, 15, 150, 25),
--   ('00000000-0000-0000-0000-000000000001', '平衡狩猎', 'stopped', 88, 10, 100, 20),
--   ('00000000-0000-0000-0000-000000000001', '保守狩猎', 'running', 90, 5, 50, 10);

-- ========================================
-- 完成
-- ========================================
