/**
 * Agent 调度器自动启动
 * 在开发模式下手动触发启动监控
 */

import { startAllAgents } from './agent-scheduler-v2'

// 开发模式下自动启动 Agent 监控
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 开发模式：自动启动 Agent 监控...')
  
  // 延迟启动，确保其他模块已加载
  setTimeout(async () => {
    try {
      await startAllAgents()
      console.log('✅ Agent 监控已自动启动')
    } catch (error) {
      console.error('❌ Agent 监控启动失败:', error)
    }
  }, 3000)
}
