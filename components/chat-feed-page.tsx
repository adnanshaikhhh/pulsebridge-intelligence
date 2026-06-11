'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatFeed } from './chat-feed'
import { ActivityChart } from './activity-chart'
import { IntelligenceDashboard } from './intelligence-dashboard'
import { Header } from './header'
import { StreamPanel } from './stream-panel'
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose, PanelLeft } from 'lucide-react'
import type { ChatMsg } from '@/lib/message-store'
import type { Platform } from './platform-icon'

type Mode = 'demo' | 'live'
type LiveStatus = {
  mode: Mode
  platforms: Record<Platform, { connected: boolean; label: string; detail: string; lastMessageAt: string | null }>
}

export function ChatFeedPage() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showStreamPanel, setShowStreamPanel] = useState(true)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [mode, setMode] = useState<Mode>('demo')
  const [status, setStatus] = useState<LiveStatus | null>(null)

  // Calculate toggle button positions
  const leftToggleLeft = showStreamPanel ? '340px' : '16px'
  const rightToggleRight = showSidebar ? '408px' : '16px'

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Premium backdrop with gradient grid */}
      <div className="pointer-events-none absolute inset-0 premium-backdrop" />
      
      <Header mode={mode} onModeChange={setMode} />

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
        {/* Left: Stream Panel (collapsible) */}
        <AnimatePresence>
          {showStreamPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mr-3 hidden min-h-0 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black/25 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex"
            >
              <StreamPanel mode={mode} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Stream Panel Toggle (left side) */}
        <button
          onClick={() => setShowStreamPanel((s) => !s)}
          className="absolute top-1/2 z-20 hidden h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/[0.08] bg-white/[0.05] transition-all hover:bg-white/[0.1] lg:flex"
          style={{ left: leftToggleLeft }}
          aria-label={showStreamPanel ? 'Collapse stream panel' : 'Expand stream panel'}
        >
          {showStreamPanel ? <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" /> : <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        {/* Center: Chat Feed */}
        <section className="glass-shell min-w-0 flex-1 overflow-hidden">
          <ChatFeed mode={mode} onMessagesChange={setMessages} onStatusChange={setStatus} />
        </section>

        {/* Intelligence Sidebar Toggle (right side) */}
        <button
          onClick={() => setShowSidebar((s) => !s)}
          className="absolute top-1/2 z-20 hidden h-12 w-6 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-white/[0.08] bg-white/[0.05] transition-all hover:bg-white/[0.1] lg:flex"
          style={{ right: rightToggleRight }}
          aria-label={showSidebar ? 'Collapse intelligence panel' : 'Expand intelligence panel'}
        >
          {showSidebar ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        {/* Right: Intelligence Panel (collapsible) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="ml-3 hidden min-h-0 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black/20 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:flex"
            >
              <div className="h-[34%] min-h-[250px] border-b border-white/[0.07]">
                <ActivityChart messages={messages} />
              </div>
              <div className="min-h-0 flex-1">
                <IntelligenceDashboard messages={messages} mode={mode} status={status} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}