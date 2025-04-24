import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(_, { params }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const friendId = params.friendId

    try {
        // Delete messages between both users
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId }
                ]
            }
        })

        // Delete friendship
        await prisma.friendInvitation.deleteMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId }
                ]
            }
        })

        // If you have a 'friendship' table too, delete those
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { user1Id: currentUserId, user2Id: friendId },
                    { user1Id: friendId, user2Id: currentUserId }
                ]
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting friend and messages:', error)
        return NextResponse.json({ error: 'Failed to unfriend' }, { status: 500 })
    }
}
