'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ExternalLink, Users, Eye, TrendingUp, ChevronDown, ChevronUp, Radio, X, Maximize2 } from 'lucide-react'
import { Platform, PLATFORM_CONFIG, PlatformBadge } from './platform-icon'

interface FeaturedStream {
  id: string
  platform: Platform
  channel: string
  title: string
  category?: string
  viewerCount?: number
  isLive?: boolean
  thumbnail?: string
}

const DEMO_STREAMS: FeaturedStream[] = [
  {
    id: '1',
    platform: 'TWITCH',
    channel: 'xqc',
    title: ' reacting to $10,000 Vibe Code submissions | !socials',
    category: 'Just Chatting',
    viewerCount: 48320,
    isLive: true,
  },
  {
    id: '2',
    platform: 'KICK',
    channel: 'trainwreckstv',
    title: ' gambling review + market analysis | /socials',
    category: 'Slots',
    viewerCount: 22450,
    isLive: true,
  },
  {
    id: '3',
    platform: 'TWITCH',
    channel: 'pokimane',
    title: ' building our intelligence dashboard! 🚀',
    category: 'Art',
    viewerCount: 31200,
    isLive: true,
  },
  {
    id: '4',
    platform: 'X',
    channel: 'MarketBubbleHQ',
    title: ' Real-time creator intelligence thread 🧵',
    isLive: false,
  },
]

function formatViewers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function StreamThumbnail({ stream, onSelect }: { stream: FeaturedStream; onSelect: () => void }) {
  const config = PLATFORM_CONFIG[stream.platform]
  
  // Generate a gradient thumbnail based on platform color
  const gradientId = `thumb-grad-${stream.id}`
  
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full text-left rounded-xl overflow-hidden border border-white/[0.08] bg-black/20 transition-all hover:border-white/[0.15] group"
    >
      {/* Thumbnail background */}
      <div className="relative h-28 overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={stream.platform === 'TWITCH' ? '#9146FF' : stream.platform === 'KICK' ? '#53FC18' : '#ffffff'} stopOpacity="0.15" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </svg>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }} />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        
        {/* Live badge */}
        {stream.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/90 text-white text-[10px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
        
        {/* Platform badge */}
        <div className="absolute top-2 right-2">
          <PlatformBadge platform={stream.platform} showName={false} />
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-foreground/90">{stream.channel}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            stream.isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-muted-foreground'
          }`}>
            {stream.isLive ? 'Live' : 'Post'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{stream.title}</p>
        {stream.viewerCount && stream.isLive && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Eye className="w-3 h-3" />
            {formatViewers(stream.viewerCount)} viewers
            {stream.category && <span className="ml-auto text-primary/80">{stream.category}</span>}
          </div>
        )}
      </div>
    </motion.button>
  )
}

export function StreamPanel({ mode }: { mode: 'demo' | 'live' }) {
  const [selectedStream, setSelectedStream] = useState<FeaturedStream | null>(null)
  const [showAll, setShowAll] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // In demo mode, pre-select first stream
  useEffect(() => {
    if (mode === 'demo' && !selectedStream) {
      setSelectedStream(DEMO_STREAMS[0])
    }
  }, [mode, selectedStream])

  const streams = DEMO_STREAMS

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Creator Streams</h3>
            {selectedStream?.isLive && (
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {streams.filter(s => s.isLive).length} live
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-white/[0.05] transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div className="h-full flex flex-col p-3 gap-3">
              {/* Featured Video Player */}
              <div className="relative flex-shrink-0 rounded-xl overflow-hidden border border-white/[0.1] bg-black/40">
                {selectedStream ? (
                  <>
                    {/* Video embed area - using iframe for real streams or placeholder for demo */}
                    <div className="relative aspect-video bg-gradient-to-br from-black/60 to-black/40">
                      {selectedStream.platform !== 'X' && selectedStream.isLive ? (
                        <iframe
                          src={`https://player.twitch.tv/?channel=${selectedStream.channel}&parent=localhost&muted=true&autoplay=false`}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-2xl border border-white/20 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center mb-4">
                            <Radio className="w-8 h-8 text-white/70" />
                          </div>
                          <p className="text-sm font-medium text-white/60">{selectedStream.channel}</p>
                          <p className="text-xs text-white/40 mt-1">{selectedStream.title}</p>
                          {selectedStream.viewerCount && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
                              <Eye className="w-3.5 h-3.5" />
                              {formatViewers(selectedStream.viewerCount)} watching
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Top bar */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformBadge platform={selectedStream.platform} />
                          {selectedStream.isLive && (
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/90 text-white text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {selectedStream.viewerCount && selectedStream.isLive && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white/80 text-xs">
                              <Eye className="w-3 h-3" />
                              {formatViewers(selectedStream.viewerCount)}
                            </span>
                          )}
                          {selectedStream.platform !== 'X' && (
                            <a
                              href={`https://${selectedStream.platform.toLowerCase()}.com/${selectedStream.channel}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stream info bar */}
                    <div className="p-3 bg-white/[0.03] border-t border-white/[0.05]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground/90">{selectedStream.channel}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{selectedStream.title}</p>
                        </div>
                        {selectedStream.category && (
                          <span className="flex-shrink-0 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] text-muted-foreground">
                            {selectedStream.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground">
                    <Radio className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">Select a stream to watch</p>
                  </div>
                )}
              </div>

              {/* Stream list */}
              <div className="flex-1 overflow-y-auto scrollbar-none space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {streams.length} channels
                  </span>
                  <span className="text-[11px] text-emerald-400/80">
                    {streams.filter(s => s.isLive).length} live
                  </span>
                </div>
                {streams.map((stream) => (
                  <StreamThumbnail
                    key={stream.id}
                    stream={stream}
                    onSelect={() => setSelectedStream(stream)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}