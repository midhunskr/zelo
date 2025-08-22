'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useNotifications } from '@/app/hooks/useNotifications'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function BottomTabBar() {
    const { notifications } = useNotifications()
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Chat',
            activeIcon: '/icons/chat-active.png',
            inactiveIcon: '/icons/chat.png',
            path: '/mobile'
        },
        {
            name: 'Invitations',
            activeIcon: '/icons/invitations-active.png',
            inactiveIcon: '/icons/invitations.png',
            path: '/mobile/invitations'
        },
        {
            name: 'Friends',
            activeIcon: '/icons/friends-active.png',
            inactiveIcon: '/icons/friends.png',
            path: '/mobile/friends'
        },
        {
            name: 'Profile',
            activeIcon: '/icons/profile-active.png',
            inactiveIcon: '/icons/profile.png',
            path: '/mobile/profile'
        }
    ]

    const activeIndex = navItems.findIndex((item) => item.path === pathname)

    return (
        <div className="p-[.4rem] bg-card-light-outer dark:bg-card-dark-outer rounded-full
                    border border-card-stroke-light dark:border-card-stroke-dark md:hidden">
            <div className="relative flex items-center justify-around h-16 bg-inner-surface-light dark:bg-inner-surface-dark
                      rounded-full shadow-card-light dark:shadow-card-dark border border-card-stroke-light dark:border-card-stroke-dark md:border-none">

                {/* Active Selector */}
                {activeIndex !== -1 && (
                    <motion.div
                        className="absolute top-0 left-[2.05rem] w-5 h-1 bg-blue rounded-full"
                        initial={false}
                        animate={{ x: activeIndex * 85.5 }} // 64 = width + gap, tweak if needed
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    />
                )}

                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => router.push(item.path)}
                        className={`relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors duration-200 ${pathname === item.path
                                ? 'text-blue dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Image
                            src={pathname === item.path ? item.activeIcon : item.inactiveIcon}
                            alt={item.name}
                            width={26}
                            height={26}
                            className="mb-1"
                        />
                        {item.name === 'Invitations' && notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 border border-white dark:border-gray-800 shadow">
                                {notifications.length > 9 ? '9+' : notifications.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
