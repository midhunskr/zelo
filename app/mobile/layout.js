'use client'

import BottomTabBar from "../components/chat/BottomTabBar";
import FriendsList from "../components/chat/FriendsList";
import SearchBar from "../components/chat/SearchBar";
import { MobileChatProvider } from '@/app/context/MobileChatContext';

export default function Layout({ children }) {
  return (
    <MobileChatProvider>
      <div className="flex flex-col h-full">
        <div className='md:hidden p-4 flex flex-col gap-4 h-screen bg-light-accent dark:bg-dark-accent'>
          <FriendsList />
          <SearchBar />
          <div className='h-full flex flex-col gap-2 p-[.4rem] bg-card-light-outer dark:bg-card-dark-outer rounded-xl border border-card-stroke-light dark:border-card-stroke-dark'>
            {children}
          </div>
          <BottomTabBar />
        </div>
      </div>
    </MobileChatProvider>
  );
}
