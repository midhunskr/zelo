import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
    const body = await request.json()
    console.log('[NextAuth]', body)
    return new Response(null, { status: 200 })
} 