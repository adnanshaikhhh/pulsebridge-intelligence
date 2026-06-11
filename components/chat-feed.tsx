'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowDown, MessageSquare, WifiOff, Gauge } from 'lucide-react'
import { MessageCard } from './message-card'
import { StatsBar } from './stats-bar'
import { PLATFORM_CONFIG, Platform } from './platform-icon'
import type { ChatMsg } from '@/lib/message-store'

type FilterType = 'ALL' | 'TWITCH' | 'KICK' | 'X'

type LiveStatus = {
  mode: 'demo' | 'live'
  platforms: Record<Platform, { connected: boolean; label: string; detail: string; lastMessageAt: string | null }>
}

export function ChatFeed({
  mode,
  onMessagesChange,
  onStatusChange,
}: {
  mode: 'demo' | 'live'
  onMessagesChange?: (messages: ChatMsg[]) => void
  onStatusChange?: (status: LiveStatus) => void
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [search, setSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [connected, setConnected] = useState(false)
  const [newMsgCount, setNewMsgCount] = useState(0)
  const feedRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Connect to SSE stream
  useEffect(() => {
    const connect = () => {
      try {
        const es = new EventSource(`/api/stream?mode=${mode}`)
        eventSourceRef.current = es

        es.onopen = () => setConnected(true)
        es.onerror = () => {
          setConnected(false)
          es.close()
          setTimeout(connect, 3000)
        }
        es.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event?.data ?? '{}')
            if (data?.type === 'initial' && data?.messages) {
              setMessages(data.messages)
              onStatusChange?.(data.status)
            } else if (data?.type === 'message' && data?.message) {
              setMessages((prev: ChatMsg[]) => {
                const next = [...(prev ?? []), data.message]
                if (next.length > 500) return next.slice(-500)
                return next
              })
              if (!autoScroll) {
                setNewMsgCount((c: number) => c + 1)
              }
            } else if (data?.type === 'heartbeat' && data?.status) {
              onStatusChange?.(data.status)
            }
          } catch {}
        }
      } catch {
        setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      eventSourceRef.current?.close?.()
    }
  }, [mode, autoScroll]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onMessagesChange?.(messages)
  }, [messages, onMessagesChange])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  // Detect manual scroll
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 100
    if (atBottom && !autoScroll) {
      setAutoScroll(true)
      setNewMsgCount(0)
    } else if (!atBottom && autoScroll) {
      setAutoScroll(false)
    }
  }, [autoScroll])

  const scrollToBottom = useCallback(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
      setAutoScroll(true)
      setNewMsgCount(0)
    }
  }, [])

  // Filter messages
  const filteredMessages = useMemo(() => {
    let msgs = messages ?? []
    if (filter !== 'ALL') {
      msgs = msgs.filter((m: ChatMsg) => m?.platform === filter)
    }
    if (search?.trim()) {
      const q = search.toLowerCase()
      msgs = msgs.filter((m: ChatMsg) =>
        (m?.content ?? '').toLowerCase().includes(q) ||
        (m?.username ?? '').toLowerCase().includes(q)
      )
    }
    return msgs.slice(-220)
  }, [messages, filter, search])

  const filters: FilterType[] = ['ALL', 'TWITCH', 'KICK', 'X']

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 text-cyan-200" />
              Creator intelligence command center
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Live market pulse from chat, social, and creator communities.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Twitch, Kick, and X messages are normalized into one real-time feed with source labels, velocity, sentiment, and signal extraction.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <StatsBar />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search username or message..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50"
          />
        </div>

        {/* Platform filters */}
        <div className="flex items-center gap-1.5">
          {filters.map((f: FilterType) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                filter === f
                  ? 'bg-white/[0.1] border-white/[0.15] text-foreground'
                  : 'bg-transparent border-transparent text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
              }`}
              style={
                filter === f && f !== 'ALL'
                  ? {
                      backgroundColor: PLATFORM_CONFIG[f as Platform]?.bgColor,
                      borderColor: PLATFORM_CONFIG[f as Platform]?.borderColor,
                      color: PLATFORM_CONFIG[f as Platform]?.color,
                    }
                  : undefined
              }
            >
              {f === 'ALL' ? 'All' : PLATFORM_CONFIG[f as Platform]?.name ?? f}
            </button>
          ))}
        </div>

        {/* Connection indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          {connected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {mode === 'live' ? 'Live mode' : 'Demo live'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <WifiOff className="w-3.5 h-3.5" />
              Reconnecting...
            </span>
          )}
        </div>
      </div>

      {/* Message feed */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        className="scrollbar-none relative flex-1 space-y-1 overflow-y-auto py-2"
      >
        {(filteredMessages?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Waiting for messages...</p>
          </div>
        ) : (
          filteredMessages.map((msg: ChatMsg, i: number) => (
            <MessageCard key={msg?.id ?? i} message={msg} index={i} allMessages={messages} />
          ))
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!autoScroll && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-primary-foreground text-sm font-medium shadow-lg hover:bg-primary transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
            {newMsgCount > 0 ? `${newMsgCount} new messages` : 'Scroll to bottom'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}