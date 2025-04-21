'use client'

import { useSession, signOut } from 'next-auth/react'

export default function UserProfile({ user }) {
    const { data: session } = useSession()
    const currentUser = user || session?.user

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
                <img
                    src={currentUser.image || '/default-avatar.png'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {currentUser.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentUser.email}
                    </p>
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
                Sign Out
            </button>
        </div>
    )
} 