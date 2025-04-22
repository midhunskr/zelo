import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from "../../../../lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            console.log('No session found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('Fetching friends for user:', session.user.id)

        // Get friendships where the current user is either user1 or user2
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: session.user.id },
                    { user2Id: session.user.id }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                user2: {
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

        console.log('Found friendships:', friendships)

        // Get pinned conversations
        const pinned = await prisma.pinnedConversation.findMany({
            where: { userId: session.user.id },
            select: { conversationId: true }
        })
        const pinnedIds = pinned.map(p => p.conversationId)
        console.log('Pinned IDs:', pinnedIds)

        // Get deleted conversations
        const deleted = await prisma.deletedConversation.findMany({
            where: { userId: session.user.id },
            select: { conversationId: true }
        })
        const deletedIds = deleted.map(d => d.conversationId)
        console.log('Deleted IDs:', deletedIds)

        // Process friendships to get unique conversations
        const conversations = friendships
            .map(friendship => {
                // Determine which user is the friend (not the current user)
                const friend = friendship.user1Id === session.user.id ? friendship.user2 : friendship.user1
                console.log('Processing friendship:', {
                    friendshipId: friendship.id,
                    currentUser: session.user.id,
                    user1: friendship.user1Id,
                    user2: friendship.user2Id,
                    selectedFriend: friend.id
                })

                return {
                    id: friend.id,
                    name: friend.name,
                    email: friend.email,
                    image: friend.image,
                    lastMessage: null,
                    timestamp: friendship.createdAt,
                    isPinned: pinnedIds.includes(friend.id)
                }
            })
            .filter(conversation => !deletedIds.includes(conversation.id))
            // Remove duplicates by keeping only the first occurrence of each conversation
            .reduce((unique, conversation) => {
                if (!unique.some(item => item.id === conversation.id)) {
                    unique.push(conversation)
                }
                return unique
            }, [])

        console.log('Final conversations:', conversations)
        return NextResponse.json(conversations)
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        )
    }
}
