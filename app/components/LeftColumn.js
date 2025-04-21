// 'use client'

// import { useState, useEffect } from 'react'
// import { useTheme } from 'next-themes'
// import { useSession } from 'next-auth/react'
// import { motion, AnimatePresence } from 'framer-motion'

// export default function LeftColumn() {
//     const { data: session } = useSession()
//     const [searchQuery, setSearchQuery] = useState('')
//     const [searchResults, setSearchResults] = useState([])
//     const [notifications, setNotifications] = useState([])
//     const [pinnedConversations, setPinnedConversations] = useState([])
//     const [conversations, setConversations] = useState([])
//     const { theme, setTheme } = useTheme()
//     const [showDropdown, setShowDropdown] = useState(false)

//     // Search functionality
//     const handleSearch = async (query) => {
//         setSearchQuery(query)
//         if (!query) {
//             setSearchResults([])
//             return
//         }

//         try {
//             const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
//             const data = await res.json()
//             setSearchResults(data)
//             setShowDropdown(true)
//         } catch (error) {
//             console.error('Search error:', error)
//         }
//     }

//     // Friend invitation handlers
//     const handleAcceptInvitation = async (invitationId) => {
//         try {
//             await fetch(`/api/invitations/${invitationId}/accept`, { method: 'POST' })
//             // Update notifications and conversations
//             fetchNotifications()
//             fetchConversations()
//         } catch (error) {
//             console.error('Error accepting invitation:', error)
//         }
//     }

//     const handleRejectInvitation = async (invitationId) => {
//         try {
//             await fetch(`/api/invitations/${invitationId}/reject`, { method: 'POST' })
//             fetchNotifications()
//         } catch (error) {
//             console.error('Error rejecting invitation:', error)
//         }
//     }

//     // Pin/Unpin conversation
//     const togglePinConversation = async (conversationId) => {
//         try {
//             await fetch(`/api/conversations/${conversationId}/pin`, { method: 'POST' })
//             fetchConversations()
//         } catch (error) {
//             console.error('Error toggling pin:', error)
//         }
//     }

//     // Delete conversation
//     const deleteConversation = async (conversationId) => {
//         try {
//             await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
//             fetchConversations()
//         } catch (error) {
//             console.error('Error deleting conversation:', error)
//         }
//     }

//     return (
//         <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
//             {/* Search Bar */}
//             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                 <div className="relative">
//                     <input
//                         type="text"
//                         placeholder="Search users or conversations..."
//                         value={searchQuery}
//                         onChange={(e) => handleSearch(e.target.value)}
//                         className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                     />
//                     <AnimatePresence>
//                         {showDropdown && searchResults.length > 0 && (
//                             <motion.div
//                                 initial={{ opacity: 0, y: -10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 exit={{ opacity: 0, y: -10 }}
//                                 className="absolute w-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10"
//                             >
//                                 {searchResults.map((result) => (
//                                     <div
//                                         key={result.id}
//                                         className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center justify-between"
//                                     >
//                                         <div className="flex items-center">
//                                             <img
//                                                 src={result.image || '/default-avatar.png'}
//                                                 alt={result.name}
//                                                 className="w-8 h-8 rounded-full mr-3"
//                                             />
//                                             <span className="dark:text-white">{result.name}</span>
//                                         </div>
//                                         <button
//                                             onClick={() => handleAddFriend(result.id)}
//                                             className="text-blue-500 hover:text-blue-600"
//                                         >
//                                             Add Friend
//                                         </button>
//                                     </div>
//                                 ))}
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>
//             </div>

//             {/* Notification Icon */}
//             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                 <div className="relative">
//                     <button
//                         onClick={() => setShowNotifications(!showNotifications)}
//                         className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                     >
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-6 w-6 text-gray-600 dark:text-gray-300"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                             />
//                         </svg>
//                         {notifications.length > 0 && (
//                             <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             {/* Theme Toggler */}
//             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                 <button
//                     onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//                     className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                     {theme === 'dark' ? (
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-6 w-6 text-yellow-500"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
//                             />
//                         </svg>
//                     ) : (
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-6 w-6 text-gray-600"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
//                             />
//                         </svg>
//                     )}
//                 </button>
//             </div>

//             {/* Pinned Messages */}
//             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                 <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
//                     Pinned Conversations
//                 </h3>
//                 <div className="space-y-2">
//                     {pinnedConversations.map((conv) => (
//                         <div
//                             key={conv.id}
//                             className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                         >
//                             <div className="flex items-center">
//                                 <img
//                                     src={conv.image || '/default-avatar.png'}
//                                     alt={conv.name}
//                                     className="w-8 h-8 rounded-full mr-3"
//                                 />
//                                 <div>
//                                     <h4 className="font-semibold dark:text-white">{conv.name}</h4>
//                                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                                         {conv.lastMessage}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => togglePinConversation(conv.id)}
//                                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                             >
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     className="h-5 w-5"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
//                                     />
//                                 </svg>
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Conversation List */}
//             <div className="flex-1 overflow-y-auto">
//                 {conversations.map((conv) => (
//                     <div
//                         key={conv.id}
//                         className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
//                     >
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center">
//                                 <img
//                                     src={conv.image || '/default-avatar.png'}
//                                     alt={conv.name}
//                                     className="w-10 h-10 rounded-full mr-3"
//                                 />
//                                 <div>
//                                     <h4 className="font-bold dark:text-white">{conv.name}</h4>
//                                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                                         {conv.lastMessage}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                                 {conv.time}
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// } 