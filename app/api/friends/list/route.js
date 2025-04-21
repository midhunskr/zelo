import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../../lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const acceptedInvitations = await prisma.friendInvitation.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, status: 'ACCEPTED' },
                    { receiverId: session.user.id, status: 'ACCEPTED' }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const otherUsers = acceptedInvitations.map(invitation =>
            invitation.senderId === session.user.id
                ? invitation.receiver.id
                : invitation.sender.id
        )

        const pinned = await prisma.pinnedConversation.findMany({
            where: {
                userId: session.user.id,
                conversationId: { in: otherUsers }
            },
            select: { conversationId: true }
        })

        const pinnedIds = pinned.map(p => p.conversationId)

        const deleted = await prisma.deletedConversation.findMany({
            where: { userId: session.user.id },
            select: { conversationId: true }
        })

        const deletedIds = deleted.map(d => d.conversationId)

        const conversations = acceptedInvitations
            .filter(invitation => {
                const otherUserId = invitation.senderId === session.user.id
                    ? invitation.receiver.id
                    : invitation.sender.id
                return !deletedIds.includes(otherUserId)
            })
            .map(invitation => {
                const otherUser = invitation.senderId === session.user.id
                    ? invitation.receiver
                    : invitation.sender

                const isPinned = pinnedIds.includes(otherUser.id)

                return {
                    id: otherUser.id,
                    name: otherUser.name,
                    email: otherUser.email,
                    image: otherUser.image,
                    lastMessage: null,
                    timestamp: invitation.createdAt,
                    isPinned
                }
            })

        return NextResponse.json(conversations)
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        )
    }
}
