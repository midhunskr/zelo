'use client'

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { useCallback } from "react";

const MobileChatContext = createContext();

export function useMobileChat() {
    return useContext(MobileChatContext);
}

export function MobileChatProvider({ children }) {
    const { data: session } = useSession();
    const [selectedUser, setSelectedUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [pinnedConversations, setPinnedConversations] = useState([]);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingStatus, setTypingStatus] = useState(false);
    const selectedUserRef = useRef(null);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        if (!session?.user?.id) return;
        selectedUserRef.current = selectedUser;

        const newSocket = io('http://localhost:3003', {
            path: '/socket.io',
            transports: ['websocket'],
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            newSocket.emit('join', `user:${session.user.id}`, session.user.id);
            newSocket.emit('online', { userId: session.user.id });
        });

        newSocket.on('disconnect', (reason) => { });

        newSocket.on('message:receive', async (message) => {
            const currentSelectedUser = selectedUserRef.current;
            if (currentSelectedUser && (message.senderId === currentSelectedUser.id || message.receiverId === currentSelectedUser.id)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                if (message.senderId === currentSelectedUser.id) {
                    try {
                        await fetch('/api/messages/mark-seen', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: currentSelectedUser.id })
                        });
                        await fetchFriends();
                    } catch (error) { }
                }
            } else {
                setConversations(prev => {
                    if (!prev.length) {
                        return [{
                            id: message.senderId,
                            unread: true,
                            lastMessage: message.content,
                            name: message.sender?.name || 'Unknown',
                            image: message.sender?.image || null,
                        }];
                    }
                    const updated = prev.map(c => {
                        if (c.id === message.senderId) {
                            return { ...c, unread: true, lastMessage: message.content };
                        }
                        return c;
                    });
                    return updated;
                });
                await fetchFriends();
            }
        });

        newSocket.on('typing:start', (data) => {
            const currentSelectedUser = selectedUserRef.current;
            if (currentSelectedUser && data.senderId === currentSelectedUser.id) {
                setTypingStatus(true);
            }
        });

        newSocket.on('typing:stop', (data) => {
            const currentSelectedUser = selectedUserRef.current;
            if (currentSelectedUser && data.senderId === currentSelectedUser.id) {
                setTypingStatus(false);
            }
        });

        newSocket.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => [...new Set([...prev, userId])]);
        });

        newSocket.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        const handleBeforeUnload = () => {
            newSocket.emit('offline', {
                userId: session.user.id,
                lastSeen: new Date().toISOString()
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        setSocket(newSocket);

        return () => {
            newSocket.emit('offline', {
                userId: session.user.id,
                lastSeen: new Date().toISOString()
            });
            if (newSocket.connected) {
                newSocket.off('message');
                newSocket.off('typing:start');
                newSocket.off('typing:stop');
                newSocket.off('user:online');
                newSocket.off('user:offline');
                newSocket.disconnect();
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [session, selectedUser]);

    useEffect(() => {
        if (conversations.length === 0) {
            setSelectedUser(null);
            setMessages([]);
        }
    }, [conversations]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchFriends();
            const interval = setInterval(fetchFriends, 5000);
            return () => clearInterval(interval);
        }
    }, [session?.user?.id]);

    // Fetch pinned conversations once when session is available
    useEffect(() => {
        if (session?.user?.id) {
            fetchPinnedConversations();
        }
    }, [session?.user?.id]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends/list');
            if (!response.ok) throw new Error('Failed to fetch friends');
            const data = await response.json();
            setConversations(data);
        } catch (err) { }
    };

    // ✅ Fetch all conversations
    // const fetchConversations = useCallback(async () => {
    //     try {
    //         const response = await fetch('/api/friends/list')
    //         if (!response.ok) throw new Error('Failed to fetch conversations')
    //         const data = await response.json()
    //         setConversations(data)
    //     } catch (err) {
    //         console.error('Error fetching conversations:', err)
    //     }
    // }, [])

    // ✅ Fetch all Pinned conversations
    const fetchPinnedConversations = async () => {
        try {
            const response = await fetch('/api/conversations/pin')
            if (!response.ok) throw new Error('Failed to fetch pinned conversations')
            const data = await response.json()

            setPinnedConversations(
                data.map((p) => ({
                    id: p.id,                 // conversationId from pinnedConversation
                    name: p.name,            // friend's name
                    email: p.email,          // friend's email
                    image: p.image,          // friend's avatar/image
                    lastMessage: p.lastMessage ?? '', // optional if you track it
                    isPinned: p.isPinned,                 // so UI knows it's pinned
                }))
            )
        } catch (err) {
            console.error('Error fetching pinned conversations:', err)
        }
    }

    // Refresh conversations
    const refreshConversations = useCallback(async () => {
        try {
            const res = await fetch('/api/friends/list')
            if (!res.ok) throw new Error('Failed to fetch conversations')
            const data = await res.json()

            setConversations(
                (Array.isArray(data) ? data : []).map((c) => ({
                    id: c.id,
                    name: c.name ?? '',
                    email: c.email ?? '',
                    image: c.image ?? '',
                    lastMessage: c.lastMessage ?? '',
                    isPinned: c.isPinned ?? false,
                }))
            )
        } catch (err) {
            console.error('Error fetching conversations:', err)
        }
    }, [])

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        try {
            const response = await fetch(`/api/messages?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) { }
        await fetch('/api/messages/mark-seen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
    };

    const handleSendMessage = async (content) => {
        if (!selectedUser) return;
        try {
            const response = await fetch(`/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, receiverId: selectedUser.id })
            });
            if (!response.ok) throw new Error('Failed to send message');
            const message = await response.json();
            socket.emit('chat:message', {
                ...message,
                receiverId: selectedUser.id,
                senderId: session.user.id,
                senderName: session.user.name,
                senderImage: session.user.image
            });
            setMessages(prev => [...prev, { ...message, isSender: true }]);
        } catch (error) { }
    };

    const handleTyping = (isTyping) => {
        if (!socket || !selectedUser) return;
        const event = isTyping ? 'typing:start' : 'typing:stop';
        socket.emit(event, {
            senderId: session.user.id,
            receiverId: selectedUser.id
        });
    };

    const handleDeleteConversation = async (conversationId) => {
        try {
            const response = await fetch('/api/conversations/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            });
            if (!response.ok) {
                throw new Error('Failed to delete conversation');
            }
            if (selectedUser?.id === conversationId) {
                setSelectedUser(null);
                setMessages([]);
            }
            await fetchFriends();
        } catch (error) { }
    };

    return (
        <MobileChatContext.Provider
            value={{
                session,
                selectedUser,
                conversations,
                pinnedConversations,
                messages,
                onlineUsers,
                typingStatus,
                theme,
                handleUserSelect,
                handleSendMessage,
                handleTyping,
                handleDeleteConversation,
                fetchFriends,
                refreshConversations,
                fetchPinnedConversations,
                setConversations,
                setPinnedConversations,
                toggleTheme,
            }}
        >
            {children}
        </MobileChatContext.Provider>
    );
}
