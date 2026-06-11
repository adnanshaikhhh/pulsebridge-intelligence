export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500)
    const search = searchParams.get('search')

    const where: any = {}
    if (platform && platform !== 'ALL') {
      where.platform = platform
    }
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { username: { contains: search } }
      ]
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return NextResponse.json({ messages: messages?.reverse?.() ?? [] })
  } catch (error: any) {
    console.error('Messages API error:', error)
    return NextResponse.json({ messages: [], error: error?.message ?? 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, username, content, channel, hashtag, metadata } = body ?? {}

    if (!platform || !username || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        platform,
        username,
        content,
        channel: channel ?? null,
        hashtag: hashtag ?? null,
        metadata: metadata ?? {},
      }
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Create message error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to create' }, { status: 500 })
  }
}
