export const dynamic = 'force-dynamic'

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
