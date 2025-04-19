'use client'

import { useState } from 'react'

export default function ConversationList({ conversations = [], selectedId, onSelect }) {
    const [settingsOpen, setSettingsOpen] = useState(null)

    const handleSettingsClick = (e, conversationId) => {
        e.stopPropagation()
        setSettingsOpen(settingsOpen === conversationId ? null : conversationId)
    }

    const handlePin = async (conversationId) => {
        try {
            await fetch('/api/conversations/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })
            // Handle successful pin
        } catch (error) {
            console.error('Error pinning conversation:', error)
        }
        setSettingsOpen(null)
    }

    const handleDelete = async (conversationId) => {
        try {
            await fetch('/api/conversations/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })
            // Handle successful deletion
        } catch (error) {
            console.error('Error deleting conversation:', error)
        }
        setSettingsOpen(null)
    }

    return (
        <div className="space-y-1">
            {conversations.map((conversation) => (
                <div
                    key={conversation.id}
                    className={`relative flex items-center space-x-3 p-3 hover:bg-gray-100 
                              dark:hover:bg-gray-700 cursor-pointer
                              ${selectedId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onClick={() => onSelect(conversation)}
                >
                    <div className="relative">
                        <img
                            src={conversation.avatar || '/default-avatar.png'}
                            alt={conversation.name}
                            className="w-10 h-10 rounded-full"
                        />
                        {conversation.online && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full 
                                         border-2 border-white dark:border-gray-800">
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {conversation.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {conversation.lastMessageTime}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conversation.lastMessage}
                        </div>
                    </div>

                    {/* Settings button */}
                    <button
                        onClick={(e) => handleSettingsClick(e, conversation.id)}
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

                    {/* Settings dropdown */}
                    {settingsOpen === conversation.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                                      border border-gray-200 dark:border-gray-700 z-50"
                            style={{ top: '100%' }}
                        >
                            <div className="py-1">
                                <button
                                    onClick={() => handlePin(conversation.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 
                                             dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                        />
                                    </svg>
                                    Pin conversation
                                </button>
                                <button
                                    onClick={() => handleDelete(conversation.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 
                                             dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Delete conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
} 