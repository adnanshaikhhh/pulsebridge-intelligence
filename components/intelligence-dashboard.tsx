'use client'

import React, { useMemo } from 'react'
import { Activity, Brain, Flame, Radio, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react'
import { getAnalytics } from '@/lib/analytics'
import type { ChatMsg } from '@/lib/message-store'
import { PLATFORM_CONFIG, PlatformBadge, Platform } from './platform-icon'

type LiveStatus = {
  mode: 'demo' | 'live'
  platforms: Record<Platform, { connected: boolean; label: string; detail: string; lastMessageAt: string | null }>
}

export function IntelligenceDashboard({
  messages,
  mode,
  status,
}: {
  messages: ChatMsg[]
  mode: 'demo' | 'live'
  status: LiveStatus | null
}) {
  const analytics = useMemo(() => getAnalytics(messages), [messages])
  const total = Math.max(1, analytics.recent.length)

  return (
    <div className="h-full overflow-y-auto scrollbar-none p-4 space-y-4">
      <section className="glass-panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              AI live brief
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/88">{analytics.summary}</p>
          </div>
          <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold text-cyan-200">
            {mode === 'live' ? 'LIVE MODE' : 'DEMO MODE'}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Meter icon={Flame} label="Hype" value={analytics.hype} color="from-orange-300 to-rose-400" />
        <Meter icon={Sparkles} label="Sentiment" value={analytics.sentimentScore} color="from-emerald-300 to-cyan-300" />
      </div>

      <section className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="w-4 h-4 text-emerald-300" />
            Platform Distribution
          </h2>
          <span className="font-mono text-xs text-muted-foreground">{analytics.velocity}/min</span>
        </div>
        <div className="space-y-3">
          {(['TWITCH', 'KICK', 'X'] as Platform[]).map((platform) => {
            const config = PLATFORM_CONFIG[platform]
            const value = analytics.platforms[platform]
            const width = `${Math.round((value / total) * 100)}%`
            return (
              <div key={platform}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span style={{ color: config.color }}>{config.name}</span>
                  <span className="font-mono text-muted-foreground">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width, backgroundColor: config.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="glass-panel p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="w-4 h-4 text-violet-300" />
          Trending Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {analytics.topics.map((topic) => (
            <span key={topic.label} className="rounded-md border border-white/10 bg-white/[0.045] px-2 py-1 text-xs text-foreground/80">
              {topic.label} <span className="text-muted-foreground">{topic.value}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="glass-panel p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-200" />
          Notable Messages
        </h2>
        <div className="space-y-3">
          {analytics.notable.map((msg) => (
            <div key={msg.id} className="rounded-md border border-white/[0.07] bg-black/15 p-3">
              <div className="mb-1 flex items-center gap-2">
                <PlatformBadge platform={msg.platform} showName={false} />
                <span className="truncate text-xs font-semibold text-foreground/90">{msg.username}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">{msg.metadata?.engagement ?? 0}</span>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{msg.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Users className="w-4 h-4 text-sky-300" />
          Top Contributors
        </h2>
        <div className="space-y-2">
          {analytics.contributors.map((user) => (
            <div key={`${user.platform}-${user.username}`} className="flex items-center gap-2 text-xs">
              <PlatformBadge platform={user.platform} showName={false} />
              <span className="min-w-0 flex-1 truncate text-foreground/85">{user.username}</span>
              <span className="font-mono text-muted-foreground">{user.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Radio className="w-4 h-4 text-emerald-300" />
          Connection Matrix
        </h2>
        <div className="space-y-3">
          {(['TWITCH', 'KICK', 'X'] as Platform[]).map((platform) => {
            const item = status?.platforms?.[platform]
            const connected = mode === 'demo' || Boolean(item?.connected)
            return (
              <div key={platform} className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.75)]' : 'bg-amber-300'}`} />
                  <PlatformBadge platform={platform} />
                  <span className="ml-auto text-[10px] uppercase text-muted-foreground">{connected ? 'online' : 'fallback'}</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {mode === 'demo' ? 'High-fidelity simulated traffic for reliable judging demos.' : item?.detail}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Meter({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="w-4 h-4 text-foreground/80" />
          {label}
        </span>
        <span className="font-mono text-lg font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
