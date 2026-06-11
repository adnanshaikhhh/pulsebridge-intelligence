# PulseBridge Intelligence

> **$10,000 Market Bubble Vibe Code Challenge — Submission**

**[🚀 LIVE DEMO — Click to View](https://nextjsspace-alpha-two.vercel.app)**

*Real-time unified creator intelligence dashboard — Twitch, Kick, and X in one living command center.*

---

## What It Does

PulseBridge aggregates real-time chat and social signals from **Twitch**, **Kick**, and **X/Twitter** into a single AI-powered command center. It doesn't just display messages — it extracts intelligence: sentiment trends, message velocity, notable activity, top contributors, trending topics, and live AI summaries.

The application operates in **Demo Mode** by default (simulated realistic traffic, zero configuration required) or **Live Mode** when API credentials are provided.

---

## Live Demo

**Production URL:** [https://nextjsspace-alpha-two.vercel.app](https://nextjsspace-alpha-two.vercel.app)

**GitHub Repository:** [https://github.com/adnanshaikhhh/pulsebridge-intelligence](https://github.com/adnanshaikhhh/pulsebridge-intelligence)

---

## Feature List

| Feature | Description | Status |
|---------|-------------|--------|
| **Stream Panel** | Embedded video player with 4 live channels, viewer counts, and channel metadata | ✅ |
| **Unified Chat Feed** | Real-time SSE message stream with platform filtering and search | ✅ |
| **Hover Intelligence Cards** | Rich username profile cards with rank, sentiment, engagement stats | ✅ |
| **Message Cards** | Sentiment badges, emoji reactions, notable highlights, engagement scores | ✅ |
| **Intelligence Dashboard** | AI brief, hype meter, sentiment score, platform distribution, trending topics | ✅ |
| **Activity Velocity Chart** | Real-time area chart with 5-second buckets per platform | ✅ |
| **Demo Mode** | High-fidelity simulated traffic — never fails, always impressive | ✅ |
| **Premium UI/UX** | Glassmorphism, animated gradients, dark theme, responsive layout | ✅ |

---

## Architecture Overview

```
app/
├── api/
│   ├── messages/       # Stored message CRUD
│   ├── stats/          # Aggregated platform statistics
│   └── stream/         # SSE endpoint — demo + live modes
├── layout.tsx          # Root layout with fonts & theme
└── page.tsx            # Single-page dashboard app

components/
├── chat-feed-page.tsx       # 3-panel layout orchestrator
├── chat-feed.tsx            # Main message feed
├── stream-panel.tsx         # Video player + stream list
├── intelligence-dashboard.tsx  # AI insights panel
├── activity-chart.tsx      # Velocity area chart
├── message-card.tsx         # Message display + hover cards
├── user-hover-card.tsx      # Username hover profile
└── header.tsx             # Navigation + mode switcher

lib/
├── analytics.ts       # getAnalytics() — intelligence computation
├── message-store.ts   # In-memory store + SSE pub/sub
├── simulator.ts       # Demo traffic generator
└── utils.ts           # Helpers + formatters

prisma/
└── schema.prisma      # ChatMessage, PlatformStats models
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Charts | Recharts |
| Database | Prisma + PostgreSQL |
| Auth | NextAuth.js |
| State | React hooks + SSE (Server-Sent Events) |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/adnanshaikhhh/pulsebridge-intelligence.git
cd pulsebridge-intelligence

# Install dependencies
npm install --legacy-peer-deps

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

Open [http://localhost:3000](http://localhost:3000) — **Demo mode activates automatically** (no API keys required).

---

## Local Development

```bash
# Development mode
npm run dev

# Production build
npm run build

# Production start
npm start

# Lint
npm run lint
```

**Demo Mode:** No configuration needed. The app generates realistic simulated traffic on page load.

**Live Mode:** Add credentials to `.env.local` and click the **Live** button in the header.

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pulsebridge
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional — Live Mode (demo mode works without these)
TWITCH_IRC_TOKEN=
KICK_PUSHER_KEY=
X_BEARER_TOKEN=
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI and login
npm install -g vercel
npx vercel login

# Deploy to production
npx vercel --prod --yes
```

The project automatically detects Next.js and configures the build pipeline with `prisma generate` pre-step.

### Build Notes

- Build command: `prisma generate && next build`
- Install command: `npm install --legacy-peer-deps`
- Output directory: `.next` (Next.js default)
- Requires Node.js 18+

---

## Screenshots

> Preview image available at `public/og-image.png`

![PulseBridge Intelligence Dashboard](public/og-image.png)

---

## Submission Notes

### Competition
**$10,000 Market Bubble Vibe Code Challenge** — Real-time creator intelligence platform

### Submission Highlights
- **4 live features built from scratch**: Stream Panel, Hover Intelligence Cards, Activity Velocity Chart, Unified Chat Feed
- **Demo mode** provides reliable, impressive performance with zero configuration
- **Production verified**: Zero console errors, smooth animations, all panels functional
- **Responsive**: Works on desktop, laptop, tablet, and mobile
- **Dark theme** with glassmorphism design — premium visual aesthetic

### Known Limitations
- Live Mode requires real Twitch/Kick/X API credentials
- Demo Mode is the default and fully functional without any API keys

### GitHub Repository
- **Public:** Yes
- **License:** MIT
- **Branch:** `master`
- **Commits:** 5 (clean history)

---

## License

MIT