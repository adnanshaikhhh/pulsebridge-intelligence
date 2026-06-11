'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Activity, TrendingUp, Clock, 
  ShieldCheck, Star, Zap, Heart,
  BarChart2, ChevronRight, Award
} from 'lucide-react'
import { PLATFORM_CONFIG, Platform, PlatformBadge } from './platform-icon'
import type { ChatMsg } from '@/lib/message-store'

interface UserHoverCardProps {
  username: string
  platform: Platform
  messages: ChatMsg[]
  children: React.ReactNode
}

interface UserStats {
  username: string
  platform: Platform
  totalMessages: number
  recentMessages: ChatMsg[]
  avgEngagement: number
  totalEngagement: number
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  sentimentScore: number
  peakActivity: string
  tier: 'viewer' | 'subscriber' | 'moderator' | 'creator' | 'builder' | 'new'
  communityRank: number
  firstSeen: string
  lastSeen: string
  topHashtags: { label: string; count: number }[]
  messageVelocity: number // msgs per minute
  isActive: boolean
}

function getUserStats(username: string, platform: Platform, messages: ChatMsg[]): UserStats {
  const userMsgs = messages.filter(m => m.username === username && m.platform === platform)
  const recentMsgs = userMsgs.slice(-20)
  
  if (userMsgs.length === 0) {
    return {
      username,
      platform,
      totalMessages: 0,
      recentMessages: [],
      avgEngagement: 0,
      totalEngagement: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      sentimentScore: 50,
      peakActivity: 'Unknown',
      tier: 'new',
      communityRank: 0,
      firstSeen: 'Just now',
      lastSeen: 'Just now',
      topHashtags: [],
      messageVelocity: 0,
      isActive: false,
    }
  }

  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 }
  let totalEngagement = 0
  const hashtags: Record<string, number> = {}
  const hourCounts: Record<number, number> = {}

  for (const msg of userMsgs) {
    const sentiment = msg.metadata?.sentiment ?? 'neutral'
    sentimentBreakdown[sentiment]++
    totalEngagement += msg.metadata?.engagement ?? 1
    
    if (msg.hashtag) {
      hashtags[msg.hashtag] = (hashtags[msg.hashtag] ?? 0) + 1
    }
    
    const hour = new Date(msg.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
  }

  const positiveRatio = sentimentBreakdown.positive / Math.max(1, userMsgs.length)
  const negativeRatio = sentimentBreakdown.negative / Math.max(1, userMsgs.length)
  const sentimentScore = Math.round(Math.max(0, Math.min(100, 50 + positiveRatio * 55 - negativeRatio * 45)))

  // Find peak activity hour
  let peakHour = 12
  let maxHourCount = 0
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxHourCount) {
      maxHourCount = count
      peakHour = parseInt(hour)
    }
  }
  const peakActivity = `${peakHour.toString().padStart(2, '0')}:00`

  // Determine tier based on message count and engagement
  let tier: UserStats['tier'] = 'new'
  const count = userMsgs.length
  const avgEngagement = totalEngagement / Math.max(1, count)
  
  if (count >= 100 || avgEngagement >= 80) tier = 'creator'
  else if (count >= 50 || avgEngagement >= 50) tier = 'builder'
  else if (count >= 20 || avgEngagement >= 25) tier = 'moderator'
  else if (count >= 5) tier = 'subscriber'
  else tier = 'viewer'

  // Top hashtags
  const topHashtags = Object.entries(hashtags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }))

  // Community rank (simulated based on message count)
  const communityRank = Math.max(1, 1000 - Math.floor(Math.log(count + 1) * 150))

  // First and last seen
  const sortedMsgs = [...userMsgs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const formatTimeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Calculate message velocity (msgs per minute in last 5 mins)
  const fiveMinsAgo = Date.now() - 300000
  const recentCount = userMsgs.filter(m => new Date(m.timestamp).getTime() > fiveMinsAgo).length
  const messageVelocity = Math.round(recentCount / 5 * 10) / 10

  // Check if active recently (within 30 seconds)
  const lastMsg = userMsgs[userMsgs.length - 1]
  const isActive = lastMsg && (Date.now() - new Date(lastMsg.timestamp).getTime()) < 30000

  return {
    username,
    platform,
    totalMessages: count,
    recentMessages: recentMsgs.slice(-3).reverse(),
    avgEngagement: Math.round(avgEngagement),
    totalEngagement,
    sentimentBreakdown,
    sentimentScore,
    peakActivity,
    tier,
    communityRank,
    firstSeen: formatTimeAgo(sortedMsgs[0]?.timestamp ?? new Date().toISOString()),
    lastSeen: formatTimeAgo(lastMsg?.timestamp ?? new Date().toISOString()),
    topHashtags,
    messageVelocity,
    isActive,
  }
}

const TIER_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  creator: { color: 'text-violet-300', bg: 'bg-violet-500/20', label: 'Creator', icon: <Star className="w-3 h-3" /> },
  builder: { color: 'text-cyan-300', bg: 'bg-cyan-500/20', label: 'Builder', icon: <Zap className="w-3 h-3" /> },
  moderator: { color: 'text-amber-300', bg: 'bg-amber-500/20', label: 'Mod', icon: <ShieldCheck className="w-3 h-3" /> },
  subscriber: { color: 'text-emerald-300', bg: 'bg-emerald-500/20', label: 'Sub', icon: <Award className="w-3 h-3" /> },
  viewer: { color: 'text-muted-foreground', bg: 'bg-white/10', label: 'Viewer', icon: <Activity className="w-3 h-3" /> },
  new: { color: 'text-muted-foreground', bg: 'bg-white/5', label: 'New', icon: <Clock className="w-3 h-3" /> },
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/80">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function UserHoverCard({ username, platform, messages, children }: UserHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const stats = useMemo(() => getUserStats(username, platform, messages), [username, platform, messages])
  const config = PLATFORM_CONFIG[platform]
  const tierConfig = TIER_CONFIG[stats.tier]

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        })
      }
      setIsVisible(true)
    }, 200) // 200ms delay for performance
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100)
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={handleMouseLeave}
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-80 rounded-xl border border-white/[0.12] bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border border-white/20"
                    style={{
                      backgroundColor: config.bgColor,
                      borderColor: config.borderColor,
                      color: config.color,
                    }}
                  >
                    {username[0]?.toUpperCase() ?? '?'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/90 truncate">{username}</span>
                      {stats.isActive && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <PlatformBadge platform={platform} showName={false} />
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${tierConfig.color} ${tierConfig.bg}`}>
                        {tierConfig.icon}
                        {tierConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono" style={{ color: config.color }}>
                      #{stats.communityRank}
                    </div>
                    <div className="text-[10px] text-muted-foreground">community rank</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-4 border-b border-white/[0.06] grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Messages
                    </span>
                    <span className="font-mono font-semibold">{stats.totalMessages}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Velocity
                    </span>
                    <span className="font-mono font-semibold">{stats.messageVelocity}/m</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Avg Eng
                    </span>
                    <span className="font-mono font-semibold">{stats.avgEngagement}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Peak Hr
                    </span>
                    <span className="font-mono font-semibold">{stats.peakActivity}</span>
                  </div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Sentiment Score
                  </span>
                  <span className={`font-mono font-semibold ${
                    stats.sentimentScore >= 65 ? 'text-emerald-400' : 
                    stats.sentimentScore <= 40 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {stats.sentimentScore}/100
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-emerald-400/80 rounded-l-full" 
                    style={{ width: `${stats.sentimentBreakdown.positive}%` }} 
                  />
                  <div 
                    className="bg-muted rounded-none" 
                    style={{ width: `${stats.sentimentBreakdown.neutral}%` }} 
                  />
                  <div 
                    className="bg-red-400/80 rounded-r-full" 
                    style={{ width: `${stats.sentimentBreakdown.negative}%` }} 
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>{stats.sentimentBreakdown.positive} positive</span>
                  <span>{stats.sentimentBreakdown.neutral} neutral</span>
                  <span>{stats.sentimentBreakdown.negative} negative</span>
                </div>
              </div>

              {/* Recent Messages */}
              {stats.recentMessages.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Recent Messages</span>
                  </div>
                  <div className="space-y-2">
                    {stats.recentMessages.map((msg, i) => (
                      <div key={i} className="text-xs p-2 rounded-md bg-white/[0.03] border border-white/[0.04]">
                        <p className="text-foreground/80 line-clamp-2 leading-relaxed">{msg.content}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between text-[10px] text-muted-foreground">
                <span>First seen: {stats.firstSeen}</span>
                <span>Last seen: {stats.lastSeen}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}