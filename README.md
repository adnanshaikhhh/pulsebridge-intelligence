# PulseBridge Intelligence

**Real-time unified creator intelligence dashboard — Twitch, Kick, and X in one living command center.**

A premium $10,000 Market Bubble Vibe Code Challenge submission built for judges who expect production quality.

![Dashboard Preview](public/og-image.png)

## What It Does

PulseBridge aggregates real-time chat and social signals from **Twitch**, **Kick**, and **X/Twitter** into a single AI-powered command center. It doesn't just display messages — it extracts intelligence: sentiment trends, message velocity, notable activity, top contributors, and live AI summaries.

## Key Features

### 🖥️ Stream Panel
Embedded video player showing featured live channels. In demo mode, simulates realistic stream activity with viewer counts and channel metadata.

### 💬 Unified Chat Feed
- Real-time SSE-powered message stream
- Platform filtering (Twitch / Kick / X / All)
- Full-text search across usernames and content
- Auto-scroll with smart detection
- Sentiment badges on each message
- Notable message highlighting

### 🧠 Intelligence Dashboard
- **AI Live Brief** — dynamic summary of current activity
- **Hype Meter** — engagement velocity visualization
- **Sentiment Score** — positive/neutral/negative breakdown
- **Platform Distribution** — live proportional charts
- **Trending Topics** — hashtag clustering
- **Notable Messages** — highest engagement highlights
- **Top Contributors** — most active community members
- **Connection Matrix** — platform connection status

### 👆 User Hover Intelligence Cards
Hover any username to reveal a rich profile card showing:
- Community rank
- Message count & velocity
- Average engagement
- Sentiment breakdown
- Recent messages
- Activity timeline
- Tier (Creator/Builder/Mod/Sub/Viewer/New)

### 📊 Activity Velocity Chart
Real-time area chart showing message throughput per 5-second bucket, broken down by platform.

### 🎛️ Demo Mode
High-fidelity simulated traffic for reliable demos. Generates realistic chat bursts, sentiment swings, and engagement spikes. **Demo mode never fails.**

### 🌙 Premium UI/UX
- Glassmorphism panels with backdrop blur
- Animated gradient logo with pulse rings
- Smooth page transitions and micro-interactions
- Dark mode by default
- Responsive: desktop, laptop, tablet, mobile
- Custom scrollbars and selection colors
- Grid overlay backdrop pattern

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | DM Sans, Plus Jakarta Sans, JetBrains Mono (Google Fonts) |
| Database | Prisma + PostgreSQL |
| Auth | NextAuth.js |
| State | React hooks + SSE |

## Quick Start

```bash
# Clone and install
npm install

# Set up environment
cp .env .env.local
# Edit .env.local with your DATABASE_URL and API keys

# Run database migrations
npx prisma migrate deploy

# Seed demo data
npm run prisma:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — demo mode activates automatically.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pulsebridge
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Live API credentials (demo mode works without these)
TWITCH_IRC_TOKEN=
KICK_PUSHER_KEY=
X_BEARER_TOKEN=
```

## Architecture

```
app/
├── api/
│   ├── messages/     # CRUD for stored messages
│   ├── stats/        # Aggregated platform statistics
│   └── stream/       # SSE endpoint — demo + live modes
├── layout.tsx        # Root layout with fonts & theme
└── page.tsx          # Single-page dashboard app

components/
├── chat-feed-page.tsx    # 3-panel layout orchestrator
├── chat-feed.tsx         # Main message feed
├── stream-panel.tsx      # Video player + stream list
├── intelligence-dashboard.tsx  # AI insights panel
├── activity-chart.tsx    # Velocity area chart
├── message-card.tsx      # Individual message with hover cards
├── user-hover-card.tsx   # Username hover profile
├── header.tsx            # Navigation + mode switcher
├── stats-bar.tsx         # Live stats ticker
├── platform-icon.tsx     # Platform badges + SVG icons
└── ui/                   # Shadcn/ui component primitives

lib/
├── analytics.ts      # getAnalytics() — all intelligence computation
├── message-store.ts  # In-memory store + SSE pub/sub
├── simulator.ts      # Demo traffic generator
├── live-connectors.ts # Real API connectors (Twitch IRC, Kick Pusher, X)
└── utils.ts          # cn() helper + formatters

prisma/
└── schema.prisma     # ChatMessage, PlatformStats models
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stream` | GET (SSE) | Real-time message stream |
| `/api/messages` | GET/POST | Stored message CRUD |
| `/api/stats` | GET | Platform statistics |

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel with `vercel deploy`. The app uses the App Router and requires Node.js 18+.

## GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: PulseBridge Intelligence"
gh repo create pulsebridge-intelligence --public --push
```

## License

MIT