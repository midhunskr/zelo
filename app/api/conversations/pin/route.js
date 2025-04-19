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
        await prisma.pinnedConversation.delete({
            where: {
                userId_conversationId: {
                    userId: session.user.id,
                    conversationId: conversationId
                }
            }
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