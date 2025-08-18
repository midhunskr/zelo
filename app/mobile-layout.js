'use client'

import { useEffect, useState } from 'react'
import ChatInterface from './components/ChatInterface'
import ChatMobileView from './mobile/layout'
import ChatDesktopView from './components/ChatDesktopView'

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
    <ChatInterface ViewComponent={isMobile ? ChatMobileView : ChatDesktopView} />
  )
}
