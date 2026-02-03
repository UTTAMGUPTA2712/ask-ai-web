import { NextResponse } from 'next/server';
import { SendMessage } from '@/lib/application/use-cases/chat/SendMessage';
import { ChatRepository } from '@/lib/infrastructure/repositories/ChatRepository';
import { MessageRepository } from '@/lib/infrastructure/repositories/MessageRepository';
import { CustomGPTRepository } from '@/lib/infrastructure/repositories/CustomGPTRepository';
import { GroqAIService } from '@/lib/infrastructure/services/GroqAIService';
import { authenticate } from '@/lib/infrastructure/middleware/auth';
import { getClientIP } from '@/lib/utils/getClientIP';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Authenticate (optional for guests)
        const user = await authenticate(request);

        // Parse request
        const body = await request.json();
        const { message, chatId, customGPTId, messages: previousMessages } = body;

        // Get guest IP if not authenticated
        const guestIp = user ? null : getClientIP(request);

        // Create dependencies
        const chatRepo = new ChatRepository(supabaseAdmin);
        const messageRepo = new MessageRepository(supabaseAdmin);
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);
        const aiService = new GroqAIService();

        // Execute use case
        const useCase = new SendMessage(chatRepo, messageRepo, customGPTRepo, aiService);
        const result = await useCase.execute({
            message,
            chatId,
            userId: user?.id,
            guestIp,
            customGPTId,
            previousMessages,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
