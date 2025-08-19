'use client'

import Conversations from "../components/chat/Conversations";
import PinnedMessages from "../components/chat/PinnedMessages";
import { useMobileChat } from '@/app/context/MobileChatContext';

export default function Chat() {
    const {
        handleUserSelect,
        conversations
    } = useMobileChat();
    return (
        <div className="h-full flex flex-col space-y-2">
                <PinnedMessages />
                <Conversations conversations={conversations} onUserSelect={handleUserSelect} />
        </div>
    )
}