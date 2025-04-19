// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import Image from 'next/image'
// import { io } from 'socket.io-client'

// export default function InvitationList() {
//     const { data: session } = useSession()
//     const [invitations, setInvitations] = useState([])
//     const [socket, setSocket] = useState(null)

//     useEffect(() => {
//         const newSocket = io('http://localhost:3003', {
//             path: '/socket.io',
//             transports: ['websocket'],
//             withCredentials: true
//         })

//         newSocket.on('connect', () => {
//             console.log('Socket connected')
//             if (session?.user?.id) {
//                 newSocket.emit('join', `user:${session.user.id}`)
//             }
//         })

//         newSocket.on('FRIEND_REQUEST', (data) => {
//             console.log('Friend request received:', data)
//             fetchInvitations()
//         })

//         newSocket.on('disconnect', () => {
//             console.log('Socket disconnected')
//         })

//         setSocket(newSocket)

//         return () => {
//             newSocket.disconnect()
//         }
//     }, [session])

//     const fetchInvitations = async () => {
//         try {
//             const response = await fetch('/api/friends/pending')
//             const data = await response.json()
//             setInvitations(data)
//         } catch (error) {
//             console.error('Error fetching invitations:', error)
//         }
//     }

//     useEffect(() => {
//         if (session?.user?.id) {
//             fetchInvitations()
//         }
//     }, [session])

//     return (
//         <div className="space-y-8">
//             {/* Received Invitations Section */}
//             <div className="space-y-4">
//                 <h2 className="text-xl font-bold">Friend Requests Received</h2>
//                 {invitations.length === 0 ? (
//                     <p className="text-gray-500">No pending friend requests</p>
//                 ) : (
//                     <div className="space-y-4">
//                         {invitations.map((invitation) => (
//                             <div
//                                 key={invitation.id}
//                                 className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
//                             >
//                                 <div className="flex items-center space-x-4">
//                                     <div className="relative h-10 w-10 rounded-full overflow-hidden">
//                                         <Image
//                                             src={invitation.sender.image || '/default-avatar.png'}
//                                             alt={invitation.sender.name || 'Sender'}
//                                             fill
//                                             className="object-cover"
//                                         />
//                                     </div>
//                                     <div>
//                                         <p className="font-medium">{invitation.sender.name}</p>
//                                         <p className="text-sm text-gray-500">{invitation.sender.email}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center space-x-2">
//                                     <button
//                                         onClick={async () => {
//                                             try {
//                                                 const response = await fetch(`/api/invitations/${invitation.id}`, {
//                                                     method: 'POST',
//                                                     headers: {
//                                                         'Content-Type': 'application/json',
//                                                     },
//                                                     body: JSON.stringify({ action: 'accept' })
//                                                 })
//                                                 if (response.ok) {
//                                                     setInvitations(prev =>
//                                                         prev.filter(inv => inv.id !== invitation.id)
//                                                     )
//                                                 }
//                                             } catch (error) {
//                                                 console.error('Error accepting invitation:', error)
//                                             }
//                                         }}
//                                         className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//                                     >
//                                         Accept
//                                     </button>
//                                     <button
//                                         onClick={async () => {
//                                             try {
//                                                 const response = await fetch(`/api/invitations/${invitation.id}`, {
//                                                     method: 'POST',
//                                                     headers: {
//                                                         'Content-Type': 'application/json',
//                                                     },
//                                                     body: JSON.stringify({ action: 'reject' })
//                                                 })
//                                                 if (response.ok) {
//                                                     setInvitations(prev =>
//                                                         prev.filter(inv => inv.id !== invitation.id)
//                                                     )
//                                                 }
//                                             } catch (error) {
//                                                 console.error('Error rejecting invitation:', error)
//                                             }
//                                         }}
//                                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                                     >
//                                         Reject
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Sent Invitations Section */}
//             <div className="space-y-4">
//                 <h2 className="text-xl font-bold">Friend Requests Sent</h2>
//                 {invitations.length === 0 ? (
//                     <p className="text-gray-500">No sent friend requests</p>
//                 ) : (
//                     <div className="space-y-4">
//                         {invitations.map((invitation) => (
//                             <div
//                                 key={invitation.id}
//                                 className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
//                             >
//                                 <div className="flex items-center space-x-4">
//                                     <div className="relative h-10 w-10 rounded-full overflow-hidden">
//                                         <Image
//                                             src={invitation.receiver.image || '/default-avatar.png'}
//                                             alt={invitation.receiver.name || 'Receiver'}
//                                             fill
//                                             className="object-cover"
//                                         />
//                                     </div>
//                                     <div>
//                                         <p className="font-medium">{invitation.receiver.name}</p>
//                                         <p className="text-sm text-gray-500">{invitation.receiver.email}</p>
//                                     </div>
//                                 </div>
//                                 <div className="text-gray-500">
//                                     Pending
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }



'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { io } from 'socket.io-client'

export default function InvitationList() {
    const { data: session } = useSession()
    const [invitations, setInvitations] = useState([])
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (!session?.user?.id) return

        const newSocket = io('http://localhost:3003', {
            path: '/socket.io',
            transports: ['websocket'],
            withCredentials: true
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
            newSocket.emit('join', `user:${session.user.id}`)
        })

        newSocket.on('friend:invitation', (data) => {
            console.log('Friend request received:', data)
            fetchInvitations()
        })

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected')
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [session])

    const fetchInvitations = async () => {
        try {
            const response = await fetch('/api/friends/pending')
            const data = await response.json()
            setInvitations(data.invitations || [])
        } catch (error) {
            console.error('Error fetching invitations:', error)
        }
    }

    useEffect(() => {
        if (session?.user?.id) {
            fetchInvitations()
        }
    }, [session])

    const receivedInvitations = invitations.filter(inv => inv.receiverId === session?.user?.id)
    const sentInvitations = invitations.filter(inv => inv.senderId === session?.user?.id)

    return (
        <div className="space-y-8">
            {/* Received */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Friend Requests Received</h2>
                {receivedInvitations.length === 0 ? (
                    <p className="text-gray-500">No pending friend requests</p>
                ) : (
                    receivedInvitations.map(invitation => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex items-center space-x-4">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image src={invitation.sender.image || '/default-avatar.png'} alt={invitation.sender.name || 'Sender'} fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-medium">{invitation.sender.name}</p>
                                    <p className="text-sm text-gray-500">{invitation.sender.email}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={async () => await handleAction(invitation.id, 'accept')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Accept</button>
                                <button onClick={async () => await handleAction(invitation.id, 'reject')} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Sent */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Friend Requests Sent</h2>
                {sentInvitations.length === 0 ? (
                    <p className="text-gray-500">No sent friend requests</p>
                ) : (
                    sentInvitations.map(invitation => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex items-center space-x-4">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image src={invitation.receiver.image || '/default-avatar.png'} alt={invitation.receiver.name || 'Receiver'} fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-medium">{invitation.receiver.name}</p>
                                    <p className="text-sm text-gray-500">{invitation.receiver.email}</p>
                                </div>
                            </div>
                            <div className="text-gray-500">Pending</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )

    async function handleAction(id, action) {
        try {
            const response = await fetch(`/api/invitations/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })
            if (response.ok) {
                setInvitations(prev => prev.filter(inv => inv.id !== id))
            }
        } catch (error) {
            console.error(`Error ${action}ing invitation:`, error)
        }
    }
}