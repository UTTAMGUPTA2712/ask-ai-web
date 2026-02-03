import { NextResponse } from 'next/server';
import { ChatRepository } from '@/lib/infrastructure/repositories/ChatRepository';
import { authenticate } from '@/lib/infrastructure/middleware/auth';
import { getClientIP } from '@/lib/utils/getClientIP';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const user = await authenticate(request);
        const chatId = params.chatId;

        // Create dependencies
        const chatRepo = new ChatRepository(supabaseAdmin);

        // Get chat
        const chat = await chatRepo.findById(chatId);
        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Verify ownership
        if (user && !chat.isOwnedBy(user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!user) {
            const guestIp = getClientIP(request);
            if (chat.guestIp !== guestIp) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }

        return NextResponse.json({
            chat: {
                id: chat.id,
                title: chat.title,
                created_at: chat.createdAt,
                updated_at: chat.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get chat error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
