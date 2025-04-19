'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [pendingRequests, setPendingRequests] = useState({ sent: [], received: [] })
    const searchRef = useRef(null)
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch pending friend requests (sent & received)
    const fetchPendingRequests = async () => {
        try {
            const res = await fetch('/api/friends/pending')
            const data = await res.json()
            setPendingRequests({
                sent: Array.isArray(data.sentInvitations) ? data.sentInvitations : [],
                received: Array.isArray(data.receivedInvitations) ? data.receivedInvitations : []
            })
        } catch (error) {
            console.error('Error fetching pending requests:', error)
            setPendingRequests({ sent: [], received: [] })
        }
    }

    useEffect(() => {
        fetchPendingRequests()
        const interval = setInterval(fetchPendingRequests, 5000)
        return () => clearInterval(interval)
    }, [])

    // Search users as you type
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsOpen(false)
            return
        }

        const searchUsers = async () => {
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()

                const usersWithStatus = data.users.map(user => {
                    const hasPendingRequest =
                        pendingRequests.sent.some(req => req.receiverId === user.id) ||
                        pendingRequests.received.some(req => req.senderId === user.id)

                    return { ...user, hasPendingRequest }
                })

                setResults(usersWithStatus)
                setIsOpen(true)
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            }
        }

        const debounce = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounce)
    }, [query, pendingRequests])

    const handleUserClick = (userId) => {
        setQuery('')
        setResults([])
        setIsOpen(false)
        router.push(`/chat/${userId}`)
    }

    const handleAddFriend = async (userId, e) => {
        e.stopPropagation()
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: userId }),
            })

            const data = await res.json()

            if (res.ok) {
                fetchPendingRequests() // refresh request status
            } else {
                if (data.error === 'Friend invitation already exists') {
                    fetchPendingRequests()
                } else {
                    console.error('Friend request failed:', data.error)
                }
            }
        } catch (error) {
            console.error('Error sending friend request:', error)
        }
    }

    return (
        <div className="relative flex-1" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 pl-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                />
                <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-[23rem] mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="py-2">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <div
                                    className="flex items-center cursor-pointer flex-1"
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <img
                                        src={user.image || '/default-avatar.png'}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleAddFriend(user.id, e)}
                                    disabled={user.hasPendingRequest}
                                    className={`ml-2 px-3 py-1 text-xs rounded-full ${user.hasPendingRequest
                                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {user.hasPendingRequest ? 'Pending' : 'Add Friend'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}