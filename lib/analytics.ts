import type { ChatMsg } from './message-store'

export function getAnalytics(messages: ChatMsg[]) {
  const recent = messages.slice(-240)
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  const fiveMinutesAgo = now - 300000
  const lastMinute = recent.filter((msg) => new Date(msg.timestamp).getTime() > oneMinuteAgo)
  const lastFive = recent.filter((msg) => new Date(msg.timestamp).getTime() > fiveMinutesAgo)
  const platforms = { TWITCH: 0, KICK: 0, X: 0 }
  const sentiment = { positive: 0, neutral: 0, negative: 0 }
  const contributors = new Map<string, { username: string; platform: ChatMsg['platform']; count: number; score: number }>()
  const topics = new Map<string, number>()

  for (const msg of recent) {
    platforms[msg.platform] += 1
    const mood = msg.metadata?.sentiment ?? 'neutral'
    sentiment[mood] += 1
    const key = `${msg.platform}:${msg.username}`
    const current = contributors.get(key) ?? { username: msg.username, platform: msg.platform, count: 0, score: 0 }
    current.count += 1
    current.score += msg.metadata?.engagement ?? 1
    contributors.set(key, current)

    const text = `${msg.content} ${msg.hashtag ?? ''}`.toLowerCase()
    for (const token of text.match(/#[a-z0-9_]+|\b[a-z][a-z0-9]{4,}\b/g) ?? []) {
      if (['this', 'that', 'with', 'from', 'should', 'would', 'could', 'actually'].includes(token)) continue
      topics.set(token, (topics.get(token) ?? 0) + 1)
    }
  }

  const positiveRatio = recent.length ? sentiment.positive / recent.length : 0
  const negativeRatio = recent.length ? sentiment.negative / recent.length : 0
  const sentimentScore = Math.round(Math.max(0, Math.min(100, 50 + positiveRatio * 55 - negativeRatio * 45)))
  const velocity = lastMinute.length
  const hype = Math.round(Math.min(100, velocity * 2.4 + positiveRatio * 42 + Math.min(24, lastFive.length / 4)))

  return {
    recent,
    lastMinute,
    platforms,
    sentiment,
    sentimentScore,
    hype,
    velocity,
    summary: buildSummary(lastMinute, sentimentScore, hype),
    notable: recent
      .slice()
      .sort((a, b) => (b.metadata?.engagement ?? 0) - (a.metadata?.engagement ?? 0))
      .slice(0, 4),
    contributors: Array.from(contributors.values())
      .sort((a, b) => b.count + b.score / 100 - (a.count + a.score / 100))
      .slice(0, 5),
    topics: Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value })),
  }
}

function buildSummary(messages: ChatMsg[], sentimentScore: number, hype: number) {
  if (messages.length === 0) return 'Listening for cross-platform movement across Twitch, Kick, and X.'
  const platformCounts = messages.reduce<Record<string, number>>((acc, msg) => {
    acc[msg.platform] = (acc[msg.platform] ?? 0) + 1
    return acc
  }, {})
  const leader = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'TWITCH'
  const tone = sentimentScore >= 68 ? 'positive' : sentimentScore <= 42 ? 'cautious' : 'mixed'
  const pace = hype >= 76 ? 'breakout velocity' : hype >= 45 ? 'steady acceleration' : 'early signal formation'
  return `${leader} is driving the current conversation with ${tone} sentiment and ${pace}. Notable comments are clustering around creator intelligence, live summaries, and message velocity.`
}
