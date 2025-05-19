'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { getConsistentAvatar } from './DefaultAvatars'
const Lottie = dynamic(() => import('lottie-react').then(mod => mod.default), { ssr: false })
import circle from '../../animations/circle-loader.json'


export default function FriendsList({ onUserSelect, onlineUsers, theme }) {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)
    const [hoveredFriendId, setHoveredFriendId] = useState(null)
    const [hoveredUnfriendId, setHoveredUnfriendId] = useState(null);
    const [unfriendConfirmingId, setUnfriendConfirmingId] = useState(null)
    const { data: session } = useSession()
    const [unfriendingId, setUnfriendingId] = useState(null)

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
            setUnfriendingId(friendId)
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
        } finally {
            setUnfriendingId(null) // Hide loading spinner
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
                {/* <p className="text-gray-500 dark:text-gray-400">Loading friends...</p> */}

            </div>
        )
    }

    return (
        <div className='bg-light dark:bg-dark-accent rounded-xl flex flex-col gap-6 p-8 h-full w-72 overflow-y-auto'>
            <div className="">
                <h2 className="text-lg font-semibold text-text-primary-dark dark:text-text-primary-light">Friends</h2>
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
                            className="relative rounded-lg flex items-center justify-between cursor-pointer"
                        // onMouseEnter={() => setHoveredFriendId(friend.id)}
                        // onMouseLeave={() => {
                        //     setHoveredFriendId(null)
                        //     setUnfriendConfirmingId(null)
                        // }}
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
                                    <p className="text-sm font-medium text-text-primary-dark dark:text-text-primary-light">{friend.name}</p>
                                </div>
                            </div>

                            <div className="flex">
                                {/* Message Button */}
                                <button
                                    onClick={() => onUserSelect(friend)}
                                    onMouseEnter={() => setHoveredFriendId(friend.id)}
                                    onMouseLeave={() => setHoveredFriendId(null)}
                                    className="w-10 h-10 text-xs flex items-center justify-center rounded-full transform transition duration-150 ease-in-out hover:scale-150"
                                >
                                    {hoveredFriendId === friend.id ? (
                                        <Image
                                            src={theme === 'light' ? '/animations/chat-light.gif' : '/animations/chat-dark.gif'}
                                            alt="Message"
                                            width={26}
                                            height={26}
                                            className=''
                                        />
                                    ) : (
                                        <Image
                                            src={theme === 'light' ? '/images/chat-light.svg' : '/images/chat-dark.svg'}
                                            alt="Message"
                                            width={20.9}
                                            height={20.9}
                                            className='pt-1'
                                        />
                                    )}
                                </button>

                                {/* Unfriend Button */}
                                {unfriendingId === friend.id ? (
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <Lottie animationData={circle} loop={true} className="w-6 h-6" />
                                    </div>
                                ) : unfriendConfirmingId === friend.id ? (
                                    <div className="absolute inset-0 z-10 flex items-center justify-between space-x-2 bg-light dark:bg-dark-accent rounded-lg ">
                                        <div>
                                            <span className='text-sm text-text-primary-dark dark:text-text-primary-light'>Unfriend {friend.name}?</span>
                                        </div>
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => confirmUnfriend(friend.id)}
                                                className="w-10 h-6 text-xs rounded-full bg-orange text-text-primary-light hover:bg-red-600 transition ease-out duration-300"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setUnfriendConfirmingId(null)}
                                                className="w-10 h-6 text-xs rounded-full bg-gray-300 dark:bg-gray-600 text-text-primary-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleUnfriend(friend.id)}
                                        onMouseEnter={() => setHoveredUnfriendId(friend.id)}
                                        onMouseLeave={() => setHoveredUnfriendId(null)}
                                        className="w-10 h-10 text-xs flex items-center justify-center rounded-full transform transition duration-150 ease-in-out hover:scale-150"
                                    >
                                        {hoveredUnfriendId === friend.id ? (
                                            <Image
                                                src={theme === 'light' ? '/animations/unlink-light.gif' : '/animations/unlink-dark.gif'}
                                                alt="Unfriend"
                                                width={24}
                                                height={24}
                                            />
                                        ) : (
                                            <Image
                                                src={theme === 'light' ? '/images/unlink-light.svg' : '/images/unlink-dark.svg'}
                                                alt="Unfriend"
                                                width={18.9}
                                                height={18.9}
                                            />
                                        )}
                                    </button>
                                )}

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}