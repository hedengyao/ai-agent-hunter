/**
 * 后台任务调度器
 * 使用 Vercel Cron Jobs 或 Node.js setInterval
 */

import { agentManager } from './agent-runner'

// 全局任务管理器
class TaskScheduler {
  private tasks: Map<string, NodeJS.Timeout> = new Map()
  private isRunning: boolean = false

  /**
   * 启动调度器
   */
  start() {
    if (this.isRunning) {
      console.log('调度器已在运行中')
      return
    }

    this.isRunning = true
    console.log('🕐 后台任务调度器启动')

    // 每 60 秒检查一次所有运行中的 Agent
    const checkInterval = setInterval(() => {
      this.runAgentChecks()
    }, 60000)

    this.tasks.set('agent-check', checkInterval)

    // 每 5 分钟检查一次止盈止损
    const pnlInterval = setInterval(() => {
      this.checkPnL()
    }, 300000)

    this.tasks.set('pnl-check', pnlInterval)

    // 每小时清理一次过期数据
    const cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 3600000)

    this.tasks.set('cleanup', cleanupInterval)
  }

  /**
   * 停止调度器
   */
  stop() {
    this.isRunning = false
    const taskEntries = Array.from(this.tasks.entries())
    for (const [name, interval] of taskEntries) {
      clearInterval(interval)
      console.log(`⏹️ 停止任务：${name}`)
    }
    this.tasks.clear()
    console.log('🛑 后台任务调度器已停止')
  }

  /**
   * 运行 Agent 检查
   */
  private async runAgentChecks() {
    if (!this.isRunning) return

    try {
      console.log('🔍 检查运行中的 Agent...')
      // 这里可以检查 Agent 状态，重启异常的 Agent
    } catch (error) {
      console.error('Agent 检查失败:', error)
    }
  }

  /**
   * 检查止盈止损
   */
  private async checkPnL() {
    if (!this.isRunning) return

    try {
      console.log('📊 检查止盈止损...')
      // 这里可以检查持仓 PnL，触发止盈止损
    } catch (error) {
      console.error('PnL 检查失败:', error)
    }
  }

  /**
   * 清理过期数据
   */
  private async cleanup() {
    if (!this.isRunning) return

    try {
      console.log('🧹 清理过期数据...')
      // 这里可以清理旧的日志、过期的信号等
    } catch (error) {
      console.error('清理失败:', error)
    }
  }

  /**
   * 注册定时任务
   */
  registerTask(name: string, callback: () => Promise<void>, intervalMs: number) {
    if (this.tasks.has(name)) {
      console.log(`任务 ${name} 已存在`)
      return
    }

    const interval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await callback()
        } catch (error) {
          console.error(`任务 ${name} 执行失败:`, error)
        }
      }
    }, intervalMs)

    this.tasks.set(name, interval)
    console.log(`✅ 注册任务：${name} (间隔：${intervalMs}ms)`)
  }

  /**
   * 取消任务
   */
  unregisterTask(name: string) {
    const interval = this.tasks.get(name)
    if (interval) {
      clearInterval(interval)
      this.tasks.delete(name)
      console.log(`❌ 取消任务：${name}`)
    }
  }
}

// 全局调度器实例
export const taskScheduler = new TaskScheduler()

/**
 * API 路由启动调度器
 * 在 Vercel 中，这会在第一个请求时启动
 */
export function initializeScheduler() {
  if (process.env.NODE_ENV === 'production') {
    taskScheduler.start()
    console.log('🚀 生产环境调度器已启动')
  } else {
    console.log('🔧 开发环境，调度器未启动')
  }
}
