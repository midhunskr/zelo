import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get accepted friend invitations
        const acceptedInvitations = await prisma.friendInvitation.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, status: 'ACCEPTED' },
                    { receiverId: session.user.id, status: 'ACCEPTED' }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
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
        });

        // Transform the data to show the other user in each conversation
        const conversations = acceptedInvitations.map(invitation => {
            const otherUser = invitation.senderId === session.user.id ? invitation.receiver : invitation.sender;
            return {
                id: otherUser.id,
                name: otherUser.name,
                email: otherUser.email,
                image: otherUser.image,
                lastMessage: null, // We'll add this later when implementing messages
                timestamp: invitation.createdAt
            };
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
} 