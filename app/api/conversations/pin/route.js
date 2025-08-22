import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId } = await request.json()
        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            )
        }

        // Check if the conversation exists and belongs to the user
        const conversation = await prisma.friendInvitation.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: conversationId, status: 'ACCEPTED' },
                    { senderId: conversationId, receiverId: session.user.id, status: 'ACCEPTED' }
                ]
            }
        })

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            )
        }

        // Create or update the pinned conversation
        const pinnedConversation = await prisma.pinnedConversation.upsert({
            where: {
                userId_conversationId: {
                    userId: session.user.id,
                    conversationId: conversationId
                }
            },
            update: {
                isPinned: true,
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                conversationId: conversationId,
                isPinned: true
            }
        })

        return NextResponse.json(pinnedConversation)
    } catch (error) {
        console.error('Error pinning conversation:', error)
        return NextResponse.json(
            { error: 'Failed to pin conversation' },
            { status: 500 }
        )
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId } = await request.json()
        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            )
        }

        // Remove the pinned conversation
        await prisma.pinnedConversation.deleteMany({
            where: {
                userId: session.user.id,
                conversationId: conversationId,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error unpinning conversation:', error)
        return NextResponse.json(
            { error: 'Failed to unpin conversation' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log("Fetching pinned for user:", session.user.id);

        // Find all pinned conversations for the user
        const pinned = await prisma.pinnedConversation.findMany({
            where: {
                userId: session.user.id,
                isPinned: true,
            },
            include: {
                conversation: true, // friend (User)
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        // Filter out pinned conversations where the friendship is not accepted
        const filtered = [];
        for (const p of pinned) {
            // Check if friendship is accepted
            const friendship = await prisma.friendInvitation.findFirst({
                where: {
                    status: 'ACCEPTED',
                    OR: [
                        { senderId: session.user.id, receiverId: p.conversationId },
                        { senderId: p.conversationId, receiverId: session.user.id },
                    ],
                },
            });
            if (friendship) {
                // Only include if still friends
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: session.user.id, receiverId: p.conversationId },
                            { senderId: p.conversationId, receiverId: session.user.id },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });
                filtered.push({
                    id: p.conversationId,
                    name: p.conversation.name,
                    email: p.conversation.email,
                    image: p.conversation.image,
                    lastMessage: lastMessage?.content ?? null,
                    isPinned: p.isPinned,
                });
            }
        }

        return NextResponse.json(filtered)
    } catch (error) {
        console.error('Error fetching pinned conversations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pinned conversations' },
            { status: 500 }
        )
    }
}