import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pendingRequests = await prisma.friendRequest.findMany({
            where: {
                receiverId: session.user.id,
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
        });

        return NextResponse.json({
            requests: pendingRequests
        });
    } catch (error) {
        console.error('Friend request notification error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch friend requests' },
            { status: 500 }
        );
    }
} 