'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { useAppStore } from '@/lib/context/StoreContext';

export default function HomePage() {
    const { setSidebarOpen } = useAppStore();

    return (
        <ChatInterface
            chatId={null}
            initialMessages={[]}
            initialChat={null}
            onMenuClick={() => setSidebarOpen(true)}
        />
    );
}
