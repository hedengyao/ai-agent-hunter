/**
 * 独立的 Agent 调度器进程
 * 用于生产环境运行后台任务
 * 
 * 使用方式：
 * node scripts/agent-scheduler.js
 * 
 * 或使用 PM2：
 * pm2 start scripts/agent-scheduler.js --name "agent-scheduler"
 */

const https = require('https');

// 配置
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  checkInterval: parseInt(process.env.SCHEDULER_INTERVAL_MS) || 60000, // 60 秒
  logInterval: 300000, // 5 分钟
};

// 日志
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// 发送 HTTP 请求
function sendRequest(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000);
    req.end();
  });
}

// 启动所有 Agent
async function startAgents() {
  try {
    log('正在启动 Agent 监控...', 'START');
    const result = await sendRequest('POST', '/api/agent-monitor');
    
    if (result.success) {
      log('Agent 监控已启动', 'SUCCESS');
      return true;
    } else {
      log(`启动失败：${result.error || result.message}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`启动异常：${error.message}`, 'ERROR');
    return false;
  }
}

// 检查 Agent 状态
async function checkAgentStatus() {
  try {
    const result = await sendRequest('GET', '/api/agent-monitor');
    
    if (result.success) {
      const { isRunning, runningCount, totalCount } = result.data;
      log(`Agent 状态：${isRunning ? '运行中' : '已停止'}, ${runningCount}/${totalCount}`, 'STATUS');
      return { isRunning, runningCount, totalCount };
    }
    
    return null;
  } catch (error) {
    log(`检查状态失败：${error.message}`, 'ERROR');
    return null;
  }
}

// 主循环
async function main() {
  log('='.repeat(50), 'INFO');
  log('AI Agent Hunter - 调度器启动', 'INFO');
  log(`配置：检查间隔=${CONFIG.checkInterval/1000}秒，日志间隔=${CONFIG.logInterval/1000}秒`, 'INFO');
  log(`目标地址：${CONFIG.baseUrl}`, 'INFO');
  log('='.repeat(50), 'INFO');

  // 首次启动
  const started = await startAgents();
  
  if (!started) {
    log('首次启动失败，10 秒后重试...', 'WARNING');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await startAgents();
  }

  // 定期检查
  let checkCount = 0;
  setInterval(async () => {
    checkCount++;
    
    // 检查状态
    await checkAgentStatus();
    
    // 如果未运行，尝试重启
    const status = await checkAgentStatus();
    if (status && !status.isRunning) {
      log('Agent 未运行，尝试重启...', 'WARNING');
      await startAgents();
    }
    
    // 定期输出详细日志
    if (checkCount % 5 === 0) {
      log(`调度器运行正常，已检查 ${checkCount} 次`, 'INFO');
    }
  }, CONFIG.checkInterval);

  // 错误处理
  process.on('uncaughtException', (error) => {
    log(`未捕获异常：${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log(`未处理的 Promise 拒绝：${reason}`, 'ERROR');
  });

  // 优雅退出
  process.on('SIGINT', () => {
    log('收到退出信号，正在关闭...', 'INFO');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('收到终止信号，正在关闭...', 'INFO');
    process.exit(0);
  });
}

// 启动
main().catch((error) => {
  log(`启动失败：${error.message}`, 'ERROR');
  log(error.stack, 'ERROR');
  process.exit(1);
});
