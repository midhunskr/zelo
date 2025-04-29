export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = session.user.id;

        // Fetch friendships
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: currentUserId },
                    { user2Id: currentUserId }
                ]
            },
            include: {
                user1: {
                    select: { id: true, name: true, email: true, image: true }
                },
                user2: {
                    select: { id: true, name: true, email: true, image: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const pinned = await prisma.pinnedConversation.findMany({
            where: { userId: currentUserId },
            select: { conversationId: true }
        });
        const pinnedIds = pinned.map(p => p.conversationId);

        const deleted = await prisma.deletedConversation.findMany({
            where: { userId: currentUserId },
            select: { conversationId: true }
        });
        const deletedIds = deleted.map(d => d.conversationId);

        // Prepare and enrich conversations
        const conversations = await Promise.all(friendships.map(async (friendship) => {
            const friend = friendship.user1Id === currentUserId ? friendship.user2 : friendship.user1;

            // Skip deleted conversations
            if (deletedIds.includes(friend.id)) return null;

            // Check for unread messages
            const unreadMessage = await prisma.message.findFirst({
                where: {
                    senderId: friend.id,
                    receiverId: currentUserId,
                    seen: false,
                },
                orderBy: { createdAt: 'desc' }
            });

            return {
                id: friend.id,
                name: friend.name,
                email: friend.email,
                image: friend.image,
                lastMessage: null,
                timestamp: friendship.createdAt,
                isPinned: pinnedIds.includes(friend.id),
                unread: !!unreadMessage // ← here we add the unread flag
            };
        }));

        const filtered = conversations.filter(Boolean); // Remove nulls
        const uniqueConversations = filtered.reduce((acc, conv) => {
            if (!acc.find(c => c.id === conv.id)) acc.push(conv);
            return acc;
        }, []);

        return NextResponse.json(uniqueConversations);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}