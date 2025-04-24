import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content, receiverId } = await request.json()
        if (!content || !receiverId) {
            return NextResponse.json(
                { error: 'Content and receiverId are required' },
                { status: 400 }
            )
        }

        // Create the message with all necessary data
        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json(message)
    } catch (error) {
        console.error('Error creating message:', error)
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        )
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: userId },
                    { senderId: userId, receiverId: session.user.id },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        // ✅ Mark messages as seen
        await prisma.message.updateMany({
            where: {
                senderId: userId,
                receiverId: session.user.id,
                seen: false,
            },
            data: {
                seen: true,
            },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        )
    }
} 