'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

interface ChartData {
  date: string
  value: number
  pnl: number
}

interface StatsChartProps {
  data: ChartData[]
  height?: number
}

export function StatsChart({ data, height = 300 }: StatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
      }}>
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis 
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(18, 18, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem',
            color: '#f8fafc',
          }}
          formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '收益']}
          labelFormatter={(label: any) => new Date(label).toLocaleString('zh-CN')}
        />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke="#00ff88"
          fillOpacity={1}
          fill="url(#colorPnl)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface PieData {
  name: string
  value: number
}

export function AllocationChart({ data, height = 250 }: { data: PieData[], height?: number }) {
  const COLORS = ['#00ff88', '#00d4ff', '#ff00ff', '#f59e0b', '#ef4444']

  if (!data || data.length === 0) {
    return (
      <div style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
      }}>
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(18, 18, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem',
            color: '#f8fafc',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
