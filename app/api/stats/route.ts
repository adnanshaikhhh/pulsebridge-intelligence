export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { messageStore } from '@/lib/message-store'

export async function GET() {
  try {
    const messages = messageStore.getRecent(500)
    const now = Date.now()
    const oneMinAgo = now - 60000

    const stats = {
      TWITCH: { total: 0, lastMin: 0, connected: true },
      KICK: { total: 0, lastMin: 0, connected: true },
      X: { total: 0, lastMin: 0, connected: true },
    }

    for (const msg of messages ?? []) {
      const p = msg?.platform as keyof typeof stats
      if (stats[p]) {
        stats[p].total++
        if (new Date(msg?.timestamp ?? 0).getTime() > oneMinAgo) {
          stats[p].lastMin++
        }
      }
    }

    const totalMessages = (messages?.length ?? 0)
    const totalLastMin = stats.TWITCH.lastMin + stats.KICK.lastMin + stats.X.lastMin

    return NextResponse.json({
      platforms: stats,
      totalMessages,
      messagesPerMinute: totalLastMin,
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ platforms: {}, totalMessages: 0, messagesPerMinute: 0 }, { status: 500 })
  }
}
