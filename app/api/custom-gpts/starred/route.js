import { NextResponse } from 'next/server';
import { CustomGPTRepository } from '@/lib/infrastructure/repositories/CustomGPTRepository';
import { requireAuth } from '@/lib/infrastructure/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const user = await requireAuth(request);

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Get starred GPTs
        const customGPTs = await customGPTRepo.findStarredByUserId(user.id);

        return NextResponse.json({
            customGPTs: customGPTs.map(gpt => ({
                id: gpt.id,
                name: gpt.name,
                description: gpt.description,
                system_prompt: gpt.systemPrompt,
                creator_id: gpt.creatorId,
                creator_name: gpt.creatorName,
                is_public: gpt.isPublic,
                created_at: gpt.createdAt,
                is_starred: true,
            })),
        });
    } catch (error) {
        console.error('Get starred GPTs error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
