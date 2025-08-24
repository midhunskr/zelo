'use client'


import dynamic from 'next/dynamic'
import Image from 'next/image'
import { getConsistentAvatar } from './DefaultAvatars'
const Lottie = dynamic(() => import('lottie-react').then(mod => mod.default), { ssr: false })
import circle from '@/app/animations/circle-loader.json'
import messageLight from '@/app/animations/message-light.json'
import messageDark from '@/app/animations/message-dark.json'
import deleteLight from '@/app/animations/delete-light.json'
import deleteDark from '@/app/animations/delete-dark.json'
import useIsMobile from '@/app/hooks/useIsMobile'
import { useMobileChat } from '@/app/context/MobileChatContext'
import useFriendsList from '@/app/hooks/useFriendsList'


export default function FriendsList() {
    const {
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
    } = useFriendsList();
    const isMobile = useIsMobile();
    const { handleUserSelect, onlineUsers, theme } = useMobileChat();

    if (!session) {
        return (
            <div className="p-4">
                <p className="text-gray-500 dark:text-gray-400">Please sign in to view friends</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-4"></div>
        )
    }

    return (
        <div className='flex md:flex-col gap-2 md:gap-0 md:w-72 h-[6rem] md:h-full p-[.4rem] md:p-0 bg-card-light-outer dark:bg-card-dark-outer md:bg-light md:dark:bg-dark-accent
                        rounded-lg md:rounded-xl md:border-none border border-card-stroke-light dark:border-card-stroke-dark'>
            <div className="hidden">
                <Lottie animationData={messageLight} />
                <Lottie animationData={messageDark} />
                <Lottie animationData={deleteLight} />
                <Lottie animationData={deleteDark} />
            </div>
            {isMobile ? (
                friends.length === 0 ? (
                    <div className='text-center text-text-secondary-light py-5 w-full'>No friends yet</div>
                ) : (
                    friends.map((friend) => {
                        const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(friend.id, 'w-[3rem] h-[3rem]')

                        return (
                            <div
                                key={friend.id}
                                className="relative w-16 h-full flex flex-col justify-center items-center bg-inner-surface-light dark:bg-inner-surface-dark rounded-md
                                            shadow-card-light dark:shadow-card-dark "
                            >
                                {/* Avatar */}
                                <div
                                    className={`${sizeClass} bg-cover bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-md`}
                                    style={{
                                        backgroundImage: `url(${friend.image || avatarUrl})`,
                                        backgroundColor,
                                        backgroundPosition: 'center -40%',
                                        backgroundSize: '66%',
                                    }}
                                />

                                {/* Online indicator */}
                                {onlineUsers.includes(friend.id) && (
                                    <span className="absolute top-0 left-0  w-[.7rem] h-[.7rem] bg-green rounded-full border-2 border-light" />
                                )}

                                {/* Friend name */}
                                <div className="text-xs text-center py-1 text-text-primary-dark dark:text-text-primary-light">
                                    {friend.name?.split(' ')[0]}
                                </div>
                            </div>
                        )
                    })
                )
            ) : (
                <div className='h-full flex flex-col gap-6 p-8 overflow-y-auto bg-light dark:bg-dark-accent rounded-xl border-none'>
                    <div className=''>
                        <h2 className="text-lg font-semibold text-text-primary-dark dark:text-text-primary-light">Friends</h2>
                    </div>
                    <div className='flex flex-col gap-5'>
                        {friends.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                No friends yet
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    className="relative flex rounded-full items-center justify-between"
                                >
                                    <div className="relative flex items-center space-x-3">
                                        <div className="rounded-full overflow-hidden">
                                            <div
                                                style={{ backgroundImage: `url(${friend.image || getConsistentAvatar(friend.id)})` }}
                                                className='object-cover w-12 h-12'
                                            />
                                            {onlineUsers.includes(friend.id) && (
                                                <span className="absolute top-[0.3rem] w-[.7rem] h-[.7rem] bg-green rounded-full border-2 border-light" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary-dark dark:text-text-primary-light">{friend.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        {/* Message Button */}
                                        <button
                                            onClick={() => handleUserSelect(friend)}
                                            onMouseEnter={() => setHoveredFriendId(friend.id)}
                                            onMouseLeave={() => setHoveredFriendId(null)}
                                            className="w-10 h-10 text-xs flex items-center justify-center rounded-full transform transition duration-150 ease-in-out hover:scale-125"
                                        >
                                            {hoveredFriendId === friend.id ? (
                                                <Lottie animationData={theme === 'light' ? messageLight : messageDark} loop={true} className="w-8 h-8" />
                                            ) : (
                                                <Image
                                                    src={theme === 'light' ? '/images/chat-light.svg' : '/images/chat-dark.svg'}
                                                    alt="Message"
                                                    width={24.9}
                                                    height={24.9}
                                                    className='pt-1'
                                                />
                                            )}
                                        </button>

                                        {/* Unfriend Button */}
                                        {unfriendingId === friend.id ? (
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                <Lottie animationData={circle} loop={true} className="w-6 h-6" />
                                            </div>
                                        ) : unfriendConfirmingId === friend.id ? (
                                            <div>
                                                <div className="absolute inset-0 z-10 flex items-center space-x-2 justify-between bg-light dark:bg-dark-accent rounded-md">
                                                    <div>
                                                        <span className='text-sm text-text-primary-dark dark:text-text-primary-light'>Unfriend {friend.name}?</span>
                                                    </div>
                                                    <div className='flex gap-3'>
                                                        <button
                                                            onClick={() => confirmUnfriend(friend.id)}
                                                            className="w-10 h-6 text-xs rounded-full bg-orange text-text-primary-light hover:bg-red-600 transition ease-out duration-300"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setUnfriendConfirmingId(null)}
                                                            className="w-10 h-6 text-xs rounded-full bg-gray-300 dark:bg-gray-600 text-text-primary-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleUnfriend(friend.id)}
                                                onMouseEnter={() => setHoveredUnfriendId(friend.id)}
                                                onMouseLeave={() => setHoveredUnfriendId(null)}
                                                className="w-10 h-10 text-xs flex items-center justify-center rounded-full transform transition duration-150 ease-in-out hover:scale-125"
                                            >
                                                {hoveredUnfriendId === friend.id ? (
                                                    <Lottie animationData={theme === 'light' ? deleteLight : deleteDark} loop={true} className="w-8 h-8" />
                                                ) : (
                                                    <Image
                                                        src={theme === 'light' ? '/images/unlink-light.svg' : '/images/unlink-dark.svg'}
                                                        alt="Unfriend"
                                                        width={20.9}
                                                        height={20.9}
                                                    />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}