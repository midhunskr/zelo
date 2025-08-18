'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchNotifications()
    }
  }, [session, status])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/friends/pending')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data.receivedInvitations || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAccept = async (id) => {
    try {
      if (status !== 'authenticated' || !session?.user?.id) {
        throw new Error('User not authenticated')
      }
      const res = await fetch(`/api/friends/accept/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to accept friend request')
      await fetchNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/friends/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId: id })
      })
      if (!res.ok) throw new Error('Failed to reject friend request')
      await fetchNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  return { notifications, error, handleAccept, handleReject }
}