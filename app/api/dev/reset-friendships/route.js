import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
    try {
        // Only allow this in development
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json(
                { error: 'This endpoint is only available in development' },
                { status: 403 }
            )
        }

        // Delete all friendship-related data
        await prisma.$transaction([
            // Delete all friendships
            prisma.friendship.deleteMany({}),
            // Delete all friend invitations
            prisma.friendInvitation.deleteMany({}),
            // Delete all pinned conversations
            prisma.pinnedConversation.deleteMany({}),
            // Delete all deleted conversations
            prisma.deletedConversation.deleteMany({})
        ])

        return NextResponse.json({
            message: 'All friendship data has been reset',
            deleted: {
                friendships: true,
                invitations: true,
                pinnedConversations: true,
                deletedConversations: true
            }
        })
    } catch (error) {
        console.error('Error resetting friendships:', error)
        return NextResponse.json(
            { error: 'Failed to reset friendships' },
            { status: 500 }
        )
    }
} 