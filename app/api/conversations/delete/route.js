import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '../../../../lib/prisma'

export async function DELETE(request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await request.json()

    await prisma.deletedConversation.create({
        data: {
            userId: session.user.id,
            conversationId
        }
    })

    return NextResponse.json({ success: true })
}