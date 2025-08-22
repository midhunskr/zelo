'use client'

import { useNotifications } from '@/app/hooks/useNotifications'
import { getConsistentAvatar } from '@/app/components/chat/DefaultAvatars'

export default function MobileNotification() {
    const { notifications, error, handleAccept, handleReject } = useNotifications()

    return (
        <div className="flex flex-col md:items-center rounded-lg items-center h-full
        bg-inner-surface-light dark:bg-inner-surface-dark shadow-card-light dark:shadow-card-dark md:hidden
        border border-card-stroke-light dark:border-card-stroke-dark">
            {error && <p className="text-red-500">{error}</p>}
            {notifications.length === 0 ? (
                <p className="text-text-secondary-light pt-4">No pending friend requests</p>
            ) : (
                notifications.map((n) => {
                    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(n.sender.id)
                    return (
                        <div key={n.id} className="flex w-full items-center justify-between p-3 rounded-lg bg-inner-surface-light dark:bg-inner-surface-dark
                        shadow-card-light dark:shadow-card-dark border border-card-stroke-light dark:border-card-stroke-dark">
                            <div className="flex items-center">
                                <div
                                    className={`${sizeClass} rounded-full bg-contain bg-no-repeat bg-center mr-3`}
                                    style={{
                                        backgroundImage: `url(${n.sender.image || avatarUrl})`,
                                        backgroundColor,
                                    }}
                                />
                                <div>
                                    <p>{n.sender.name}</p>
                                    <p className="text-xs text-gray-500">{n.sender.email}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleAccept(n.id)}
                                    className="p-1 text-xs font-medium bg-green rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <img src="/images/accept.svg" alt="accept" />
                                </button>
                                <button onClick={() => handleReject(n.id)}
                                    className="p-1 text-xs font-medium bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <img src="/images/reject.svg" alt="reject" />
                                </button>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}
