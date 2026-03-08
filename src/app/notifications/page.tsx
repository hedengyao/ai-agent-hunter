'use client'

import { useState, useEffect } from 'react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, trade, signal, alert

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // 10 秒刷新一次
    return () => clearInterval(interval)
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('标记失败:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read)
      for (const n of unread) {
        await markAsRead(n.id)
      }
      fetchNotifications()
    } catch (error) {
      console.error('全部标记失败:', error)
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a0a0f', color: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>🔔 通知中心</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(0,255,136,0.2)',
                color: '#00ff88',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              全部已读 ({unreadCount})
            </button>
          )}
        </div>

        {/* 过滤器 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '全部', icon: '📬' },
            { key: 'unread', label: '未读', icon: '🔔' },
            { key: 'trade', label: '交易', icon: '💰' },
            { key: 'signal', label: '信号', icon: '📡' },
            { key: 'alert', label: '警报', icon: '⚠️' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === f.key ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                color: filter === f.key ? '#00ff88' : '#9ca3af',
                border: filter === f.key ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* 通知列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
            加载中...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
            暂无通知
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 通知项组件
 */
function NotificationItem({ notification, onMarkAsRead }: any) {
  const icons: any = {
    trade: '💰',
    signal: '📡',
    alert: '⚠️',
    system: '⚙️',
  }

  const colors: any = {
    trade: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)', text: '#00ff88' },
    signal: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)', text: '#00d4ff' },
    alert: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    system: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
  }

  const color = colors[notification.type] || colors.system

  return (
    <div
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
      style={{
        padding: '1.5rem',
        background: notification.is_read ? 'rgba(255,255,255,0.03)' : color.bg,
        border: `1px solid ${notification.is_read ? 'rgba(255,255,255,0.1)' : color.border}`,
        borderRadius: '1rem',
        cursor: !notification.is_read ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {!notification.is_read && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '8px',
          height: '8px',
          background: '#00ff88',
          borderRadius: '50%',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>{icons[notification.type] || '📬'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{notification.title}</span>
            <span style={{
              padding: '0.25rem 0.5rem',
              background: color.bg,
              color: color.text,
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
            }}>
              {notification.type}
            </span>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>{notification.message}</p>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {new Date(notification.created_at).toLocaleString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  )
}
