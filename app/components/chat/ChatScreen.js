'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getConsistentAvatar } from './DefaultAvatars'
import Image from 'next/image'

export default function ChatScreen({
    conversation,
    messages,
    onSendMessage,
    onTyping,
    typingStatus,
    onlineUsers
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
            return <div className="text-sm text-blue">Typing...</div>
        }
        if (onlineUsers.includes(conversation.id)) {
            return <div className="text-sm text-green">Online</div>
        }
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Last seen {conversation.lastSeen ? new Date(conversation.lastSeen).toLocaleString() : 'recently'}
            </div>
        )
    }

    return (
        <div className="p-4 flex flex-col h-full rounded-xl bg-light dark:bg-dark-accent">
            {/* Chat header */}
            <div className="flex items-center px-4 py-3">
                <div className="flex items-center flex-1 min-w-0">
                    <div className="relative">
                        <Image
                            src={conversation.image || getConsistentAvatar(conversation.id)}
                            alt={conversation.name}
                            className="w-14 h-14 rounded-full object-cover"
                            width={50}
                            height={50}
                        />
                        {/* <Conversations onlineUsers={onlineUsers} /> */}
                        {onlineUsers.includes(conversation.id) && (
                            <span className="absolute top-[0.3rem] w-[.7rem] h-[.7rem] bg-green rounded-full border-2 border-light" />
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-light dark:scrollbar-thumb-zinc-700 dark:scrollbar-track-dark-accent">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.senderId === session?.user?.id
                                    ? 'bg-blue text-white'
                                    : 'bg-light-accent text-dark dark:bg-zinc-700 dark:bg-opacity-35 dark:text-light'
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
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                            handleTyping()
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-text-secondary-light dark:focus:ring-text-tertiary-light bg-light dark:bg-dark-accent text-text-secondary-dark dark:text-text-primary-light"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 flex justify-center items-center bg-blue-500 text-light rounded-full bg-blue focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className='w-[1.4rem] h-[1.4rem] pr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#f1f1f1" d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>
                    </button>
                </div>
            </form>
        </div>
    )
}