import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function useFriendsList() {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)
    const [hoveredFriendId, setHoveredFriendId] = useState(null)
    const [hoveredUnfriendId, setHoveredUnfriendId] = useState(null)
    const [unfriendConfirmingId, setUnfriendConfirmingId] = useState(null)
    const [unfriendingId, setUnfriendingId] = useState(null)
    const { data: session } = useSession()

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends/list')
            if (!response.ok) {
                throw new Error(`Failed to fetch friends: ${response.status}`)
            }
            const data = await response.json()
            setFriends(data)
        } catch (error) {
            console.error('Error fetching friends:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnfriend = (friendId) => {
        setUnfriendConfirmingId(friendId)
    }

    const confirmUnfriend = async (friendId) => {
        try {
            setUnfriendingId(friendId)
            const res = await fetch(`/api/friends/unfriend/${friendId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error(`Failed to unfriend: ${res.status}`)
            }
            setFriends(prev => prev.filter(f => f.id !== friendId))
            setUnfriendConfirmingId(null)
        } catch (error) {
            console.error('Error unfriending:', error)
        } finally {
            setUnfriendingId(null)
        }
    }

    useEffect(() => {
        let interval
        if (session?.user?.id) {
            fetchFriends()
            interval = setInterval(fetchFriends, 5000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [session?.user?.id])

    return {
        friends,
        loading,
        hoveredFriendId,
        setHoveredFriendId,
        hoveredUnfriendId,
        setHoveredUnfriendId,
        unfriendConfirmingId,
        setUnfriendConfirmingId,
        unfriendingId,
        setUnfriendingId,
        fetchFriends,
        handleUnfriend,
        confirmUnfriend,
        session,
    }
}
