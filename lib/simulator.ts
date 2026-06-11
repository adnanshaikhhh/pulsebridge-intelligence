import { messageStore, ChatMsg } from './message-store'

const TWITCH_CHANNELS = ['xqc', 'pokimane', 'shroud', 'kai_cenat', 'hasanabi']
const KICK_CHANNELS = ['adin', 'xqc', 'trainwreckstv', 'destiny', 'nickmercs']
const X_HASHTAGS = ['#MarketBubble', '#VibeCodeChallenge', '#creatorintel', '#livestreaming', '#buildinpublic']

const TWITCH_MESSAGES = [
  ['PogChamp this read is unreal', 'positive'],
  ['chat is moving too fast for this', 'positive'],
  ['clip that prediction panel', 'positive'],
  ['the sentiment swing just called it', 'positive'],
  ['not the hype meter going vertical', 'positive'],
  ['this dashboard is actually clean', 'positive'],
  ['wait it caught the Kick spike too', 'neutral'],
  ['mods are going to need that notable messages view', 'positive'],
  ['LULW no way the summary updated live', 'positive'],
  ['this is creator command center energy', 'positive'],
  ['the X chatter is leaking into stream', 'neutral'],
  ['that take aged badly', 'negative'],
]

const KICK_MESSAGES = [
  ['W dashboard, this is what stream teams need', 'positive'],
  ['green chat is absolutely flying right now', 'positive'],
  ['someone send this to every creator manager', 'positive'],
  ['the velocity readout is money', 'positive'],
  ['that notable message should be pinned', 'positive'],
  ['chat sentiment just flipped bullish', 'positive'],
  ['viewer spike incoming', 'positive'],
  ['too much noise in chat today', 'negative'],
  ['Kick feed landed before Twitch for me', 'neutral'],
  ['this looks like a real production tool', 'positive'],
]

const X_MESSAGES = [
  ['Real-time creator intelligence is underrated. Unified Twitch, Kick, and X context changes the whole workflow.', 'positive'],
  ['Watching #VibeCodeChallenge entries and this one feels like an actual product, not a mockup.', 'positive'],
  ['The interesting part is cross-platform sentiment. Chat alone misses the market reaction happening on X.', 'neutral'],
  ['Creator teams need live summaries more than another raw chat window.', 'positive'],
  ['If the demo handles burst traffic smoothly, this should score well.', 'positive'],
  ['X API access is still the hardest part for hackathon builds, but the UX can make the limitation clear.', 'neutral'],
  ['Message velocity plus notable comments is the money view.', 'positive'],
  ['A pretty dashboard is not enough unless the feed feels alive.', 'negative'],
  ['Market Bubble challenge is bringing out some wild builds today.', 'positive'],
]

const TWITCH_USERS = ['xQcFan42', 'PogAnalyst', 'TTV_Lurker', 'emote_enjoyer', 'based_chatter', 'W_collector', 'hype_beast99', 'mods_awake', 'stream_ops', 'clip_director']
const KICK_USERS = ['green_gang', 'W_spammer', 'clip_it', 'vibe_checker', 'content_king', 'chat_warrior', 'kick_ops', 'gifted_sub', 'trend_hunter']
const X_USERS = ['marketmaven', 'creator_ops', 'dev_sarah', 'growth_lens', 'streamintel', 'build_public', 'ai_builder', 'bubblewatcher']

type Platform = ChatMsg['platform']
type Sentiment = NonNullable<ChatMsg['metadata']['sentiment']>

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

function randomId(prefix = 'demo') {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`
}

function sentimentScore(sentiment: Sentiment) {
  if (sentiment === 'positive') return 72 + Math.floor(Math.random() * 24)
  if (sentiment === 'negative') return 14 + Math.floor(Math.random() * 28)
  return 44 + Math.floor(Math.random() * 18)
}

function contributorTier(platform: Platform): ChatMsg['metadata']['tier'] {
  const common: NonNullable<ChatMsg['metadata']['tier']>[] = ['viewer', 'viewer', 'subscriber', 'moderator']
  return platform === 'X' ? pick(['builder', 'creator', 'viewer', 'viewer']) : pick(common)
}

let interval: ReturnType<typeof setTimeout> | null = null

export function startSimulator() {
  if (interval) return

  for (let i = 0; i < 42; i++) {
    const platform = pick<Platform>(['TWITCH', 'TWITCH', 'KICK', 'X'])
    generateMessage(platform, Date.now() - (42 - i) * (1400 + Math.random() * 1800))
  }

  const scheduleNext = () => {
    const burst = Math.random() > 0.78
    const delay = burst ? 260 + Math.random() * 520 : 900 + Math.random() * 1900
    interval = setTimeout(() => {
      const platform = pick<Platform>(['TWITCH', 'TWITCH', 'TWITCH', 'KICK', 'KICK', 'X'])
      generateMessage(platform)
      if (burst && Math.random() > 0.45) {
        setTimeout(() => generateMessage(pick<Platform>(['TWITCH', 'KICK', 'X'])), 160)
      }
      scheduleNext()
    }, delay)
  }

  scheduleNext()
}

export function generateMessage(platform: Platform, ts?: number, source: ChatMsg['metadata']['source'] = 'demo') {
  const timestamp = ts ? new Date(ts).toISOString() : new Date().toISOString()
  const [content, sentiment] = platform === 'TWITCH'
    ? pick(TWITCH_MESSAGES)
    : platform === 'KICK'
      ? pick(KICK_MESSAGES)
      : pick(X_MESSAGES)

  const score = sentimentScore(sentiment as Sentiment)
  const msg: ChatMsg = {
    id: randomId(source),
    platform,
    username: platform === 'TWITCH' ? pick(TWITCH_USERS) : platform === 'KICK' ? pick(KICK_USERS) : pick(X_USERS),
    content,
    avatar: null,
    channel: platform === 'TWITCH' ? pick(TWITCH_CHANNELS) : platform === 'KICK' ? pick(KICK_CHANNELS) : null,
    hashtag: platform === 'X' ? pick(X_HASHTAGS) : null,
    timestamp,
    metadata: {
      sentiment: sentiment as Sentiment,
      score,
      engagement: platform === 'X' ? 40 + Math.floor(Math.random() * 280) : 1 + Math.floor(Math.random() * 35),
      emotes: platform !== 'X' && Math.random() > 0.45,
      likes: platform === 'X' ? Math.floor(Math.random() * 1200) : undefined,
      retweets: platform === 'X' ? Math.floor(Math.random() * 180) : undefined,
      verified: Math.random() > 0.82,
      tier: contributorTier(platform),
      source,
    },
  }

  messageStore.addMessage(msg)
}

export function stopSimulator() {
  if (interval) {
    clearTimeout(interval)
    interval = null
  }
}
