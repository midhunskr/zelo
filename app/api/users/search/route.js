// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../../auth/[...nextauth]/route'
// import prisma from '@/lib/prisma'

// export async function GET(request) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session) {
//             console.log('No session found')
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }

//         const { searchParams } = new URL(request.url)
//         const query = searchParams.get('q')

//         console.log('Search query:', query)
//         console.log('Session user:', session.user)

//         if (!query) {
//             return NextResponse.json({ users: [] })
//         }

//         const users = await prisma.user.findMany({
//             where: {
//                 OR: [
//                     { name: { contains: query, mode: 'insensitive' } },
//                     { email: { contains: query, mode: 'insensitive' } }
//                 ],
//                 NOT: {
//                     id: session.user.id // Exclude current user
//                 }
//             },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 image: true
//             },
//             take: 10 // Limit results
//         })

//         console.log('Found users:', users)
//         return NextResponse.json({ users })
//     } catch (error) {
//         console.error('Search error:', error)
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//     }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            console.log('[SEARCH] No session')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = new URL(request.url).searchParams
        const query = searchParams.get('q')
        if (!query) {
            console.log('[SEARCH] Empty query')
            return NextResponse.json({ users: [] })
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ],
                NOT: { id: session.user.id }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
            take: 10
        })

        const currentUserId = session.user.id

        const enrichedUsers = await Promise.all(users.map(async (user) => {
            console.log(`[SEARCH] Checking user: ${user.id} (${user.name})`)

            // Check for accepted friendship
            const isFriend = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        { user1Id: currentUserId, user2Id: user.id },
                        { user1Id: user.id, user2Id: currentUserId }
                    ]
                }
            })

            if (isFriend) {
                console.log(`✅ ${user.name} is a FRIEND`)
                return { ...user, invitationStatus: 'FRIEND' }
            }

            // Check for pending invitations either way
            const pendingInvite = await prisma.friendInvitation.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: user.id, status: 'PENDING' },
                        { senderId: user.id, receiverId: currentUserId, status: 'PENDING' }
                    ]
                }
            })

            if (pendingInvite) {
                console.log(`🕒 ${user.name} has a PENDING request`)
                return { ...user, invitationStatus: 'PENDING' }
            }

            console.log(`➖ ${user.name} has NO connection`)
            return { ...user, invitationStatus: 'NONE' }
        }))

        console.log('[SEARCH] Final enriched users:', enrichedUsers)

        return NextResponse.json({ users: enrichedUsers })

    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 })
    }
}