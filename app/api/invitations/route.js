import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Get all invitations for the current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        const invitations = await prisma.friendInvitation.findMany({
            where: {
                receiverId: session.user.id,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        return new Response(JSON.stringify(invitations), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (error) {
        console.error('Get invitations error:', error)
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
    }
}

// Send a new invitation
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        const { receiverId } = await request.json()

        // Check if invitation already exists
        const existingInvitation = await prisma.friendInvitation.findFirst({
            where: {
                senderId: session.user.id,
                receiverId,
                status: 'PENDING'
            }
        })

        if (existingInvitation) {
            return new Response(
                JSON.stringify({ message: 'Invitation already sent' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )
        }

        // Create new invitation
        const invitation = await prisma.friendInvitation.create({
            data: {
                senderId: session.user.id,
                receiverId,
                status: 'PENDING'
            }
        })

        return new Response(JSON.stringify(invitation), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (error) {
        console.error('Send invitation error:', error)
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
    }
} 