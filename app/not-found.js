'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page
        router.replace('/');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
                <p className="text-muted-foreground">Taking you to the home page</p>
            </div>
        </div>
    );
}
