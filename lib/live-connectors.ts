import { messageStore, ChatMsg } from './message-store'
import { generateMessage, startSimulator } from './simulator'

type LiveStatus = {
  mode: 'demo' | 'live'
  platforms: Record<ChatMsg['platform'], {
    connected: boolean
    label: string
    detail: string
    lastMessageAt: string | null
  }>
}

const globalLive = globalThis as unknown as {
  _liveStarted?: boolean
  _liveStatus?: LiveStatus
  WebSocket?: any
}

function defaultStatus(mode: LiveStatus['mode']): LiveStatus {
  return {
    mode,
    platforms: {
      TWITCH: { connected: false, label: 'Twitch IRC', detail: 'Waiting for anonymous IRC WebSocket', lastMessageAt: null },
      KICK: { connected: false, label: 'Kick Pusher', detail: 'Waiting for public Pusher channel', lastMessageAt: null },
      X: { connected: false, label: 'X API', detail: 'Requires X_BEARER_TOKEN for recent search polling', lastMessageAt: null },
    },
  }
}

function mark(platform: ChatMsg['platform'], connected: boolean, detail: string) {
  if (!globalLive._liveStatus) globalLive._liveStatus = defaultStatus('live')
  const current = globalLive._liveStatus.platforms[platform]
  globalLive._liveStatus.platforms[platform] = {
    ...current,
    connected,
    detail,
    lastMessageAt: connected ? current.lastMessageAt : current.lastMessageAt,
  }
}

function pushLiveMessage(message: ChatMsg) {
  if (!globalLive._liveStatus) globalLive._liveStatus = defaultStatus('live')
  globalLive._liveStatus.platforms[message.platform].lastMessageAt = message.timestamp
  messageStore.addMessage(message)
}

function parseTwitchPrivMsg(line: string): ChatMsg | null {
  const match = line.match(/^:([^!]+)!.* PRIVMSG #([^ ]+) :(.+)$/)
  if (!match) return null
  const username = match[1] ?? 'twitch_user'
  const channel = match[2] ?? 'live'
  const content = match[3] ?? ''
  return {
    id: `tw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    platform: 'TWITCH',
    username,
    content,
    avatar: null,
    channel,
    hashtag: null,
    timestamp: new Date().toISOString(),
    metadata: { source: 'live', sentiment: 'neutral', score: 55, engagement: 1 },
  }
}

function startTwitch() {
  const WebSocketImpl = globalLive.WebSocket
  if (!WebSocketImpl) {
    mark('TWITCH', false, 'Runtime has no server WebSocket constructor; demo fallback remains active')
    return
  }

  try {
    const channels = (process.env.TWITCH_CHANNELS ?? 'xqc,pokimane,shroud')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
    const ws = new WebSocketImpl('wss://irc-ws.chat.twitch.tv:443')
    ws.onopen = () => {
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
      ws.send('PASS SCHMOOPIIE')
      ws.send(`NICK justinfan${Math.floor(Math.random() * 90000) + 10000}`)
      channels.forEach((channel) => ws.send(`JOIN #${channel}`))
      mark('TWITCH', true, `Anonymous IRC connected to ${channels.join(', ')}`)
    }
    ws.onmessage = (event: MessageEvent) => {
      const raw = String(event.data ?? '')
      if (raw.startsWith('PING')) {
        ws.send('PONG :tmi.twitch.tv')
        return
      }
      raw.split('\r\n').forEach((line) => {
        const msg = parseTwitchPrivMsg(line)
        if (msg) pushLiveMessage(msg)
      })
    }
    ws.onerror = () => mark('TWITCH', false, 'Twitch IRC connection failed; demo fallback continues')
    ws.onclose = () => mark('TWITCH', false, 'Twitch IRC disconnected; demo fallback continues')
  } catch {
    mark('TWITCH', false, 'Twitch IRC could not start in this runtime')
  }
}

function startKick() {
  const WebSocketImpl = globalLive.WebSocket
  const appKey = process.env.KICK_PUSHER_KEY
  const chatroomIds = (process.env.KICK_CHATROOM_IDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!WebSocketImpl || !appKey || chatroomIds.length === 0) {
    mark('KICK', false, 'Set KICK_PUSHER_KEY and KICK_CHATROOM_IDS for public Pusher live chat')
    return
  }

  try {
    const ws = new WebSocketImpl(`wss://ws-us2.pusher.com/app/${appKey}?protocol=7&client=js&version=8.4.0&flash=false`)
    ws.onopen = () => {
      chatroomIds.forEach((id) => {
        ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatrooms.${id}.v2` } }))
      })
      mark('KICK', true, `Pusher subscribed to ${chatroomIds.length} chatroom(s)`)
    }
    ws.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(String(event.data ?? '{}'))
        if (!String(payload.event ?? '').includes('ChatMessageSentEvent')) return
        const data = JSON.parse(payload.data ?? '{}')
        pushLiveMessage({
          id: `kick_${data.id ?? Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          platform: 'KICK',
          username: data.sender?.username ?? data.username ?? 'kick_user',
          content: data.content ?? data.message ?? '',
          avatar: null,
          channel: data.chatroom_id ? `room-${data.chatroom_id}` : 'live',
          hashtag: null,
          timestamp: new Date().toISOString(),
          metadata: { source: 'live', sentiment: 'neutral', score: 55, engagement: 1 },
        })
      } catch {}
    }
    ws.onerror = () => mark('KICK', false, 'Kick Pusher connection failed; demo fallback continues')
    ws.onclose = () => mark('KICK', false, 'Kick Pusher disconnected; demo fallback continues')
  } catch {
    mark('KICK', false, 'Kick Pusher could not start in this runtime')
  }
}

function startXPolling() {
  const token = process.env.X_BEARER_TOKEN
  const query = process.env.X_QUERY ?? '(MarketBubble OR VibeCodeChallenge OR creator intelligence) -is:retweet lang:en'
  if (!token) {
    mark('X', false, 'Set X_BEARER_TOKEN for recent search polling; paid/approved API access is required')
    return
  }

  const poll = async () => {
    try {
      const url = new URL('https://api.x.com/2/tweets/search/recent')
      url.searchParams.set('query', query)
      url.searchParams.set('max_results', '10')
      url.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id')
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        mark('X', false, `X API returned ${res.status}; demo fallback continues`)
        return
      }
      const json = await res.json()
      mark('X', true, `Polling recent search for ${query}`)
      for (const tweet of json.data ?? []) {
        pushLiveMessage({
          id: `x_${tweet.id}`,
          platform: 'X',
          username: `author_${tweet.author_id ?? 'x'}`,
          content: tweet.text,
          avatar: null,
          channel: null,
          hashtag: '#live',
          timestamp: tweet.created_at ?? new Date().toISOString(),
          metadata: {
            source: 'live',
            sentiment: 'neutral',
            score: 55,
            engagement: tweet.public_metrics?.like_count ?? 0,
            likes: tweet.public_metrics?.like_count,
            retweets: tweet.public_metrics?.retweet_count,
          },
        })
      }
    } catch {
      mark('X', false, 'X polling failed; demo fallback continues')
    }
  }

  poll()
  setInterval(poll, 15000)
}

export function startLiveMode() {
  if (globalLive._liveStarted) return
  globalLive._liveStarted = true
  globalLive._liveStatus = defaultStatus('live')

  startSimulator()
  startTwitch()
  startKick()
  startXPolling()

  setInterval(() => {
    generateMessage('TWITCH', undefined, 'fallback')
  }, 9000)
}

export function getLiveStatus(mode: LiveStatus['mode'] = 'demo') {
  return globalLive._liveStatus ?? defaultStatus(mode)
}
