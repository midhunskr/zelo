'use client'

import { useSession } from 'next-auth/react'
import { useRouter, redirect } from 'next/navigation'
import { useEffect } from 'react'
import ChatInterface from './components/ChatInterface'

export default function Home() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/signin')
        }
    }, [status, router])

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Prevent any content from being rendered if not authenticated
    if (!session || status === 'unauthenticated') {
        router.replace('/signin')
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <ChatInterface />
        </main>
    )
} 