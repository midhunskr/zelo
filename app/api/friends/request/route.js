import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session:', session);

        if (!session?.user?.id) {
            console.log('No session or user ID found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', body);

        const { receiverId } = body;
        if (!receiverId) {
            console.log('No receiverId provided');
            return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
        }

        // Check if both users exist
        const [sender, receiver] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.user.id } }),
            prisma.user.findUnique({ where: { id: receiverId } })
        ]);

        console.log('Sender:', sender);
        console.log('Receiver:', receiver);

        if (!sender || !receiver) {
            console.log('User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if a friend invitation already exists
        const existingInvitation = await prisma.friendInvitation.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: receiverId },
                    { senderId: receiverId, receiverId: session.user.id }
                ]
            }
        });

        console.log('Existing invitation:', existingInvitation);

        if (existingInvitation) {
            console.log('Invitation already exists');
            return NextResponse.json({ error: 'Friend invitation already exists' }, { status: 400 });
        }

        // Create the friend invitation
        const friendInvitation = await prisma.friendInvitation.create({
            data: {
                senderId: session.user.id,
                receiverId: receiverId,
                status: 'PENDING'
            }
        });

        console.log('Created invitation:', friendInvitation);
        return NextResponse.json(friendInvitation);
    } catch (error) {
        console.error('Friend invitation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 