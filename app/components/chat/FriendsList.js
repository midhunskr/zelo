'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { getConsistentAvatar } from './DefaultAvatars'
import * as motion from 'motion/react-client'

export default function FriendsList({ onUserSelect, onlineUsers }) {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)
    const [hoveredFriendId, setHoveredFriendId] = useState(null)
    const [unfriendConfirmingId, setUnfriendConfirmingId] = useState(null)
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

    const handleUnfriend = (friendId) => {
        setUnfriendConfirmingId(friendId)
    }

    const confirmUnfriend = async (friendId) => {
        try {
            const res = await fetch(`/api/friends/unfriend/${friendId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error(`Failed to unfriend: ${res.status}`)
            }
            // Remove friend from UI
            setFriends(prev => prev.filter(f => f.id !== friendId))
            setUnfriendConfirmingId(null)
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
        <div className='bg-light dark:bg-dark-accent rounded-xl flex flex-col gap-6 p-8 h-full w-72 overflow-y-auto'>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Friends</h2>
            </div>
            <div className='flex flex-col gap-5'>
                {friends.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        No friends yet
                    </div>
                ) : (
                    friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="rounded-lg flex items-center justify-between "
                            onMouseEnter={() => setHoveredFriendId(friend.id)}
                            onMouseLeave={() => {
                                setHoveredFriendId(null)
                                setUnfriendConfirmingId(null)
                            }}
                        >
                            <div className="relative flex items-center space-x-3">
                                <div className=" h-13 w-13 rounded-full overflow-hidden">
                                    <Image
                                        src={friend.image || getConsistentAvatar(friend.id)}
                                        alt={friend.name}
                                        width={50}
                                        height={50}
                                        className='object-cover'
                                    />
                                    {onlineUsers.includes(friend.id) && (
                                        <span className="absolute top-[0.3rem] w-[.7rem] h-[.7rem] bg-green rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{friend.name}</p>
                                </div>
                            </div>

                            {hoveredFriendId === friend.id && (
                                <div className="flex space-x-2">
                                    {/* Message Button */}
                                    <button
                                        onClick={() => onUserSelect(friend)}
                                        onMouseEnter={() => setHoveredFriendId(friend.id)}
                                        onMouseLeave={() => setHoveredFriendId(null)}
                                        className="w-10 h-10 text-xs flex items-center justify-center rounded-full hover:bg-light-accent dark:hover:bg-zinc-700 dark:hover:bg-opacity-35 transition-colors duration-200"
                                    >
                                        <Image
                                            src={
                                                hoveredFriendId === friend.id
                                                    ? '/images/icons8-comments-96-light-hover.png'
                                                    : '/images/icons8-comments-96-light.png'
                                            }
                                            alt="Message"
                                            width={16}
                                            height={16}
                                        />
                                    </button>

                                    {/* Unfriend Button */}
                                    {unfriendConfirmingId === friend.id ? (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => confirmUnfriend(friend.id)}
                                                className="px-2 py-1 text-xs rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setUnfriendConfirmingId(null)}
                                                className="px-2 py-1 text-xs rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400 transition-colors duration-200"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleUnfriend(friend.id)}
                                            className="px-3 py-1 text-xs rounded-full hover:bg-light dark:hover:bg-zinc-700 dark:hover:bg-opacity-35 transition-colors duration-200"
                                        >
                                            <Image
                                                src="/images/icons8-unfriend-100-light.png"
                                                alt="Unfriend"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}