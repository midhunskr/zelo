import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Accept invitation
export async function POST(request, { params }) {
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

        const invitationId = params.id
        const { action } = await request.json()

        const invitation = await prisma.friendInvitation.findUnique({
            where: { id: invitationId }
        })

        if (!invitation || invitation.receiverId !== session.user.id) {
            return new Response(
                JSON.stringify({ message: 'Invitation not found' }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )
        }

        if (action === 'accept') {
            // Accept invitation and create friendship
            await prisma.$transaction([
                prisma.friendInvitation.update({
                    where: { id: invitationId },
                    data: { status: 'ACCEPTED' }
                }),
                prisma.friendship.create({
                    data: {
                        user1Id: invitation.senderId,
                        user2Id: invitation.receiverId
                    }
                })
            ])
        } else if (action === 'reject') {
            // Reject invitation
            await prisma.friendInvitation.update({
                where: { id: invitationId },
                data: { status: 'REJECTED' }
            })
        }

        return new Response(
            JSON.stringify({ message: `Invitation ${action}ed successfully` }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
    } catch (error) {
        console.error('Handle invitation error:', error)
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