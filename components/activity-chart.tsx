'use client'

import React, { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { ChatMsg } from '@/lib/message-store'

interface DataPoint {
  time: string
  TWITCH: number
  KICK: number
  X: number
}

export function ActivityChart({ messages }: { messages: ChatMsg[] }) {
  const data = useMemo<DataPoint[]>(() => {
    const now = Date.now()
    const buckets: DataPoint[] = []
    for (let i = 23; i >= 0; i--) {
      const start = now - i * 5000
      const label = new Date(start).toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' })
      buckets.push({ time: label, TWITCH: 0, KICK: 0, X: 0 })
    }

    for (const msg of messages.slice(-300)) {
      const age = now - new Date(msg.timestamp).getTime()
      if (age < 0 || age > 120000) continue
      const index = Math.min(23, Math.max(0, 23 - Math.floor(age / 5000)))
      buckets[index][msg.platform] += 1
    }

    return buckets
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-200" />
          <span className="text-sm font-semibold">Message Velocity</span>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase text-muted-foreground">
          5s buckets
        </span>
      </div>
      <div className="min-h-0 flex-1 px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="twitch-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9146FF" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#9146FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="kick-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#53FC18" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#53FC18" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="x-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8b8b95' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#8b8b95' }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(8, 8, 12, 0.94)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: 11,
                color: '#f5f5f5',
              }}
            />
            <Area type="monotone" dataKey="TWITCH" stroke="#9146FF" fill="url(#twitch-grad)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="KICK" stroke="#53FC18" fill="url(#kick-grad)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="X" stroke="#FFFFFF" fill="url(#x-grad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
