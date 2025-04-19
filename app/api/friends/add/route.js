import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { getIO } from '../../../../lib/socket';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { friendId } = await request.json();
        console.log('Friend invitation request:', {
            senderId: session.user.id,
            receiverId: friendId,
            senderEmail: session.user.email
        });

        if (!friendId) {
            return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
        }

        // Verify both users exist
        const [sender, receiver] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.user.id } }),
            prisma.user.findUnique({ where: { id: friendId } })
        ]);

        console.log('User verification:', {
            senderExists: !!sender,
            receiverExists: !!receiver,
            senderId: session.user.id,
            receiverId: friendId,
            senderEmail: sender?.email,
            receiverEmail: receiver?.email
        });

        if (!sender || !receiver) {
            console.log('User not found:', { senderExists: !!sender, receiverExists: !!receiver });
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if friend invitation already exists
        const existingInvitation = await prisma.friendInvitation.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: friendId },
                    { senderId: friendId, receiverId: session.user.id }
                ]
            }
        });

        console.log('Existing invitation check:', {
            exists: !!existingInvitation,
            invitation: existingInvitation
        });

        if (existingInvitation) {
            console.log('Existing invitation found:', existingInvitation);
            return NextResponse.json(
                { error: 'Friend invitation already exists' },
                { status: 400 }
            );
        }

        // Create friend invitation
        const friendInvitation = await prisma.friendInvitation.create({
            data: {
                senderId: session.user.id,
                receiverId: friendId,
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
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        console.log('Created friend invitation:', {
            id: friendInvitation.id,
            senderId: friendInvitation.senderId,
            receiverId: friendInvitation.receiverId,
            status: friendInvitation.status,
            createdAt: friendInvitation.createdAt
        });

        // Verify the invitation was created
        const verifyInvitation = await prisma.friendInvitation.findUnique({
            where: { id: friendInvitation.id }
        });

        console.log('Verification of created invitation:', {
            exists: !!verifyInvitation,
            invitation: verifyInvitation
        });

        // Emit socket event to notify the receiver
        const io = getIO();
        if (io) {
            io.to(`user:${friendId}`).emit('friend:invitation', {
                invitation: friendInvitation,
                sender: {
                    id: sender.id,
                    name: sender.name,
                    email: sender.email,
                    image: sender.image
                }
            });
        }

        return NextResponse.json(friendInvitation);
    } catch (error) {
        console.error('Friend invitation error:', error);
        return NextResponse.json(
            { error: 'Failed to send friend invitation' },
            { status: 500 }
        );
    }
} 