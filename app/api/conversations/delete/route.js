import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

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

        // Delete all messages in the conversation
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: conversationId },
                    { senderId: conversationId, receiverId: session.user.id }
                ]
            }
        })

        // Delete the friend invitation (conversation)
        await prisma.friendInvitation.delete({
            where: {
                id: conversation.id
            }
        })

        // Delete any pinned conversation record
        await prisma.pinnedConversation.deleteMany({
            where: {
                OR: [
                    { userId: session.user.id, conversationId: conversationId },
                    { userId: conversationId, conversationId: session.user.id }
                ]
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting conversation:', error)
        return NextResponse.json(
            { error: 'Failed to delete conversation' },
            { status: 500 }
        )
    }
} 