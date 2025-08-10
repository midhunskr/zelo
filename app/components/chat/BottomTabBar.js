'use client'

import { usePathname, useRouter } from 'next/navigation'
import { MessageCircle, Bell, User } from 'lucide-react'

export default function BottomTabBar() {
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        { name: 'Chat', icon: MessageCircle, path: '/' },
        { name: 'Notifications', icon: Bell, path: '/invitations' },
        { name: 'Profile', icon: User, path: '/profile' },
    ]

    return (
        <div className='p-[.4rem] bg-card-light-outer dark:bg-card-dark-outer rounded-full
                        border border-card-stroke-light dark:border-card-stroke-dark md:hidden'>
            <div className="flex items-center justify-around h-16 bg-inner-surface-light dark:bg-inner-surface-dark
                        rounded-full shadow-card-light dark:shadow-card-dark">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => router.push(item.path)}
                        className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors duration-200 ${pathname === item.path
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        {/* {item.name} */}
                    </button>
                ))}
            </div>
        </div>
    )
}