export const dynamic = "force-dynamic"

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request) {
    try {
        const { name, email, password } = await request.json()

        // Validate input
        if (!name || !email || !password) {
            return new Response(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new Response(
                JSON.stringify({ message: 'User already exists' }),
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
                emailVerified: new Date(),
                image: null
            }
        })

        // Remove password from response
        const { hashedPassword: _, ...userWithoutPassword } = user

        return new Response(
            JSON.stringify(userWithoutPassword),
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            { status: 500 }
        )
    }
} 