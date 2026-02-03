import { NextResponse } from 'next/server';
import { CreateCustomGPT } from '@/lib/application/use-cases/custom-gpt/CreateCustomGPT';
import { CustomGPTRepository } from '@/lib/infrastructure/repositories/CustomGPTRepository';
import { UserRepository } from '@/lib/infrastructure/repositories/UserRepository';
import { requireAuth } from '@/lib/infrastructure/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Create new custom GPT
export async function POST(request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { name, description, systemPrompt, isPublic } = body;

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);

        // Execute use case
        const useCase = new CreateCustomGPT(customGPTRepo, userRepo);
        const result = await useCase.execute({
            name,
            description,
            systemPrompt,
            isPublic,
            creatorId: user.id,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Create custom GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// GET - Get user's custom GPTs
export async function GET(request) {
    try {
        const user = await requireAuth(request);

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Get user's GPTs
        const customGPTs = await customGPTRepo.findByCreatorId(user.id);

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
            })),
        });
    } catch (error) {
        console.error('Get custom GPTs error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
