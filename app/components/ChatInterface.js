'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import PinnedMessages from './chat/PinnedMessages'

const SearchBar = dynamic(() => import('./chat/SearchBar'), { ssr: false })
const Conversations = dynamic(() => import('./chat/Conversations'), { ssr: false })
const ChatScreen = dynamic(() => import('./chat/ChatScreen'), { ssr: false })
const NotificationIcon = dynamic(() => import('./chat/NotificationIcon'), { ssr: false })
const UserProfile = dynamic(() => import('./chat/UserProfile'), { ssr: false })
const FriendsList = dynamic(() => import('./chat/FriendsList'), { ssr: false })

export default function ChatInterface() {
    const { data: session } = useSession()
    const [selectedUser, setSelectedUser] = useState(null)
    const [conversations, setConversations] = useState([])
    const [socket, setSocket] = useState(null)
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [typingStatus, setTypingStatus] = useState(false)
    const selectedUserRef = useRef(null)

    useEffect(() => {
        if (!session?.user?.id) return
        selectedUserRef.current = selectedUser

        const newSocket = io('http://localhost:3003', {
            path: '/socket.io',
            transports: ['websocket'],
            withCredentials: true,
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
            newSocket.emit('join', `user:${session.user.id}`, session.user.id)
            newSocket.emit('online', { userId: session.user.id })
        })

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
        })

        newSocket.on('message', async (message) => {
            const currentSelectedUser = selectedUserRef.current

            const isCurrentChat =
                currentSelectedUser &&
                (message.senderId === currentSelectedUser.id || message.receiverId === currentSelectedUser.id)

            if (isCurrentChat) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev
                    return [...prev, message]
                })

                // ✅ Auto mark as seen if the incoming message is from the user you're chatting with
                if (message.senderId === currentSelectedUser.id) {
                    try {
                        await fetch('/api/messages/mark-seen', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: currentSelectedUser.id })
                        })

                        // ✅ Refresh conversations to update unread status
                        await fetchFriends()
                    } catch (error) {
                        console.error('Failed to mark message as seen:', error)
                    }
                }
            } else {
                // ✅ Mark this conversation as having unread messages
                setConversations(prev =>
                    prev.map(c =>
                        c.id === message.senderId ? { ...c, unread: true } : c
                    )
                )

                // ✅ Trigger background refresh (optional if above logic already sets unread)
                await fetchFriends()
            }
        })

        newSocket.on('typing:start', (data) => {
            const currentSelectedUser = selectedUserRef.current
            if (currentSelectedUser && data.senderId === currentSelectedUser.id) {
                setTypingStatus(true)
            }
        })

        newSocket.on('typing:stop', (data) => {
            const currentSelectedUser = selectedUserRef.current
            if (currentSelectedUser && data.senderId === currentSelectedUser.id) {
                setTypingStatus(false)
            }
        })

        newSocket.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => [...new Set([...prev, userId])])
        })

        newSocket.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(id => id !== userId))
        })

        const handleBeforeUnload = () => {
            newSocket.emit('offline', {
                userId: session.user.id,
                lastSeen: new Date().toISOString()
            })
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        setSocket(newSocket)

        return () => {
            newSocket.emit('offline', {
                userId: session.user.id,
                lastSeen: new Date().toISOString()
            })

            if (newSocket.connected) {
                newSocket.off('message')
                newSocket.off('typing:start')
                newSocket.off('typing:stop')
                newSocket.off('user:online')
                newSocket.off('user:offline')
                newSocket.disconnect()
            }

            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [session, selectedUser])

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends/list')
            if (!response.ok) throw new Error('Failed to fetch friends')
            const data = await response.json()
            setConversations(data)
            console.log("✅ Updated conversations:", data)
        } catch (err) {
            console.error('Error fetching friends:', err)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            fetchFriends()
            const interval = setInterval(fetchFriends, 5000)
            return () => clearInterval(interval)
        }
    }, [session?.user?.id])

    const handleUserSelect = async (user) => {
        setSelectedUser(user)
        try {
            const response = await fetch(`/api/messages?userId=${user.id}`)
            if (!response.ok) throw new Error('Failed to fetch messages')
            const data = await response.json()
            setMessages(data)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
        await fetch('/api/messages/mark-seen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        })
    }

    const handleSendMessage = async (content) => {
        if (!selectedUser) return
        try {
            const response = await fetch(`/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, receiverId: selectedUser.id })
            })
            if (!response.ok) throw new Error('Failed to send message')
            const message = await response.json()

            socket.emit('chat:message', {
                ...message,
                receiverId: selectedUser.id,
                senderId: session.user.id,
                senderName: session.user.name,
                senderImage: session.user.image
            })

            setMessages(prev => [...prev, { ...message, isSender: true }])
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleTyping = (isTyping) => {
        if (!socket || !selectedUser) return
        const event = isTyping ? 'typing:start' : 'typing:stop'
        socket.emit(event, {
            senderId: session.user.id,
            receiverId: selectedUser.id
        })
    }

    const handleDeleteConversation = async (conversationId) => {
        try {
            const response = await fetch('/api/conversations/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            })

            if (!response.ok) {
                throw new Error('Failed to delete conversation')
            }

            if (selectedUser?.id === conversationId) {
                setSelectedUser(null)
                setMessages([])
            }

            await fetchFriends()
        } catch (error) {
            console.error('Error deleting conversation:', error)
        }
    }

    useEffect(() => {
        if (conversations.length === 0) {
            setSelectedUser(null)
            setMessages([])
        }
    }, [conversations])

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                <div className="flex gap-4 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <NotificationIcon />
                    <SearchBar />
                </div>
                <div>
                    <PinnedMessages
                        conversations={conversations.filter(c => c.isPinned)}
                        onUserSelect={handleUserSelect}
                        refreshConversations={fetchFriends} />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Conversations
                        conversations={conversations}
                        onUserSelect={handleUserSelect}
                        onDeleteConversation={handleDeleteConversation}
                        onlineUsers={onlineUsers}
                        refreshConversations={fetchFriends}
                    />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <UserProfile user={session?.user} />
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedUser ? `Chat with ${selectedUser.name}` : 'Select a conversation'}
                    </h1>
                </div>

                <div className="flex-1 overflow-hidden">
                    {selectedUser ? (
                        <ChatScreen
                            conversation={selectedUser}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                            typingStatus={typingStatus}
                            onlineUsers={onlineUsers}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                Select a conversation to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                <FriendsList onUserSelect={handleUserSelect} onlineUsers={onlineUsers} />
            </div>
        </div>
    )
}

