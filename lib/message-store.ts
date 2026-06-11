// In-memory message store + SSE broadcast for real-time feed

export interface ChatMsg {
  id: string
  platform: 'TWITCH' | 'KICK' | 'X'
  username: string
  content: string
  avatar: string | null
  channel: string | null
  hashtag: string | null
  timestamp: string
  metadata: {
    sentiment?: 'positive' | 'neutral' | 'negative'
    score?: number
    engagement?: number
    emotes?: boolean
    likes?: number
    retweets?: number
    verified?: boolean
    tier?: 'viewer' | 'subscriber' | 'moderator' | 'creator' | 'builder'
    source?: 'demo' | 'live' | 'fallback'
    [key: string]: any
  }
}

type Listener = (msg: ChatMsg) => void

class MessageStore {
  private listeners: Set<Listener> = new Set()
  private messages: ChatMsg[] = []
  private maxMessages = 500

  addMessage(msg: ChatMsg) {
    if (this.messages.some((existing) => existing.id === msg.id)) return
    this.messages.push(msg)
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages)
    }
    this.listeners.forEach((fn: Listener) => {
      try { fn(msg) } catch {}
    })
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  getRecent(count = 100): ChatMsg[] {
    return this.messages.slice(-count)
  }

  getCount() { return this.messages.length }
}

const globalStore = globalThis as unknown as { _msgStore?: MessageStore }
if (!globalStore._msgStore) globalStore._msgStore = new MessageStore()
export const messageStore = globalStore._msgStore
