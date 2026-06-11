'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { Activity, Zap, TrendingUp } from 'lucide-react'
import { PLATFORM_CONFIG, Platform } from './platform-icon'

interface Stats {
  platforms: Record<string, { total: number; lastMin: number; connected: boolean }>
  totalMessages: number
  messagesPerMinute: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const end = value
    const duration = 600
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    animate()
    prev.current = end
  }, [value])

  return <span className="font-mono tabular-nums">{display}</span>
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res?.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {}
    }
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const platforms = stats?.platforms ?? {}

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Total stats */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-muted-foreground">Total:</span>
        <span className="text-sm font-semibold text-foreground">
          <AnimatedNumber value={stats?.totalMessages ?? 0} />
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs text-muted-foreground">msg/min:</span>
        <span className="text-sm font-semibold text-foreground">
          <AnimatedNumber value={stats?.messagesPerMinute ?? 0} />
        </span>
      </div>

      {/* Per-platform */}
      {(['TWITCH', 'KICK', 'X'] as Platform[]).map((p: Platform) => {
        const config = PLATFORM_CONFIG[p]
        const pStats = platforms[p]
        return (
          <div
            key={p}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{
              backgroundColor: config?.bgColor,
              borderColor: config?.borderColor,
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config?.color }} />
            <span className="text-xs font-medium" style={{ color: config?.color }}>
              {config?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              <AnimatedNumber value={pStats?.lastMin ?? 0} />/m
            </span>
          </div>
        )
      })}
    </div>
  )
}
