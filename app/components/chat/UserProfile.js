'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import EditProfileModal from './EditProfileModal'
import { getConsistentAvatar } from './DefaultAvatars'

export default function UserProfile({ user }) {
    const { data: session } = useSession()
    const currentUser = user || session?.user
    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(currentUser.id, 'w-[4rem] h-[4rem] md:w-[3rem]')
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
            <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setModalOpen(true)}>
                    <div
                        className={`${sizeClass} bg-contain bg-top bg-no-repeat md:h-[3rem] rounded-full mr-3`}
                        style={{
                            backgroundImage: `url(${currentUser.image || avatarUrl})`,
                            backgroundColor,
                        }}
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
                <EditProfileModal user={currentUser} onClose={() => setModalOpen(false)}  />
            )}

            <div className='flex md:hidden w-full items-center justify-center'>
                <EditProfileModal user={currentUser}  />
            </div>
        </>
    )
}