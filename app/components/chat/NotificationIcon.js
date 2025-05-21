'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function NotificationIcon(getAvatar) {
    const { data: session, status } = useSession()
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            fetchNotifications()
        } else {
            if (status === "loading") {
                return null // or a spinner
            }
        }
    }, [session, status])

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/friends/pending')
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch notifications')
            }
            const data = await response.json()
            console.log('Fetched notifications:', data)
            setNotifications(data.receivedInvitations || [])
            setError(null)
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setError(error.message)
        }
    }

    const handleAccept = async (id) => {
        try {
            setError(null)
            console.log('Session status:', status)

            if (status !== 'authenticated' || !session?.user?.id) {
                console.error('No valid session found')
                throw new Error('User not authenticated')
            }

            console.log('Accepting friend request:', {
                id,
                currentUserId: session.user.id,
                session: session
            })

            const response = await fetch(`/api/friends/accept/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Error response:', errorData)
                throw new Error(errorData.error || 'Failed to accept friend request')
            }

            const result = await response.json()
            console.log('Friend request accepted:', result)

            // Refresh notifications after accepting
            await fetchNotifications()
        } catch (error) {
            console.error('Error accepting friend request:', error)
            setError(error.message)
        }
    }

    const handleReject = async (id) => {
        try {
            setError(null)
            const response = await fetch(`/api/friends/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ requestId: id }) // ✅ Include the ID here
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Error data:', errorData)
                throw new Error(errorData.error || 'Failed to reject friend request')
            }

            await fetchNotifications()
        } catch (error) {
            console.error('Error rejecting friend request:', error)
            setError(error.message)
        }
    }


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
                <div className="absolute mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
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
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={notification.sender.image || getAvatar(notification.sender.id)}
                                                    alt={notification.sender.name}
                                                    className="w-8 h-8 rounded-full mr-3"
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
                                                className="px-3 py-1 text-xs font-medium text-white bg-green rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(notification.id)}
                                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 