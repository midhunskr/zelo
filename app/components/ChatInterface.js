'use client'

import { useEffect, useState } from 'react'

import Layout from '../mobile/layout'
import ChatDesktopView from './ChatDesktopView'
import { MobileChatProvider } from '@/app/context/MobileChatContext';

export default function MobileLayout() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768) // tailwind md breakpoint
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div>
            {isMobile ? (
                <Layout />
            ) : (
                <MobileChatProvider>
                    <ChatDesktopView />
                </MobileChatProvider>
            )}
        </div>
    )
}


