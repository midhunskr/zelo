import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId, action } = await request.json();
        if (!requestId || !action) {
            return NextResponse.json(
                { error: 'Request ID and action are required' },
                { status: 400 }
            );
        }

        if (!['ACCEPT', 'REJECT'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be ACCEPT or REJECT' },
                { status: 400 }
            );
        }

        // Find the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: requestId },
            include: {
                sender: true,
                receiver: true
            }
        });

        if (!friendRequest) {
            return NextResponse.json(
                { error: 'Friend request not found' },
                { status: 404 }
            );
        }

        // Verify the current user is the receiver
        if (friendRequest.receiverId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to respond to this request' },
                { status: 403 }
            );
        }

        if (action === 'ACCEPT') {
            // Create friendship entries for both users
            await prisma.$transaction([
                prisma.friendship.create({
                    data: {
                        userId: friendRequest.senderId,
                        friendId: friendRequest.receiverId
                    }
                }),
                prisma.friendship.create({
                    data: {
                        userId: friendRequest.receiverId,
                        friendId: friendRequest.senderId
                    }
                }),
                prisma.friendRequest.update({
                    where: { id: requestId },
                    data: { status: 'ACCEPTED' }
                })
            ]);

            return NextResponse.json({
                message: 'Friend request accepted',
                friendship: {
                    user: friendRequest.sender,
                    friend: friendRequest.receiver
                }
            });
        } else {
            // Update request status to REJECTED
            await prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' }
            });

            return NextResponse.json({
                message: 'Friend request rejected'
            });
        }
    } catch (error) {
        console.error('Friend request response error:', error);
        return NextResponse.json(
            { error: 'Failed to process friend request' },
            { status: 500 }
        );
    }
} 