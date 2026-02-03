'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackClient() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                router.push('/');
                return;
            }

            if (data?.session?.user) {
                try {
                    // Sync user to database
                    const user = data.session.user;
                    await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
                        }),
                    });
                } catch (syncError) {
                    console.error('Failed to sync user:', syncError);
                    // Continue to home even if sync fails, user is authenticated in Supabase
                }

                router.push('/');
            } else {
                router.push('/');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Signing you in...</h1>
                <p className="text-muted-foreground">Please wait</p>
            </div>
        </div>
    );
}
