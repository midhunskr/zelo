import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
    try {
        console.log('Incoming request to /api/friends/reject')

        const session = await getServerSession(authOptions)
        console.log('Session:', session)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        console.log('Request body:', body)

        const requestId = body?.requestId
        if (!requestId) {
            return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
        }

        const friendRequest = await prisma.friendInvitation.findUnique({
            where: { id: requestId }
        })
        console.log('Friend request:', friendRequest)

        if (!friendRequest) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
        }

        if (friendRequest.receiverId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updated = await prisma.friendInvitation.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        })
        console.log('Updated friend request:', updated)

        return NextResponse.json({ message: 'Friend request rejected' })
    } catch (error) {
        console.error('❌ Backend error in /api/friends/reject:', error)
        return NextResponse.json({ error: 'Failed to reject friend request' }, { status: 500 })
    }
}
