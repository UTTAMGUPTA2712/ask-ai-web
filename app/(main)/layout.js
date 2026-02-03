'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/context/StoreContext';
import { Sidebar } from '@/components/Sidebar';
import { AuthModal } from '@/components/AuthModal';
import { Toaster } from 'sonner';

export default function MainLayout({ children }) {
    const router = useRouter();
    const [showAuth, setShowAuth] = useState(false);
    const { setUser, sidebarOpen, setSidebarOpen, setIsAuthInitialized } = useAppStore();

    // Auth initialization is now handled in StoreContext
    // We can keep specific side effects here if needed, but the main auth state is global

    const handleGoogleUserCreation = async (user) => {
        try {
            // Check if user exists in our database
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            // If user doesn't exist, create with default password
            if (!existingUser) {
                const session = await supabase.auth.getSession();
                const token = session.data.session?.access_token;

                if (token) {
                    await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata.full_name || user.email.split('@')[0],
                            password: 'Password123', // Default password for Google users
                        }),
                    });
                }
            }
        } catch (error) {
            console.error('Error creating Google user:', error);
        }
    };

    const handleNewChat = () => {
        router.push('/');
        setSidebarOpen(false); // Close sidebar on mobile when starting new chat
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                onNewChat={handleNewChat}
                onAuthClick={() => setShowAuth(true)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
            <AuthModal open={showAuth} onOpenChange={setShowAuth} />
            <Toaster position="top-center" />
        </div>
    );
}
