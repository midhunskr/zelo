import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, image, password } = body

        const updateData = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (image) updateData.image = image
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10)
            updateData.password = hashedPassword
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
