'use client'

import { useState } from 'react'
import { getConsistentAvatar } from './DefaultAvatars'
import { useNotifications } from '@/app/hooks/useNotifications'

export default function NotificationIcon() {
    const { notifications, error, handleAccept, handleReject } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-zinc-700 dark:hover:bg-opacity-35"
            >
                <svg
                    className="h-6 w-6 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute mt-6 -right-12 w-80 bg-light dark:bg-dark-accent rounded-lg shadow-xl border border-text-secondary-dark border-opacity-30 z-10">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Friend Requests</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending friend requests</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {notifications.map((notification) => {
                                    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(notification.sender.id)
                                    return (
                                        <div
                                            key={notification.id}
                                            className="flex items-center justify-between p-3  rounded-md"
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        src={notification.sender.image || getConsistentAvatar(notification.sender.id)}
                                                        className={`${sizeClass} bg-contain bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                                        alt={notification.sender.name}
                                                        style={{
                                                            backgroundImage: `url(${notification.sender.image || avatarUrl})`,
                                                            backgroundColor,
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.sender.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {notification.sender.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAccept(notification.id)}
                                                    className="p-1 text-xs font-medium bg-green rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <img src="./images/accept.svg" alt="accept" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(notification.id)}
                                                    className="p-1 text-xs font-medium bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <img src="./images/reject.svg" alt="reject" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 