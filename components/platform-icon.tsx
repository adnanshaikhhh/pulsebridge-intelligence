'use client'

import React from 'react'

const TwitchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
)

const KickIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.333 0v24h5.338V14.666L12 20h6.666l-6.666-8 6.666-8H12L6.671 9.333V0z"/>
  </svg>
)

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

export const PLATFORM_CONFIG = {
  TWITCH: {
    name: 'Twitch',
    color: '#9146FF',
    bgColor: 'rgba(145, 70, 255, 0.15)',
    borderColor: 'rgba(145, 70, 255, 0.3)',
    icon: TwitchIcon,
  },
  KICK: {
    name: 'Kick',
    color: '#53FC18',
    bgColor: 'rgba(83, 252, 24, 0.15)',
    borderColor: 'rgba(83, 252, 24, 0.3)',
    icon: KickIcon,
  },
  X: {
    name: 'X',
    color: '#FFFFFF',
    bgColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    icon: XIcon,
  },
} as const

export type Platform = keyof typeof PLATFORM_CONFIG

export function PlatformBadge({ platform, showName = true }: { platform: Platform; showName?: boolean }) {
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.TWITCH
  const Icon = config?.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150"
      style={{
        backgroundColor: config?.bgColor,
        color: config?.color,
        border: `1px solid ${config?.borderColor}`,
      }}
    >
      {Icon && <Icon size={13} />}
      {showName && <span>{config?.name}</span>}
    </span>
  )
}
