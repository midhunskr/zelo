// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useSession } from 'next-auth/react'

// export default function ChatScreen({
//     conversation,
//     messages,
//     onSendMessage,
//     onTyping,
//     typingStatus
// }) {
//     const { data: session } = useSession()
//     const [newMessage, setNewMessage] = useState('')
//     const messagesEndRef = useRef(null)
//     const typingTimeoutRef = useRef(null)
//     const TYPING_TIMEOUT = 1000;

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }

//     useEffect(() => {
//         scrollToBottom()
//     }, [messages])

//     const handleSubmit = (e) => {
//         e.preventDefault()
//         if (newMessage.trim()) {
//             onSendMessage(newMessage)
//             setNewMessage('')
//         }
//     }

//     const handleTyping = () => {
//         if (!onTyping) return;
//         onTyping(true);
//         clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => {
//             onTyping(false);
//         }, TYPING_TIMEOUT);
//     };

//     if (!conversation) {
//         return (
//             <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//                 <div className="text-center">
//                     <h3 className="text-xl font-medium text-gray-900 dark:text-white">Welcome to Zelo</h3>
//                     <p className="mt-2 text-gray-500 dark:text-gray-400">
//                         Select a conversation to start chatting
//                     </p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
//             {/* Chat header */}
//             <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                 <div className="flex items-center flex-1 min-w-0">
//                     <div className="relative">
//                         <img
//                             src={conversation.avatar || '/images/default-avatar.svg'}
//                             alt={conversation.name}
//                             className="w-10 h-10 rounded-full"
//                         />
//                         {conversation.online && (
//                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
//                         )}
//                     </div>
//                     <div className="ml-3 flex-1 min-w-0">
//                         <div className="font-medium text-gray-900 dark:text-white truncate">
//                             {conversation.name}
//                         </div>
//                         {typingStatus ? (
//                             <div className="text-sm text-gray-500 dark:text-gray-400">Typing...</div>
//                         ) : conversation.online ? (
//                             <div className="text-sm text-green-500">Online</div>
//                         ) : (
//                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                                 Last seen {conversation.lastSeen}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                 {messages.map((message) => (
//                     <div
//                         key={message.id}
//                         className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
//                     >
//                         <div
//                             className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.senderId === session?.user?.id
//                                 ? 'bg-blue-500 text-white'
//                                 : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
//                                 }`}
//                         >
//                             <p className="text-sm">{message.content}</p>
//                             <p className="text-xs mt-1 opacity-75">
//                                 {message.senderId === session?.user?.id ? 'You' : conversation.name} •{' '}
//                                 {new Date(message.createdAt).toLocaleTimeString()}
//                             </p>
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Message input */}
//             <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
//                 <div className="flex space-x-2">
//                     <input
//                         type="text"
//                         value={newMessage}
//                         onChange={(e) => {
//                             setNewMessage(e.target.value)
//                             handleTyping()
//                         }}
//                         placeholder="Type a message..."
//                         className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
//                      rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
//                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                     />
//                     <button
//                         type="submit"
//                         disabled={!newMessage.trim()}
//                         className="px-4 py-2 bg-blue-500 text-white rounded-lg
//                      hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
//                      disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         Send
//                     </button>
//                 </div>
//             </form>
//         </div>
//     )
// }

'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ChatScreen({
    conversation,
    messages,
    onSendMessage,
    onTyping,
    typingStatus
}) {
    const { data: session } = useSession()
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const TYPING_TIMEOUT = 1000

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage('')
        }
    }

    const handleTyping = () => {
        if (!onTyping) return
        onTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false)
        }, TYPING_TIMEOUT)
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Welcome to Zelo</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Select a conversation to start chatting
                    </p>
                </div>
            </div>
        )
    }

    // Status rendering logic
    const renderStatus = () => {
        if (typingStatus) {
            return <div className="text-sm text-blue-500">Typing...</div>
        }
        if (conversation.online) {
            return <div className="text-sm text-green-500">Online</div>
        }
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Last seen {conversation.lastSeen ? new Date(conversation.lastSeen).toLocaleString() : 'recently'}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Chat header */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-1 min-w-0">
                    <div className="relative">
                        <img
                            src={conversation.avatar || '/images/default-avatar.svg'}
                            alt={conversation.name}
                            className="w-10 h-10 rounded-full"
                        />
                        {conversation.online && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.name}
                        </div>
                        {renderStatus()}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.senderId === session?.user?.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                                {message.senderId === session?.user?.id ? 'You' : conversation.name} •{' '}
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            handleTyping()
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}