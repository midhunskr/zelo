'use client'

import { getConsistentAvatar } from './DefaultAvatars'

export default function PinnedMessages({ conversations = [], onUserSelect, refreshConversations }) {
    if (conversations.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-5 hidden">
                No pinned conversations
            </div>
        )
    }

    const handleUnpin = async (conversationId, e) => {
        e.stopPropagation()
        try {
            const response = await fetch('/api/conversations/pin', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })
            if (!response.ok) throw new Error('Failed to unpin conversation')

            await refreshConversations()

        } catch (error) {
            console.error('Error unpinning conversation:', error)
        }
    }

    return (
        <div className="p-5 flex flex-col h-[13rem] gap-2 bg-inner-surface-light dark:bg-inner-surface-dark md:bg-light md:dark:bg-dark-accent
                        rounded-lg md:rounded-xl shadow-card-light dark:shadow-card-dark md:shadow-none md:dark:shadow-none">
            <div className='flex gap-3'>
                <img src="/images/icons8-pin-24.png" alt="Pinned Message" className='w-5 h-5' />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Pinned Conversations
                </h3>
            </div>
            <div className="space-y-2">
                {conversations.map((conversation) => {
                    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(conversation.id, 'w-[6rem] h-[6rem]')
                    return (
                        <div
                            key={conversation.id}
                            className="group flex flex-col gap-2 md:flex-row md:items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors"
                            onClick={() => onUserSelect(conversation)}
                        >
                            <div className="relative">
                                <div
                                    className={`${sizeClass} bg-cover bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                    src={conversation.avatar || getConsistentAvatar(conversation.id)}
                                    alt={conversation.name}
                                    style={{
                                        backgroundImage: `url(${conversation.image || avatarUrl})`,
                                        backgroundColor,
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                    {conversation.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {conversation.lastMessage || conversation.email}
                                </div>
                            </div>
                            <button
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 
                                 dark:hover:bg-gray-600 rounded-full transition-opacity duration-200"
                                onClick={(e) => handleUnpin(conversation.id, e)}
                                title="Unpin conversation"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}