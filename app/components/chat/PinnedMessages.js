'use client'

export default function PinnedMessages({ conversations = [] }) {
    if (conversations.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
                No pinned conversations
            </div>
        )
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
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 
                                 dark:hover:bg-gray-700 cursor-pointer group"
                    >
                        <div className="relative">
                            <img
                                src={conversation.avatar || '/default-avatar.png'}
                                alt={conversation.name}
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full 
                                         border-2 border-white dark:border-gray-800">
                            </span>
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
                                     dark:hover:bg-gray-600 rounded-full transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Handle unpin action
                            }}
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