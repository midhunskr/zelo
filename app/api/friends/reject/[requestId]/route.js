import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '../../../../../lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId } = params

        // Find the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: requestId }
        })

        if (!friendRequest) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
        }

        // Verify that the current user is the receiver
        if (friendRequest.receiverId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Update the friend request status to REJECTED
        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        })

        return NextResponse.json({ message: 'Friend request rejected' })
    } catch (error) {
        console.error('Error rejecting friend request:', error)
        return NextResponse.json(
            { error: 'Failed to reject friend request' },
            { status: 500 }
        )
    }
} 