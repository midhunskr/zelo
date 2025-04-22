'use client'

import { useState } from 'react'
// import { useSession } from 'next-auth/react'

export default function Conversations({ conversations, onUserSelect, onDeleteConversation, onlineUsers, refreshConversations }) {
    // const { data: session } = useSession()
    const [settingsOpen, setSettingsOpen] = useState(null)

    const handleSettingsClick = (e, conversationId) => {
        e.stopPropagation()
        setSettingsOpen(settingsOpen === conversationId ? null : conversationId)
    }

    const handlePin = async (conversationId) => {
        try {
            const isCurrentlyPinned = conversations.find(c => c.id === conversationId)?.isPinned
            const response = await fetch('/api/conversations/pin', {
                method: isCurrentlyPinned ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })
            if (!response.ok) throw new Error('Failed to update pin status')

            // ✅ Refresh conversations after pin/unpin
            await refreshConversations()

        } catch (error) {
            console.error('Error pinning conversation:', error)
        }
        setSettingsOpen(null)
    }

    // const handleDelete = async (conversationId) => {
    //     await fetch('/api/conversations/delete', {
    //         method: 'DELETE',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ conversationId })
    //     })

    //     if (selectedUser?.id === conversationId) {
    //         setSelectedUser(null)
    //         setMessages([])
    //     }

    //     await fetchFriends()
    // }

    if (conversations.length === 0) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400">
                No conversations yet
            </div>
        )
    }

    return (
        <div className="space-y-2 p-4">
            {conversations.map((friend) => (
                <div
                    key={friend.id}
                    className="relative flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                    onClick={() => onUserSelect(friend)}
                >
                    <div className="relative">
                        <img
                            src={friend.image || '/images/default-avatar.svg'}
                            alt={friend.name}
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        {onlineUsers.includes(friend.id) && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                {friend.name}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {friend.lastMessageTime}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {friend.lastMessage || friend.email}
                        </p>
                    </div>

                    <button
                        onClick={(e) => handleSettingsClick(e, friend.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                    >
                        <svg
                            className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>

                    {settingsOpen === friend.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                            style={{ top: '100%' }}
                        >
                            <div className="py-1">
                                <button
                                    onClick={() => handlePin(friend.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    📌 Pin conversation
                                </button>
                                <button
                                    onClick={() => onDeleteConversation(friend.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    🗑️ Delete conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}