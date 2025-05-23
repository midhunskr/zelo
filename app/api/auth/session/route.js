export const dynamic = "force-dynamic"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        return Response.json({
            user: session?.user || null,
            expires: session?.expires || null
        })
    } catch (error) {
        console.error('Session error:', error)
        return Response.json({
            user: null,
            expires: null
        })
    }
} 