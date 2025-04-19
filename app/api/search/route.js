import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route.js';
import prisma from '../../../lib/prisma';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = new URL(request.url).searchParams;
        const query = searchParams.get('q');
        console.log('Search query:', query);

        if (!query) {
            console.log('No query provided');
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ],
                NOT: {
                    id: session.user.id
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
            take: 10
        });

        console.log('Found users:', users);
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
} 