'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useStore } from '@/lib/store/useStore';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { AuthModal } from '@/components/AuthModal';
import { Toaster } from 'sonner';

export default function Home() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setUser } = useStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        handleGoogleUserCreation(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Handle Google login - create user with default password if first time
        if (event === 'SIGNED_IN' && session.user.app_metadata.provider === 'google') {
          await handleGoogleUserCreation(session.user);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        <ChatInterface
          chatId={null}
          initialMessages={[]}
          initialChat={null}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </main>
      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
      <Toaster position="top-center" />
    </div>
  );
}
