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
            <div className="relative flex items-center justify-center gap-14 h-16 bg-inner-surface-light dark:bg-inner-surface-dark
                      rounded-full shadow-card-light dark:shadow-card-dark border border-card-stroke-light dark:border-card-stroke-dark md:border-none">

                {/* Active Selector */}
                {activeIndex !== -1 && (
                    <motion.div
                        className="absolute top-0 left-[1.65rem] w-6 h-1 bg-blue rounded-full xs:hidden"
                        initial={false}
                        animate={{ x: activeIndex * 84 }} // 64 = width + gap, tweak if needed
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    />
                )}

                {activeIndex !== -1 && (
                    <motion.div
                        className="absolute top-0 left-[1.7rem] w-6 h-1 bg-blue rounded-full hidden xs:block"
                        initial={false}
                        animate={{ x: activeIndex * 88 }} // 64 = width + gap, tweak if needed
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    />
                )}

                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => router.push(item.path)}
                        className='relative  transition-colors duration-200'
                    >
                        <img
                            src={pathname === item.path ? item.activeIcon : item.inactiveIcon}
                            alt={item.name}
                            className='w-7 h-7 xs:w-8 xs:h-8'
                        />
                        {item.name === 'Invitations' && notifications.length > 0 && (
                            <div>
                                <span className="absolute flex items-center justify-center rounded-full px-1
                                -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px]
                                border border-white dark:border-gray-800 shadow">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
