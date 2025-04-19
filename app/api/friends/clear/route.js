import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST() {
    try {
        // Delete all friend invitations
        const result = await prisma.friendInvitation.deleteMany({});

        console.log('Cleared friend invitations:', result);
        return NextResponse.json({
            message: 'All friend invitations cleared',
            count: result.count
        });
    } catch (error) {
        console.error('Error clearing friend invitations:', error);
        return NextResponse.json(
            { error: 'Failed to clear friend invitations' },
            { status: 500 }
        );
    }
} 