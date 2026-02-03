import { NextResponse } from 'next/server';
import { GetUserChats } from '@/lib/application/use-cases/chat/GetUserChats';
import { ChatRepository } from '@/lib/infrastructure/repositories/ChatRepository';
import { authenticate } from '@/lib/infrastructure/middleware/auth';
import { getClientIP } from '@/lib/utils/getClientIP';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Authenticate (optional for guests)
        const user = await authenticate(request);
        const guestIp = user ? null : getClientIP(request);

        // Create dependencies
        const chatRepo = new ChatRepository(supabaseAdmin);

        // Execute use case
        const useCase = new GetUserChats(chatRepo);
        const result = await useCase.execute({
            userId: user?.id,
            guestIp,
        });

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('Get chats error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
