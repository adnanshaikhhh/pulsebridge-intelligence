'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radio, Sparkles, Zap, Activity } from 'lucide-react'
import { PlatformBadge } from './platform-icon'

export function Header({
  mode,
  onModeChange,
}: {
  mode: 'demo' | 'live'
  onModeChange: (mode: 'demo' | 'live') => void
}) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="relative z-20 px-2 py-2 sm:px-4">
      <div className="glass-shell flex min-h-16 items-center justify-between gap-4 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {/* Animated Logo */}
          <motion.div
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.35), 0 0 20px rgba(6, 182, 212, 0.2)',
            }}
          >
            <Radio className="h-5 w-5 text-white" />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-cyan-300/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
                PulseBridge Intelligence
              </h1>
              
              {/* Live Status Badge */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:flex"
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Real-Time
              </motion.span>
            </div>
            
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Unified signal across</span>
              <PlatformBadge platform="TWITCH" />
              <PlatformBadge platform="KICK" />
              <PlatformBadge platform="X" />
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Demo Mode Banner */}
          {mode === 'demo' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden items-center gap-2 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 px-3 py-1.5 sm:flex"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-200">Demo Mode Active</span>
            </motion.div>
          )}
          
          {/* Time Display */}
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
            <Activity className="h-3.5 w-3.5 text-violet-300" />
            <span className="font-mono text-xs text-foreground/80">{time}</span>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex rounded-xl border border-white/10 bg-black/30 p-1 shadow-inner shadow-black/20 backdrop-blur-sm">
            {(['demo', 'live'] as const).map((item) => (
              <button
                key={item}
                onClick={() => onModeChange(item)}
                className={`relative rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition-all ${
                  mode === item
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25'
                    : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                }`}
              >
                {mode === item && (
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500"
                    style={{ zIndex: -1 }}
                  />
                )}
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}