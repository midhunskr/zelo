
import dynamic from 'next/dynamic';
import PinnedMessages from './chat/PinnedMessages';
import ThemeToggler from './chat/ThemeToggler';
import { getConsistentAvatar } from './chat/DefaultAvatars';
import BottomTabBar from './chat/BottomTabBar';
import { useMobileChat } from '@/app/context/MobileChatContext';

const Conversations = dynamic(() => import('./chat/Conversations'), { ssr: false });
const ChatScreen = dynamic(() => import('./chat/ChatScreen'), { ssr: false });
const UserProfile = dynamic(() => import('./chat/UserProfile'), { ssr: false });
const FriendsList = dynamic(() => import('./chat/FriendsList'), { ssr: false });
const SearchBar = dynamic(() => import('./chat/SearchBar'), { ssr: false });
const NotificationIcon = dynamic(() => import('./chat/NotificationIcon'), { ssr: false });


export default function ChatDesktopView() {
    const {
        session,
        selectedUser,
        conversations,
        messages,
        onlineUsers,
        typingStatus,
        theme,
        handleUserSelect,
        handleSendMessage,
        handleTyping,
        handleDeleteConversation,
        fetchFriends,
        toggleTheme
    } = useMobileChat();

    return (
        <div className="md:flex md:h-screen md:p-20 bg-light-accent dark:bg-dark">
            <div className='w-80 flex flex-col gap-4'>
                <div className="hidden md:flex gap-2 items-center justify-between rounded-full p-2 bg-light dark:bg-dark-accent">
                    <SearchBar />
                    <div className="flex items-center">
                        <NotificationIcon getAvatar={getConsistentAvatar} />
                        <ThemeToggler theme={theme} onToggle={toggleTheme} />
                    </div>
                </div>
                <div className="h-full rounded-xl hidden md:flex flex-col bg-light dark:bg-dark-accent">
                    <div className='h-auto'>
                        <PinnedMessages
                            conversations={conversations.filter(c => c.isPinned)}
                            onUserSelect={handleUserSelect}
                            refreshConversations={fetchFriends}
                            getAvatar={getConsistentAvatar}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto h-[70%]">
                        <Conversations
                            conversations={conversations}
                            onUserSelect={handleUserSelect}
                            onDeleteConversation={handleDeleteConversation}
                            onlineUsers={onlineUsers}
                            refreshConversations={fetchFriends}
                            getAvatar={getConsistentAvatar}
                        />
                    </div>
                </div>
                <div className="hidden md:block p-2 rounded-full bg-light dark:bg-dark-accent">
                    <UserProfile user={session?.user} getAvatar={getConsistentAvatar} conversations={conversations} />
                </div>
            </div>
            <div className='flex-1 flex flex-col lg:flex-row'>
                <div className="hidden md:block md:flex-1 overflow-hidden px-4">
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
                        <div className="h-full flex items-center bg-light dark:bg-dark-accent rounded-xl justify-center">
                            <p className="text-text-secondary-light">
                                Select a conversation to start chatting
                            </p>
                        </div>
                    )}
                </div>
                <div className="hidden md:flex">
                    <FriendsList />
                </div>
            </div>
        </div>
    );
}
