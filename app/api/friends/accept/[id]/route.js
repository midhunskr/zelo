// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import prisma from '../../../../../lib/prisma'
// import { authOptions } from '../../../../../lib/auth'

// export async function POST(request, { params }) {
//     try {
//         const session = await getServerSession(authOptions)
//         console.log('Session:', session)

//         if (!session) {
//             return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
//         }

//         const { id } = params
//         console.log('Friend invitation ID:', id)

//         if (!id) {
//             return NextResponse.json({ error: 'Friend invitation ID is required' }, { status: 400 })
//         }

//         // Find the friend invitation
//         const friendInvitation = await prisma.friendInvitation.findUnique({
//             where: { id },
//             include: {
//                 sender: true,
//                 receiver: true
//             }
//         })

//         console.log('Found friend invitation:', friendInvitation)

//         if (!friendInvitation) {
//             return NextResponse.json({ error: 'Friend invitation not found' }, { status: 404 })
//         }

//         // Verify that the current user is the receiver
//         console.log('Comparing IDs:', {
//             receiverId: friendInvitation.receiverId,
//             currentUserId: session.user.id
//         })

//         if (friendInvitation.receiverId !== session.user.id) {
//             return NextResponse.json({
//                 error: 'Unauthorized - You can only accept invitations sent to you',
//                 details: {
//                     receiverId: friendInvitation.receiverId,
//                     currentUserId: session.user.id
//                 }
//             }, { status: 401 })
//         }

//         // Check if the invitation is already accepted
//         if (friendInvitation.status === 'ACCEPTED') {
//             return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
//         }

//         // Check if the invitation is rejected
//         if (friendInvitation.status === 'REJECTED') {
//             return NextResponse.json({ error: 'This invitation has been rejected' }, { status: 400 })
//         }

//         // Update the friend invitation status to ACCEPTED
//         const updatedInvitation = await prisma.friendInvitation.update({
//             where: { id },
//             data: { status: 'ACCEPTED' }
//         })

//         console.log('Updated invitation:', updatedInvitation)

//         // Create friendship records for both users
//         const friendship = await prisma.friendship.createMany({
//             data: [
//                 {
//                     user1Id: friendInvitation.senderId,
//                     user2Id: friendInvitation.receiverId
//                 },
//                 {
//                     user1Id: friendInvitation.receiverId,
//                     user2Id: friendInvitation.senderId
//                 }
//             ]
//         })

//         console.log('Created friendship:', friendship)

//         return NextResponse.json({
//             message: 'Friend request accepted',
//             friendship: {
//                 user1Id: friendInvitation.senderId,
//                 user2Id: friendInvitation.receiverId
//             }
//         })
//     } catch (error) {
//         console.error('Error accepting friend request:', error)
//         return NextResponse.json(
//             { error: error.message || 'Failed to accept friend request' },
//             { status: 500 }
//         )
//     }
// }


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function POST(request, { params }) {
    try {
        // Get token from request headers (using NEXTAUTH_SECRET)
        const token = await getToken({ req: request })

        console.log('Decoded token:', token)

        if (!token || !token.id) {
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
            currentUserId: token.id
        })

        if (friendInvitation.receiverId !== token.id) {
            return NextResponse.json({
                error: 'Unauthorized - You can only accept invitations sent to you',
                details: {
                    receiverId: friendInvitation.receiverId,
                    currentUserId: token.id
                }
            }, { status: 401 })
        }

        if (friendInvitation.status === 'ACCEPTED') {
            return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
        }

        if (friendInvitation.status === 'REJECTED') {
            return NextResponse.json({ error: 'This invitation has been rejected' }, { status: 400 })
        }

        // Update the friend invitation status to ACCEPTED
        const updatedInvitation = await prisma.friendInvitation.update({
            where: { id },
            data: { status: 'ACCEPTED' }
        })

        console.log('Updated invitation:', updatedInvitation)

        // Create friendship records for both users
        const friendship = await prisma.friendship.createMany({
            data: [
                {
                    user1Id: friendInvitation.senderId,
                    user2Id: friendInvitation.receiverId
                },
                {
                    user1Id: friendInvitation.receiverId,
                    user2Id: friendInvitation.senderId
                }
            ]
        })

        console.log('Created friendship:', friendship)

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
