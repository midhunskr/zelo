'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function FriendsList({ onUserSelect }) {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)
    const { data: session } = useSession()

    const fetchFriends = async () => {
        try {
            console.log('Fetching friends for user:', session?.user?.id)
            const response = await fetch('/api/friends/list')
            if (!response.ok) {
                throw new Error(`Failed to fetch friends: ${response.status}`)
            }
            const data = await response.json()
            console.log('Friends data received:', data)
            setFriends(data)
        } catch (error) {
            console.error('Error fetching friends:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            console.log('Session user ID:', session.user.id)
            fetchFriends()
            const interval = setInterval(fetchFriends, 5000) // Refresh every 5 seconds
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

    console.log('Rendering friends list with:', friends.length, 'friends')

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
                    friends.map((friend) => {
                        console.log('Rendering friend:', friend)
                        return (
                            <div
                                key={friend.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3"
                                onClick={() => onUserSelect(friend)}
                            >
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image
                                        src={friend.image || '/default-avatar.png'}
                                        alt={friend.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{friend.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
} 