'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggler from './ThemeToggler'
import { getConsistentAvatar } from './DefaultAvatars'
import { motion, AnimatePresence } from "framer-motion"

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const searchRef = useRef(null)
    const router = useRouter()
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
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
                setResults(data.users)
                setIsOpen(true)
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            }
        }

        const debounce = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounce)
    }, [query])

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
                const updatedResults = results.map(user =>
                    user.id === userId ? { ...user, invitationStatus: 'PENDING' } : user
                )
                setResults(updatedResults)
            } else {
                if (data.error === 'Friend invitation already exists') {
                    const updatedResults = results.map(user =>
                        user.id === userId ? { ...user, invitationStatus: 'PENDING' } : user
                    )
                    setResults(updatedResults)
                } else {
                    console.error('Friend request failed:', data.error)
                }
            }
        } catch (error) {
            console.error('Error sending friend request:', error)
        }
    }

    const handleUnfriend = async (userId, e) => {
        e.stopPropagation()
        try {
            const res = await fetch(`/api/friends/unfriend/${userId}`, { method: 'DELETE' })
            const data = await res.json()

            if (res.ok) {
                const updatedResults = results.map(user =>
                    user.id === userId ? { ...user, invitationStatus: 'NONE' } : user
                )
                setResults(updatedResults)
            } else {
                console.error('Unfriend failed:', data.error)
            }
        } catch (error) {
            console.error('Error unfriending:', error)
        }
    }

    // Theme toggler
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    return (
        <div className="flex-1" ref={searchRef}>
            <div className="relative rounded-full p-[.4rem] md:p-0 bg-card-light-outer dark:bg-card-dark-outer md:bg-none
                            border border-card-stroke-light dark:border-card-stroke-dark md:border-none flex items-center
                            justify-between">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-[17.5rem] xs:w-[18.4rem] xsm:w-[19.8rem] md:w-full py-3 pl-12 text-sm text-text-secondary-light md:bg-light md:dark:bg-dark-accent md:border
                    md:border-gray-300 rounded-full md:focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 md:dark:text-gray-300
                    md:dark:border-gray-600 bg-inner-surface-light dark:bg-inner-surface-dark 
                    shadow-card-light dark:shadow-card-dark md:shadow-none md:dark:shadow-none border border-card-stroke-light dark:border-card-stroke-dark md:border-none"
                />
                <svg
                    className="absolute md:left-4 md:top-3 top-5 left-6 h-5 w-5 text-text-secondary-light"
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
                <div className='md:hidden flex justify-center items-center w-11 h-11 rounded-full
                            bg-inner-surface-light dark:bg-inner-surface-dark
                            shadow-card-light dark:shadow-card-dark border border-card-stroke-light dark:border-card-stroke-dark md:border-none'>
                    <ThemeToggler theme={theme} onToggle={toggleTheme} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-[10.6rem] left-[1rem] md:top-[9.2rem] md:left-[5rem] z-[9999] w-[22.5rem] md:w-[20rem] mt-4 md:mt-2 bg-light dark:bg-dark-accent
                            rounded-xl md:rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="py-2">
                            {results.map((user) => {
                                const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(user.id, 'w-[3.5rem] h-[3.5rem]')
                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <div
                                            className="flex items-center cursor-pointer flex-1"
                                            onClick={() => handleUserClick(user.id)}
                                        >
                                            <div
                                                src={user.image || getConsistentAvatar(user.id)}
                                                alt={user.name}
                                                className={`${sizeClass} bg-contain bg-top bg-no-repeat w-[3.5rem] h-[3.5rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                                style={{
                                                    backgroundImage: `url(${user.image || avatarUrl})`,
                                                    backgroundColor,
                                                }}
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

                                        {user.invitationStatus === 'FRIEND' ? (
                                            <button
                                                onClick={(e) => handleUnfriend(user.id, e)}
                                                className="ml-2 px-3 py-1 text-xs rounded-full bg-orange text-light hover:bg-red-600"
                                            >
                                                Unfriend
                                            </button>
                                        ) : user.invitationStatus === 'PENDING' ? (
                                            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                Pending
                                            </span>
                                        ) : (
                                            <button
                                                onClick={(e) => handleAddFriend(user.id, e)}
                                                className="ml-2 px-3 py-1 text-xs rounded-full bg-green text-light hover:bg-blue-600"
                                            >
                                                Add Friend
                                            </button>
                                        )}
                                    </div>
                                )

                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}