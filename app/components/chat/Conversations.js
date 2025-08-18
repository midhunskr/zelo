'use client'

import { useState } from 'react'
import { getConsistentAvatar } from './DefaultAvatars'
import { useMobileChat } from '@/app/context/MobileChatContext'

export default function Conversations() {
    const [settingsOpen, setSettingsOpen] = useState(null)
    const { conversations, handleUserSelect, onDeleteConversation, onlineUsers, refreshConversations, fetchPinnedConversations, setConversations } = useMobileChat()

    const handleSettingsClick = (e, conversationId) => {
        e.stopPropagation()
        setSettingsOpen(settingsOpen === conversationId ? null : conversationId)
    }

    const handlePin = async (conversationId) => {
        try {
            const isCurrentlyPinned = conversations.find(c => c.id === conversationId)?.isPinned;
            console.log('Pin/Unpin:', conversationId, isCurrentlyPinned);
            const response = await fetch('/api/conversations/pin', {
                method: isCurrentlyPinned ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Failed to update pin status', response.status, text);
                throw new Error('Failed to update pin status');
            }

            await fetchPinnedConversations();
            await refreshConversations();
        } catch (error) {
            console.error('Error pinning conversation:', error);
        }
        setSettingsOpen(null);
    }

    return (
        <div className='h-full'>
            {conversations.length === 0 ?
                <div className='h-full'>
                    <div className="p-4 text-text-secondary-light flex items-center justify-center h-full rounded-lg
                    bg-inner-surface-light dark:bg-inner-surface-dark shadow-card-light dark:shadow-card-dark md:hidden
                    border border-card-stroke-light dark:border-card-stroke-dark">
                        No conversations yet
                    </div>
                    <div className='hidden p-4 text-text-secondary-light md:flex justify-center h-full'>
                        No conversations yet
                    </div>
                </div>
                :
                <div className="space-y-4 p-5 h-full bg-inner-surface-light dark:bg-inner-surface-dark md:bg-light md:dark:bg-dark-accent
                        rounded-lg md:rounded-xl shadow-card-light dark:shadow-card-dark md:shadow-none md:dark:shadow-none
                        border border-card-stroke-light dark:border-card-stroke-dark md:border-none">
                    <div className='flex gap-3'>
                        <img src="/images/icons8-chat-48.png" alt="All Conversation" className='w-5 h-5' />
                        <h3 className="text-sm font-semibold text-purple dark:text-text-primary-light mb-2">
                            Conversations
                        </h3>
                    </div>
                    {conversations.map((friend) => {
                        const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(friend.id)
                        return (
                            <div
                                key={friend.id}
                                className="relative flex items-center p- rounded-lg cursor-pointer transition-colors"
                                onClick={() => handleUserSelect(friend)}
                            >
                                <div className="relative">
                                    <div
                                        className={`${sizeClass} bg-contain bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                        alt={friend.name}
                                        style={{
                                            backgroundImage: `url(${friend.image || avatarUrl})`,
                                            backgroundColor,
                                            backgroundPosition: "center -140%",
                                            backgroundSize: "70%",
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
                                    <svg className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            }

        </div>

    )
}