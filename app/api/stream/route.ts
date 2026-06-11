export const dynamic = "force-dynamic"

import { messageStore, ChatMsg } from '@/lib/message-store'
import { startSimulator } from '@/lib/simulator'
import { startLiveMode, getLiveStatus } from '@/lib/live-connectors'

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get('mode') === 'live' ? 'live' : 'demo'
  if (mode === 'live') startLiveMode()
  else startSimulator()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send recent messages as initial batch
      const recent = messageStore.getRecent(50)
      const data = JSON.stringify({ type: 'initial', messages: recent, status: getLiveStatus(mode) })
      controller.enqueue(encoder.encode(`data: ${data}\n\n`))

      // Subscribe to new messages
      const unsub = messageStore.subscribe((msg: ChatMsg) => {
        try {
          const data = JSON.stringify({ type: 'message', message: msg })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          unsub()
        }
      })

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          const data = JSON.stringify({ type: 'heartbeat', status: getLiveStatus(mode) })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          clearInterval(heartbeat)
          unsub()
        }
      }, 15000)

      // Cleanup on close
      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(''))
        } catch {
          clearInterval(checkClosed)
          clearInterval(heartbeat)
          unsub()
        }
      }, 30000)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
