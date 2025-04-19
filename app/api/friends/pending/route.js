// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]/route';
// import prisma from '../../../../lib/prisma';

// export async function GET() {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             console.log('No session found in pending invitations');
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         console.log('Fetching pending invitations for user:', {
//             userId: session.user.id,
//             userEmail: session.user.email
//         });

//         // First, check all invitations in the database
//         const allInvitations = await prisma.friendInvitation.findMany({
//             select: {
//                 id: true,
//                 senderId: true,
//                 receiverId: true,
//                 status: true
//             }
//         });

//         console.log('All invitations in database:', allInvitations);

//         // Then fetch pending invitations for the current user
//         const pendingInvitations = await prisma.friendInvitation.findMany({
//             where: {
//                 OR: [
//                     { receiverId: session.user.id, status: 'PENDING' },
//                     { senderId: session.user.id, status: 'PENDING' }
//                 ]
//             },
//             include: {
//                 sender: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true,
//                         image: true
//                     }
//                 },
//                 receiver: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true,
//                         image: true
//                     }
//                 }
//             },
//             orderBy: {
//                 createdAt: 'desc'
//             }
//         });

//         console.log('Found pending invitations:', {
//             count: pendingInvitations.length,
//             invitations: pendingInvitations.map(inv => ({
//                 id: inv.id,
//                 senderId: inv.senderId,
//                 receiverId: inv.receiverId,
//                 status: inv.status,
//                 senderEmail: inv.sender.email,
//                 receiverEmail: inv.receiver.email
//             }))
//         });

//         return NextResponse.json({ invitations: pendingInvitations });
//     } catch (error) {
//         console.error('Error fetching pending invitations:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch pending invitations' },
//             { status: 500 }
//         );
//     }
// }


import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '../../../../lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            console.log('No session found in pending invitations')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch received invitations
        const receivedInvitations = await prisma.friendInvitation.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING'
            },
            include: {
                sender: {
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

        // Fetch sent invitations
        const sentInvitations = await prisma.friendInvitation.findMany({
            where: {
                senderId: userId,
                status: 'PENDING'
            },
            include: {
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

        console.log('Pending invitations fetched:', {
            receivedCount: receivedInvitations.length,
            sentCount: sentInvitations.length
        })

        return NextResponse.json({
            receivedInvitations,
            sentInvitations
        })
    } catch (error) {
        console.error('Error fetching pending invitations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pending invitations' },
            { status: 500 }
        )
    }
}
