'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        router.push('/')
    }, [router])

    return null
} 