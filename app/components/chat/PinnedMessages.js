'use client'

export default function PinnedMessages({ conversations = [], onUserSelect, refreshConversations }) {
    if (conversations.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
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
        <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Pinned Conversations
            </h3>
            <div className="space-y-2">
                {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 
                               dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => onUserSelect(conversation)}
                    >
                        <div className="relative">
                            <img
                                src={conversation.avatar || '/default-avatar.png'}
                                alt={conversation.name}
                                className="w-8 h-8 rounded-full"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {conversation.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {conversation.lastMessage}
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
                ))}
            </div>
        </div>
    )
}