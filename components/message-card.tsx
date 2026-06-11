'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Repeat2, ShieldCheck, Sparkles } from 'lucide-react'
import { PlatformBadge, PLATFORM_CONFIG, Platform } from './platform-icon'
import { UserHoverCard } from './user-hover-card'
import type { ChatMsg } from '@/lib/message-store'

function formatTime(ts: string | undefined) {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  } catch {
    return ''
  }
}

function sentimentClass(sentiment?: string) {
  if (sentiment === 'positive') return 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
  if (sentiment === 'negative') return 'border-rose-300/20 bg-rose-300/10 text-rose-200'
  return 'border-white/10 bg-white/[0.05] text-muted-foreground'
}

export function MessageCard({ message, index, allMessages }: { message: ChatMsg; index: number; allMessages?: ChatMsg[] }) {
  const platform = (message?.platform ?? 'TWITCH') as Platform
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.TWITCH
  const source = message.metadata?.source ?? 'demo'
  const sentiment = message.metadata?.sentiment ?? 'neutral'
  const engagement = message.metadata?.engagement ?? 0
  const isNotable = engagement >= 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: index > 200 ? 0 : 0.22, ease: 'easeOut' }}
      className={`group mx-2 flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.035] sm:mx-3 sm:px-4 ${isNotable ? 'border-cyan-500/20 bg-cyan-500/5' : ''}`}
      style={{ boxShadow: `inset 3px 0 0 ${config.color}44` }}
    >
      <UserHoverCard
        username={message.username ?? 'unknown'}
        platform={platform}
        messages={allMessages ?? []}
      >
        <div
          className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border text-sm font-bold shadow-lg cursor-pointer transition-transform hover:scale-105"
          style={{
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            color: config.color,
          }}
        >
          {(message.username ?? '?')[0]?.toUpperCase() ?? '?'}
        </div>
      </UserHoverCard>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <UserHoverCard
            username={message.username ?? 'unknown'}
            platform={platform}
            messages={allMessages ?? []}
          >
            <span className="truncate text-sm font-semibold cursor-pointer hover:underline" style={{ color: config.color }}>
              {message.username ?? 'unknown'}
            </span>
          </UserHoverCard>
          
          {message.metadata?.verified && <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />}
          <PlatformBadge platform={platform} />
          
          {sentiment !== 'neutral' && (
            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${sentimentClass(sentiment)}`}>
              {sentiment === 'positive' ? <Sparkles className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
              {sentiment}
            </span>
          )}
          
          {isNotable && (
            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-200">
              <Sparkles className="w-3 h-3" />
              Notable
            </span>
          )}
          
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
          {message.content}
        </p>

        {(message.hashtag || message.channel) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {message.hashtag && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary/90">
                {message.hashtag}
              </span>
            )}
            {message.channel && platform !== 'X' && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                #{message.channel}
              </span>
            )}
          </div>
        )}

        {engagement > 0 && (
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            {message.metadata?.likes ? (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {message.metadata.likes}
              </span>
            ) : null}
            {message.metadata?.retweets ? (
              <span className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                {message.metadata.retweets}
              </span>
            ) : null}
            {engagement > 0 && (
              <span className="flex items-center gap-1 text-cyan-400/80">
                +{engagement} engagement
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}