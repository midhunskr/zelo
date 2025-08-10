'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getConsistentAvatar } from './DefaultAvatars'

export default function Conversations({ conversations, onUserSelect, onDeleteConversation, onlineUsers, refreshConversations, getAvatar }) {
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

            await refreshConversations()
        } catch (error) {
            console.error('Error pinning conversation:', error)
        }
        setSettingsOpen(null)
    }

    if (conversations.length === 0) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                No conversations yet
            </div>
        )
    }

    return (
        <div className="space-y-2 p-5 h-full bg-inner-surface-light dark:bg-inner-surface-dark md:bg-light md:dark:bg-dark-accent
                        rounded-lg md:rounded-xl shadow-card-light dark:shadow-card-dark md:shadow-none md:dark:shadow-none">
                            <div className='flex gap-3'>
                                <img src="/images/icons8-chat-48.png" alt="All Conversation" className='w-5 h-5' />
                                <h3 className="text-sm font-semibold text-text-primary-dark dark:text-text-primary-light mb-2">
                                    Conversations
                                </h3>
                            </div>
            {conversations.map((friend) => {
                const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(friend.id, 'w-[4rem] h-[4rem]')
                return (
                    <div
                        key={friend.id}
                        className="relative flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onUserSelect(friend)}
                    >
                        <div className="relative">
                            <div
                                src={friend.image || getConsistentAvatar(friend.id)}
                                className={`${sizeClass} bg-cover bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                alt={friend.name}
                                style={{
                                    backgroundImage: `url(${friend.image || avatarUrl})`,
                                    backgroundColor,
                                }}
                            />
                            {onlineUsers.includes(friend.id) && (
                                <span className="absolute top-[0.3rem] w-[.7rem] h-[.7rem] bg-green rounded-full border-2 border-light"></span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className={`truncate ${friend.unread ? 'font-extrabold text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white font-medium'}`}>
                                    {friend.name}
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {friend.content}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {friend.lastMessage || friend.email}
                                </p>
                                {friend.unread && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </div>
                        </div>

                        <button
                            onClick={(e) => handleSettingsClick(e, friend.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                        </button>

                        {settingsOpen === friend.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-light dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50" style={{ top: '100%' }}>
                                <div className="py-1">
                                    <button
                                        onClick={() => handlePin(friend.id)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        📌 Pin
                                    </button>
                                    <button
                                        onClick={() => onDeleteConversation(friend.id)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}