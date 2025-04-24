import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await request.json()

  await prisma.message.updateMany({
    where: {
      senderId: userId,
      receiverId: session.user.id,
      seen: false
    },
    data: { seen: true }
  })

  return NextResponse.json({ success: true })
}