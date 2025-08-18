'use client'

import { useMobileChat } from '@/app/context/MobileChatContext'
import { getConsistentAvatar } from './DefaultAvatars'

export default function PinnedMessages(props) {
    const context = useMobileChat()

    // separate pinned from normal conversations
    const conversations = props.conversations ?? context.pinnedConversations ?? []
    const onUserSelect = props.onUserSelect ?? context.handleUserSelect
    const refreshConversations = props.refreshConversations ?? context.fetchPinnedConversations

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
                body: JSON.stringify({ conversationId }),
            })

            const result = await response.json().catch(() => null)
            console.log('Unpin API result', response.status, result)

            if (!response.ok) throw new Error('Failed to unpin conversation')

            // ✅ only refresh pinned list (or full list if desktop passes it in)
            await refreshConversations()
        } catch (error) {
            console.error('Error unpinning conversation:', error)
        }
    }

    return (
        <div className="p-5 flex flex-col h-auto gap-4 md:gap-2 bg-inner-surface-light dark:bg-inner-surface-dark md:bg-light md:dark:bg-dark-accent
                        rounded-lg md:rounded-xl shadow-card-light dark:shadow-card-dark md:shadow-none md:dark:shadow-none">
            <div className="flex gap-3">
                <img src="/images/icons8-pin-24.png" alt="Pinned Message" className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-green dark:text-white mb-2">
                    Pinned Conversations
                </h3>
            </div>
            <div className="space-y-2">
                {conversations.map((conversation) => {
                    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(
                        conversation.id,
                        'w-[5.5rem] h-[7rem]'
                    )
                    return (
                        <div key={conversation.id}>
                            {/* Mobile */}
                            <div
                                className={`${sizeClass} mobileView md:hidden relative max-w-24 gap-2
                                flex flex-col items-center space-x-3 pt-4
                                rounded-lg cursor-pointer transition-colors bg-cover bg-no-repeat
                                border-4 border-white dark:border-text-tertiary-light shadow-md`}
                                style={{
                                    backgroundImage: `url(${conversation.image || avatarUrl})`,
                                    backgroundColor,
                                    backgroundPosition: 'center 200%',
                                    backgroundSize: '80%',
                                }}
                                onClick={() => onUserSelect(conversation)}
                            >
                                <div
                                    className="absolute bottom-0 w-full h-10 rounded-lg"
                                    style={{
                                        background: `linear-gradient(to top, ${backgroundColor}, transparent)`,
                                    }}
                                />

                                <div className="flex-1">
                                    <div className="absolute bottom-1 left-4 font-medium text-light truncate">
                                        {conversation.name}
                                    </div>
                                </div>
                                <button
                                    className="absolute -top-2 -right-2 p-1 bg-green hover:bg-gray-200 
                                    dark:hover:bg-gray-600 rounded-full transition-opacity duration-200"
                                    onClick={(e) => handleUnpin(conversation.id, e)}
                                    title="Unpin conversation"
                                >
                                    <svg
                                        className="w-7 h-7 text-light"
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

                            {/* Desktop */}
                            <div className="desktopView hidden md:flex gap-2 pt-4 space-x-1 cursor-pointer transition-colors">
                                <div
                                    className="w-[4rem] h-[3rem] flex items-center rounded-full bg-cover bg-no-repeat"
                                    style={{
                                        backgroundImage: `url(${conversation.image || avatarUrl})`,
                                        backgroundColor,
                                        backgroundPosition: 'center -140%',
                                        backgroundSize: '70%',
                                    }}
                                    onClick={() => onUserSelect(conversation)}
                                />
                                <div className="flex justify-between w-full">
                                    <div>
                                        <div className="font-medium text-text-primary-dark dark:text-text-primary-light truncate">
                                            {conversation.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {conversation.lastMessage || conversation.email}
                                        </div>
                                    </div>
                                    <button
                                        className="p-1 w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-opacity duration-200"
                                        onClick={(e) => handleUnpin(conversation.id, e)}
                                        title="Unpin conversation"
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-400 dark:text-gray-400"
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
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
