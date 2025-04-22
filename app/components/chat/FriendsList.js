'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function FriendsList({ onUserSelect, onlineUsers }) {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)
    const [hoveredFriendId, setHoveredFriendId] = useState(null)
    const { data: session } = useSession()

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends/list')
            if (!response.ok) {
                throw new Error(`Failed to fetch friends: ${response.status}`)
            }
            const data = await response.json()
            setFriends(data)
        } catch (error) {
            console.error('Error fetching friends:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnfriend = async (friendId) => {
        try {
            const res = await fetch(`/api/friends/unfriend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId })
            })
            if (!res.ok) {
                throw new Error('Failed to unfriend')
            }
            console.log('Unfriended:', friendId)
            // Refresh friend list after unfriending
            fetchFriends()
        } catch (error) {
            console.error('Error unfriending:', error)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            fetchFriends()
            const interval = setInterval(fetchFriends, 5000)
            return () => clearInterval(interval)
        }
    }, [session?.user?.id])

    if (!session) {
        return (
            <div className="p-4">
                <p className="text-gray-500 dark:text-gray-400">Please sign in to view friends</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-4">
                <p className="text-gray-500 dark:text-gray-400">Loading friends...</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Friends</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {friends.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No friends yet
                    </div>
                ) : (
                    friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3 justify-between"
                            onMouseEnter={() => setHoveredFriendId(friend.id)}
                            onMouseLeave={() => setHoveredFriendId(null)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image
                                        src={friend.image || '/default-avatar.png'}
                                        alt={friend.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {onlineUsers.includes(friend.id) && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{friend.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                                </div>
                            </div>

                            {hoveredFriendId === friend.id && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onUserSelect(friend)}
                                        className="px-3 py-1 text-xs rounded-full bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        Message
                                    </button>
                                    <button
                                        onClick={() => handleUnfriend(friend.id)}
                                        className="px-3 py-1 text-xs rounded-full bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Unfriend
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}