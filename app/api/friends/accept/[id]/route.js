import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        console.log('Session:', session)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
        }

        const { id } = params
        console.log('Friend invitation ID:', id)

        if (!id) {
            return NextResponse.json({ error: 'Friend invitation ID is required' }, { status: 400 })
        }

        // Find the friend invitation
        const friendInvitation = await prisma.friendInvitation.findUnique({
            where: { id },
            include: {
                sender: true,
                receiver: true
            }
        })

        console.log('Found friend invitation:', friendInvitation)

        if (!friendInvitation) {
            return NextResponse.json({ error: 'Friend invitation not found' }, { status: 404 })
        }

        // Verify that the current user is the receiver
        console.log('Comparing IDs:', {
            receiverId: friendInvitation.receiverId,
            currentUserId: session.user.id
        })

        if (friendInvitation.receiverId !== session.user.id) {
            return NextResponse.json({
                error: 'Unauthorized - You can only accept invitations sent to you',
                details: {
                    receiverId: friendInvitation.receiverId,
                    currentUserId: session.user.id
                }
            }, { status: 401 })
        }

        // Check if the invitation is already accepted
        if (friendInvitation.status === 'ACCEPTED') {
            return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
        }

        // Check if the invitation is rejected
        if (friendInvitation.status === 'REJECTED') {
            return NextResponse.json({ error: 'This invitation has been rejected' }, { status: 400 })
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        user1Id: friendInvitation.senderId,
                        user2Id: friendInvitation.receiverId
                    },
                    {
                        user1Id: friendInvitation.receiverId,
                        user2Id: friendInvitation.senderId
                    }
                ]
            }
        })

        if (existingFriendship) {
            // If friendship exists, just update the invitation status
            const updatedInvitation = await prisma.friendInvitation.update({
                where: { id },
                data: { status: 'ACCEPTED' }
            })
            return NextResponse.json({
                message: 'Friend request accepted (friendship already exists)',
                friendship: existingFriendship
            })
        }

        // Start a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Update the friend invitation status to ACCEPTED
            const updatedInvitation = await tx.friendInvitation.update({
                where: { id },
                data: { status: 'ACCEPTED' }
            })

            // Create a single friendship record
            const friendship = await tx.friendship.create({
                data: {
                    user1Id: friendInvitation.senderId,
                    user2Id: friendInvitation.receiverId
                }
            })

            return { updatedInvitation, friendship }
        })

        console.log('Transaction result:', result)

        return NextResponse.json({
            message: 'Friend request accepted',
            friendship: {
                user1Id: friendInvitation.senderId,
                user2Id: friendInvitation.receiverId
            }
        })
    } catch (error) {
        console.error('Error accepting friend request:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to accept friend request' },
            { status: 500 }
        )
    }
}
