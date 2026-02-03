import { NextResponse } from 'next/server';
import { SyncGoogleUser } from '@/lib/application/use-cases/auth/SyncGoogleUser';
import { UserRepository } from '@/lib/infrastructure/repositories/UserRepository';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, email, name } = body;

        if (!id || !email) {
            return NextResponse.json(
                { error: 'Missing required user fields' },
                { status: 400 }
            );
        }

        // Create dependencies
        const userRepo = new UserRepository(supabaseAdmin);

        // Execute use case
        const useCase = new SyncGoogleUser(userRepo);
        const result = await useCase.execute({ id, email, name });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Sync user error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to sync user' },
            { status: 500 }
        );
    }
}
