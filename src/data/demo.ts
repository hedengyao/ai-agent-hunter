/**
 * 演示数据种子脚本
 * 用于生成演示用的模拟数据
 */

// 模拟 Agent 数据
export const demoAgents = [
  {
    id: 'agent-demo-1',
    name: '激进狩猎',
    status: 'running',
    winRate: 78.3,
    totalPnl: 3456.78,
    totalTrades: 23,
    config: {
      minSignalStrength: 85,
      narrativeFilter: ['hot'],
      maxPosition: 15,
      takeProfit: 150,
      stopLoss: 25,
      gasLimit: 50,
      autoExecute: true,
    },
  },
  {
    id: 'agent-demo-2',
    name: '平衡狩猎',
    status: 'running',
    winRate: 73.3,
    totalPnl: 1890.45,
    totalTrades: 15,
    config: {
      minSignalStrength: 88,
      narrativeFilter: ['hot', 'trending'],
      maxPosition: 10,
      takeProfit: 100,
      stopLoss: 15,
      gasLimit: 40,
      autoExecute: true,
    },
  },
  {
    id: 'agent-demo-3',
    name: '保守狩猎',
    status: 'stopped',
    winRate: 87.5,
    totalPnl: 892.30,
    totalTrades: 8,
    config: {
      minSignalStrength: 90,
      narrativeFilter: ['hot', 'trending'],
      maxPosition: 5,
      takeProfit: 50,
      stopLoss: 10,
      gasLimit: 30,
      autoExecute: true,
    },
  },
]

// 模拟信号数据
export const demoSignals = [
  {
    id: '1',
    tokenSymbol: 'TITAN',
    tokenAddress: '0xfdc4a45a4bf53957b2c73b1ff323d8cbe39118dd',
    chainId: '196',
    signalStrength: 92,
    signalType: 'convergence',
    triggeredWallets: [
      { address: '0xabc1...', type: 'smart_money', amount: '$125K' },
      { address: '0xdef2...', type: 'smart_money', amount: '$89K' },
      { address: '0xghi3...', type: 'kol', amount: '$210K' },
    ],
    price: '3.01',
    priceChange24h: 156.3,
    marketCap: '$2.17M',
    liquidity: '$690K',
    riskScore: 85,
    narrative: 'hot',
  },
  {
    id: '2',
    tokenSymbol: 'xETH',
    tokenAddress: '0xe7b000003a45145decf8a28fc755ad5ec5ea025a',
    chainId: '196',
    signalStrength: 88,
    signalType: 'smart_money',
    triggeredWallets: [
      { address: '0xjkl4...', type: 'smart_money', amount: '$95K' },
      { address: '0xmno5...', type: 'whale', amount: '$320K' },
    ],
    price: '1985.70',
    priceChange24h: 89.7,
    marketCap: '$5.5M',
    liquidity: '$1.2M',
    riskScore: 90,
    narrative: 'trending',
  },
  {
    id: '3',
    tokenSymbol: 'PEPE',
    tokenAddress: '0x7890abcd',
    chainId: '1',
    signalStrength: 85,
    signalType: 'kol',
    triggeredWallets: [
      { address: '0xpqr6...', type: 'kol', amount: '$180K' },
      { address: '0xstu7...', type: 'kol', amount: '$150K' },
    ],
    price: '0.00001234',
    priceChange24h: 67.8,
    marketCap: '$8.9M',
    liquidity: '$890K',
    riskScore: 78,
    narrative: 'hot',
  },
  {
    id: '4',
    tokenSymbol: 'BONK',
    tokenAddress: '0xbonk123',
    chainId: '501',
    signalStrength: 82,
    signalType: 'whale',
    triggeredWallets: [
      { address: '0xwhale1...', type: 'whale', amount: '$450K' },
    ],
    price: '0.00002345',
    priceChange24h: 45.6,
    marketCap: '$12M',
    liquidity: '$1.5M',
    riskScore: 82,
    narrative: 'trending',
  },
  {
    id: '5',
    tokenSymbol: 'WIF',
    tokenAddress: '0xwif456',
    chainId: '501',
    signalStrength: 79,
    signalType: 'smart_money',
    triggeredWallets: [
      { address: '0xsmart1...', type: 'smart_money', amount: '$78K' },
    ],
    price: '2.34',
    priceChange24h: 34.5,
    marketCap: '$15M',
    liquidity: '$2.1M',
    riskScore: 88,
    narrative: 'normal',
  },
]

// 模拟交易记录
export const demoTrades = [
  {
    id: 'trade-1',
    agentId: 'agent-demo-1',
    tokenSymbol: 'TITAN',
    action: 'buy',
    amount: 100,
    price: 2.85,
    pnl: 120,
    status: 'completed',
    txHash: '0xabc123...',
    createdAt: '2026-03-07 10:23:45',
  },
  {
    id: 'trade-2',
    agentId: 'agent-demo-1',
    tokenSymbol: 'xETH',
    action: 'buy',
    amount: 100,
    price: 1950.00,
    pnl: 89,
    status: 'completed',
    txHash: '0xdef456...',
    createdAt: '2026-03-07 09:15:32',
  },
  {
    id: 'trade-3',
    agentId: 'agent-demo-2',
    tokenSymbol: 'PEPE',
    action: 'buy',
    amount: 100,
    price: 0.00001200,
    pnl: -15,
    status: 'stopped',
    txHash: '0xghi789...',
    createdAt: '2026-03-07 08:42:18',
  },
  {
    id: 'trade-4',
    agentId: 'agent-demo-2',
    tokenSymbol: 'BONK',
    action: 'sell',
    amount: 100,
    price: 0.00002300,
    pnl: 45,
    status: 'completed',
    txHash: '0xjkl012...',
    createdAt: '2026-03-06 15:30:00',
  },
  {
    id: 'trade-5',
    agentId: 'agent-demo-3',
    tokenSymbol: 'WIF',
    action: 'buy',
    amount: 50,
    price: 2.20,
    pnl: 32,
    status: 'completed',
    txHash: '0xmno345...',
    createdAt: '2026-03-06 12:15:00',
  },
]

// 模拟收益图表数据
export const demoChartData = [
  { date: '2026-03-01', pnl: 0, value: 1000 },
  { date: '2026-03-02', pnl: 120, value: 1120 },
  { date: '2026-03-03', pnl: 85, value: 1205 },
  { date: '2026-03-04', pnl: -45, value: 1160 },
  { date: '2026-03-05', pnl: 230, value: 1390 },
  { date: '2026-03-06', pnl: 178, value: 1568 },
  { date: '2026-03-07', pnl: 345, value: 1913 },
]

// 模拟策略数据
export const demoStrategies = [
  {
    id: 'strategy-1',
    name: '巨鲸追踪者',
    description: '专注跟踪巨鲸钱包的大额交易',
    author: 'OKX Research',
    followers: 2345,
    winRate: 76.5,
    totalPnl: 12450,
    risk: 'high',
  },
  {
    id: 'strategy-2',
    name: '稳健 Alpha',
    description: '低风险高胜率，适合保守投资者',
    author: 'AlphaDAO',
    followers: 1892,
    winRate: 82.3,
    totalPnl: 8920,
    risk: 'low',
  },
  {
    id: 'strategy-3',
    name: '动量之王',
    description: '追逐市场热点，快速进出',
    author: 'CryptoKing',
    followers: 3421,
    winRate: 71.2,
    totalPnl: 18760,
    risk: 'high',
  },
  {
    id: 'strategy-4',
    name: '平衡专业版',
    description: '风险收益平衡，长期稳定增长',
    author: 'ProTrader',
    followers: 1567,
    winRate: 78.9,
    totalPnl: 9850,
    risk: 'medium',
  },
]

console.log('✅ 演示数据已加载')
console.log(`📊 Agents: ${demoAgents.length}`)
console.log(`📡 Signals: ${demoSignals.length}`)
console.log(`💰 Trades: ${demoTrades.length}`)
console.log(`📈 Strategies: ${demoStrategies.length}`)
