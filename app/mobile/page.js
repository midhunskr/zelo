'use client'

import Conversations from "../components/chat/Conversations";
import PinnedMessages from "../components/chat/PinnedMessages";
import { MobileChatProvider, useMobileChat } from '@/app/context/MobileChatContext';

export default function Chat() {
    const {
        handleUserSelect,
        conversations
    } = useMobileChat();
    return (
        <div className="h-full flex flex-col">
            <MobileChatProvider>
                <PinnedMessages />
                <Conversations conversations={conversations} onUserSelect={handleUserSelect} />
            </MobileChatProvider>
        </div>
    )
}