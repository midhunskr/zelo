'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import EditProfileModal from './EditProfileModal'
import Image from 'next/image'

export default function UserProfile({ user, getAvatar }) {
    const { data: session } = useSession()
    const currentUser = user || session?.user
    const [modalOpen, setModalOpen] = useState(false)

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setModalOpen(true)}>
                    <Image
                        src={currentUser.image || getAvatar(currentUser.id)}
                        alt={currentUser.name}
                        width={50}
                        height={50}
                        className="w-12 h-12 object-cover rounded-full"
                    />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/signin' })}
                    className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                    Sign Out
                </button>
            </div>

            {modalOpen && (
                <EditProfileModal user={currentUser} onClose={() => setModalOpen(false)} />
            )}
        </>
    )
}