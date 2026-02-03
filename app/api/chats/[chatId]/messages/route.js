import { NextResponse } from 'next/server';
import { GetChatMessages } from '@/lib/application/use-cases/chat/GetChatMessages';
import { ChatRepository } from '@/lib/infrastructure/repositories/ChatRepository';
import { MessageRepository } from '@/lib/infrastructure/repositories/MessageRepository';
import { authenticate } from '@/lib/infrastructure/middleware/auth';
import { getClientIP } from '@/lib/utils/getClientIP';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const user = await authenticate(request);
        const guestIp = user ? null : getClientIP(request);
        const chatId = params.chatId;

        // Create dependencies
        const chatRepo = new ChatRepository(supabaseAdmin);
        const messageRepo = new MessageRepository(supabaseAdmin);

        // Execute use case
        const useCase = new GetChatMessages(chatRepo, messageRepo);
        const result = await useCase.execute({
            chatId,
            userId: user?.id,
            guestIp,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
