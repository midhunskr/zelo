'use client'

import { getConsistentAvatar } from "@/app/components/chat/DefaultAvatars";
import { useMobileChat } from "@/app/context/MobileChatContext";
import useFriendsList from "@/app/hooks/useFriendsList";
import Image from "next/image";

export default function MobileFriends() {
    const {
        friends,
        setHoveredFriendId,
        setHoveredUnfriendId,
        unfriendConfirmingId,
        setUnfriendConfirmingId,
        unfriendingId,
        handleUnfriend,
        confirmUnfriend,
    } = useFriendsList();

    const {
        handleUserSelect,
        onlineUsers,
        toggleTheme
    } = useMobileChat();
    return (
        <div className="h-full">
            <div className='h-full flex flex-col gap-6 p-5 md:p-8 overflow-y-auto bg-inner-surface-light dark:bg-inner-surface-dark
            shadow-card-light dark:shadow-card-dark rounded-lg border border-card-stroke-light dark:border-card-stroke-dark'>
                <div className=''>
                    <h2 className="text-lg font-semibold text-text-primary-dark dark:text-text-primary-light">Your Friends</h2>
                </div>
                <div className='flex flex-col gap-5'>
                    {friends.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            No friends yet
                        </div>
                    ) : (
                        friends.map((friend) => {
                            const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(friend.id)
                            return (
                                <div
                                    key={friend.id}
                                    className="relative flex rounded-full items-center justify-between"
                                >
                                    <div className="relative flex items-center">
                                        <div className="relative">
                                            <div
                                                src={friend.image || getConsistentAvatar(friend.id)}
                                                className={`${sizeClass} bg-contain bg-top bg-no-repeat w-[4rem] h-[4rem] md:w-[3rem] md:h-[3rem] rounded-full mr-3`}
                                                alt={friend.name}
                                                style={{
                                                    backgroundImage: `url(${friend.image || avatarUrl})`,
                                                    backgroundColor,
                                                    backgroundPosition: "center -140%",
                                                backgroundSize: "70%",
                                                }}
                                            />
                                            {onlineUsers.includes(friend.id) && (
                                                <span className="absolute top-[0.3rem] w-[.7rem] h-[.7rem] bg-green rounded-full border-2 border-light"></span>
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
                                            className="w-10 h-10 text-xs flex items-center justify-center rounded-full"
                                        >
                                            <Image
                                                src={'/icons/messaging.png'}
                                                alt="Message"
                                                width={34}
                                                height={34}
                                                className='pt-1'
                                            />
                                        </button>

                                        {/* Unfriend Button */}
                                        {unfriendingId === friend.id ? (
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                {/* <Lottie animationData={circle} loop={true} className="w-6 h-6" /> */}
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
                                                className="w-10 h-10 text-xs flex items-center justify-center rounded-full"
                                            >
                                                <Image
                                                    src={'/icons/remove.png'}
                                                    alt="Unfriend"
                                                    width={28}
                                                    height={28}
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )

                        })
                    )}
                </div>
            </div>
        </div>
    )
}