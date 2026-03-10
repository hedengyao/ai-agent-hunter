-- Agent Logs 表 - 记录 Agent 运行日志
-- 创建时间：2026-03-09

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 日志信息
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'success')),
  action VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_user ON agent_logs(user_id);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at);
CREATE INDEX idx_agent_logs_action ON agent_logs(action);
